import { SpanKind, trace } from '@opentelemetry/api'
import { name, version } from '../package.json'
import { Router, RouterOptions } from './router'
import { Data } from './data'
import { Reply } from './reply'
import { getPathnameParameters } from './utils'
import { schemaValidation } from './schemaValidation'
import { Method } from './types'
import { cors, CorsOptions, preflightHandler } from './cors'
import { logger, recordException } from './logger'
import { next } from './middleware'
import type { MiddlewareList } from './middleware'
import type { CookiesOptions } from './cookies'


export interface ServerOptions<
  Before extends MiddlewareList,
  After extends MiddlewareList,
  IsDo extends boolean
> extends RouterOptions {
  name?: string
  durableObject?: IsDo
  before?: Before
  after?: After
  cookies?: CookiesOptions
  cors?: CorsOptions
  dev?: boolean
}

export class Server<
  const SBefore extends MiddlewareList,
  const SAfter extends MiddlewareList,
  const IsDo extends boolean = false
> {

  private readonly router
  public route: Router<SBefore, SAfter, IsDo>['register']
  private readonly tracer = trace.getTracer(name, version)

  constructor(private options: ServerOptions<SBefore, SAfter, IsDo> = {}) {
    this.router = new Router<SBefore, SAfter, IsDo>(options)
    this.route = this.router.register
  }

  public handler = async (
    request: Request,
    env: Environment,
    ctxOrState: IsDo extends true ? DurableObjectState : ExecutionContext
  ) => {
    return this.tracer.startActiveSpan('comet handler', {
      kind: SpanKind.SERVER,
      attributes: {
        name: this.options.name
      }
    }, async span => {

      try {
        // Initialize router
        this.router.init()

        // Construct event from request data, reply, and context / state
        const data = await Data.fromRequest(request, this.options, this.options.name)

        const reply = new Reply()
        const isDurableObject = 'id' in ctxOrState
        const event = {
          ...data, reply, next, isDurableObject,
          ...(isDurableObject ? { state: ctxOrState } : { ctx: ctxOrState })
        }

        const input = { event, env, logger, reply, ...data }

        span.setAttribute('isDurableObject', isDurableObject)

        // Run global before middleware
        if (this.options.before) {
          for (const mw of this.options.before) {
            await this.tracer.startActiveSpan(
              `comet middleware ${mw.name}`, {
                attributes: {
                  type: 'global-before'
                }
              },
              async span => {
                await mw.handler(input)
                span.end()
              }
            )
            if (event.reply.sent) break
          }
        }

        // Run CORS middleware
        if (!event.reply.sent) {
          await this.tracer.startActiveSpan(
            'comet cors middleware', {
              attributes: {
                type: 'global-before'
              }
            },
            async span => {
              await cors(this.options.cors).handler(input)
              span.end()
            }
          )
        }

        // Main logic
        if (!event.reply.sent) {

          await this.tracer.startActiveSpan('comet routing', async span => {

            // Get and validate the compatibility date
            const compatibilityDate = event.headers.get('x-compatibility-date') ?? undefined
            if (compatibilityDate && new Date(compatibilityDate) > new Date() && !this.options.dev) {
              event.reply.badRequest({ message: 'Invalid compatibility date' })
            } else {

              // Find the route
              const route = this.router.find(event.pathname, event.method, compatibilityDate)
              // eslint-disable-next-line unicorn/no-negated-condition
              if (!route) {

                // Use built-in preflight handler for preflight requests, return 404 otherwise
                if (event.method === Method.OPTIONS) {
                  await preflightHandler(this.router, this.options.cors).handler(input)
                } else {
                  event.reply.notFound()
                }

              } else {

                // Set path params on event
                event.params = getPathnameParameters(event.pathname, route.pathname)

                // Schema validation
                if (!event.reply.sent) schemaValidation(route).handler(input)

                // Run local before middleware
                if (route.before) {
                  for (const mw of route.before) {
                    await this.tracer.startActiveSpan(
                      `comet middleware ${mw.name}`, {
                        attributes: {
                          type: 'local-before'
                        }
                      },
                      async span => {
                        await mw.handler(input)
                        span.end()
                      }
                    )
                    if (event.reply.sent) break
                  }
                }

                // Run route handler
                if (!event.reply.sent) {
                  await this.tracer.startActiveSpan(
                    'comet main handler', {
                      attributes: {
                        name: route.name
                      }
                    },
                    async span => {
                      await route.handler(input)
                      span.end()
                    }
                  )
                }

                // Run local after middleware
                if (route.after) {
                  if (isDurableObject) {
                    for (const mw of route.after) {
                      await this.tracer.startActiveSpan(
                        `comet middleware ${mw.name}`, {
                          attributes: {
                            type: 'local-after'
                          }
                        },
                        async span => {
                          await mw.handler(input)
                          span.end()
                        }
                      )
                    }
                  } else {
                    ctxOrState.waitUntil(Promise.allSettled(route.after.map(async mw => {
                      const span = this.tracer.startSpan(`comet middleware ${mw.name}`, {
                        attributes: {
                          type: 'local-after'
                        }
                      })
                      await mw.handler(input)
                      span.end()
                    })))
                  }
                }
              }
            }
            span.end()
          })
        }

        // Run global after middleware
        if (this.options.after) {
          if (isDurableObject) {
            for (const mw of this.options.after) {
              await this.tracer.startActiveSpan(
                `comet middleware ${mw.name}`, {
                  attributes: {
                    type: 'global-after'
                  }
                },
                async span => {
                  await mw.handler(input)
                  span.end()
                }
              )
            }
          } else {
            ctxOrState.waitUntil(Promise.allSettled(this.options.after.map(async mw => {
              const span = this.tracer.startSpan(`comet middleware ${mw.name}`, {
                attributes: {
                  type: 'global-after'
                }
              })
              await mw.handler(input)
              span.end()
            })))
          }
        }

        // Construct response from reply
        span.end()
        return await Reply.toResponse(event.reply, this.options)
      } catch (error) {
        recordException('[Comet] Failed to handle request.')
        recordException(error)
        span.end()
        return new Response(null, { status: 500 })
      }
    })
  }

}

export function server<
  const SBefore extends MiddlewareList,
  const SAfter extends MiddlewareList,
  const IsDo extends boolean = false
>(options?: ServerOptions<SBefore, SAfter, IsDo>) {
  return new Server(options)
}
