import { SpanKind, trace } from '@opentelemetry/api'
import { name, version } from '../package.json'
import { Router, type RouterOptions } from './router'
import { Data } from './data'
import { Reply } from './reply'
import { getPathnameParameters } from './utils'
import { schemaValidation } from './schemaValidation'
import { Method } from './types'
import { cors, type CorsOptions, preflightHandler } from './cors'
import { logger, recordException, type Logger } from './logger'
import {
  next,
  type MiddlewareList,
  type MiddlewareHandler,
  type Middleware
} from './middleware'
import type { CookiesOptions } from './cookies'
import { CometError, CometErrorHandler, type ErrorHandler, ErrorType } from './error'


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
  errorHandler?: ErrorHandler<Before>
  dev?: boolean
}

export class Server<
  const SBefore extends MiddlewareList,
  const SAfter extends MiddlewareList,
  const IsDo extends boolean = false
> {

  private readonly router
  public route: Router<SBefore, SAfter, IsDo>['register']

  constructor(private options: ServerOptions<SBefore, SAfter, IsDo> = {}) {
    this.router = new Router<SBefore, SAfter, IsDo>(options)
    this.route = this.router.register
  }

  public handler = async (
    request: Request,
    env: Environment,
    ctxOrState: IsDo extends true ? DurableObjectState : ExecutionContext
  ) => {
    return trace.getTracer(name, version).startActiveSpan('Comet Handler', {
      kind: SpanKind.SERVER,
      attributes: {
        name: this.options.name
      }
    }, async span => {

      let input: { event: any; env: Environment; logger: Logger }

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

        input = { event, env, logger }

        span.setAttribute('comet.server.durable_object', isDurableObject)

        // Run global before middleware
        if (this.options.before) {
          for (const mw of this.options.before) {
            await trace.getTracer(name, version).startActiveSpan(
              `Comet Middleware${mw.name ? ` ${mw.name}` : ''}`, {
                attributes: {
                  'comet.mw.name': mw.name,
                  'comet.mw.type': 'global-before'
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
          await trace.getTracer(name, version).startActiveSpan(
            'Comet CORS Middleware', {
              attributes: {
                'comet.mw.name': 'CORS',
                'comet.mw.type': 'global-before',
                'comet.mw.cors.origin': event.headers.get('origin') ?? undefined,
                'comet.mw.cors.method': event.method
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

          await trace.getTracer(name, version).startActiveSpan('Comet Routing', {
            attributes: {
              'comet.routing.compatibility_date': event.headers.get('x-compatibility-date') ?? undefined,
              'comet.routing.pathname': event.pathname,
              'comet.routing.method': event.method
            }
          },
          async span => {

            // Get and validate the compatibility date
            const compatibilityDate = event.headers.get('x-compatibility-date') ?? undefined
            if (compatibilityDate && new Date(compatibilityDate) > new Date() && !this.options.dev) {
              throw new CometError(ErrorType.InvalidCompatibilityDate)
            } else {

              // Find the route
              const { route, exact } = this.router.find(event.pathname, event.method, compatibilityDate)
              // eslint-disable-next-line unicorn/no-negated-condition
              if (!route) {

                // Use built-in preflight handler for preflight requests, call error handler otherwise
                if (event.method === Method.OPTIONS) {
                  await preflightHandler(this.router, this.options.cors).handler(input)
                } else {
                  throw new CometError(ErrorType.NotFound)
                }

              } else {
                if (!exact) {
                  throw new CometError(ErrorType.MethodNotAllowed)
                } else {
                  // Set path params on event
                  event.params = getPathnameParameters(event.pathname, route.pathname)

                  // Schema validation
                  if (!event.reply.sent) await schemaValidation(route).handler(input)

                  // Run local before middleware
                  if (route.before) {
                    for (const mw of route.before) {
                      await trace.getTracer(name, version).startActiveSpan(
                        `Comet Middleware${mw.name ? ` ${mw.name}` : ''}`, {
                          attributes: {
                            'comet.mw.name': mw.name,
                            'comet.mw.type': 'local-before'
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
                    await trace.getTracer(name, version).startActiveSpan(
                      'Comet Main Handler', {
                        attributes: {
                          'comet.route.name': route.name,
                          'comet.route.pathname': route.pathname,
                          'comet.route.compatibility_date': route.compatibilityDate,
                          'comet.route.has_body_schema': !!route.schemas.body,
                          'comet.route.has_query_schema': !!route.schemas.query,
                          'comet.route.has_params_schema': !!route.schemas.params,
                          'comet.route.method': route.method
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
                        await trace.getTracer(name, version).startActiveSpan(
                          `Comet Middleware${mw.name ? ` ${mw.name}` : ''}`, {
                            attributes: {
                              'comet.mw.name': mw.name,
                              'comet.mw.type': 'local-after'
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
                        const span = trace.getTracer(name, version).startSpan(`Comet Middleware${mw.name ? ` ${mw.name}` : ''}`, {
                          attributes: {
                            'comet.mw.name': mw.name,
                            'comet.mw.type': 'local-after'
                          }
                        })
                        await mw.handler(input)
                        span.end()
                      })))
                    }
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
              await trace.getTracer(name, version).startActiveSpan(
                `Comet Middleware${mw.name ? ` ${mw.name}` : ''}`, {
                  attributes: {
                    'comet.mw.name': mw.name,
                    'comet.mw.type': 'global-after'
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
              const span = trace.getTracer(name, version).startSpan(`Comet Middleware${mw.name ? ` ${mw.name}` : ''}`, {
                attributes: {
                  'comet.mw.name': mw.name,
                  'comet.mw.type': 'global-after'
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

        return await trace.getTracer(name, version).startActiveSpan('comet error handler', async span => {

          const response = CometErrorHandler.handle(input, error, this.options)
          span.end()

          return response
        })
      }
    })
  }

  public static getRouter<
    Before extends MiddlewareList,
    After extends MiddlewareList,
    IsDo extends boolean
  >(server: Server<Before, After, IsDo>): Router<Before, After, IsDo> {
    return server.router
  }
}

export function server<
  const SBefore extends MiddlewareList,
  const SAfter extends MiddlewareList,
  const IsDo extends boolean = false
>(options?: ServerOptions<SBefore, SAfter, IsDo>) {
  return new Server(options)
}
