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
  type Middleware,
  type MiddlewareHandler
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

      let input: { event: any; env: Environment; logger: Logger }

      const calledMiddleware = new Set<MiddlewareHandler>()

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

        span.setAttribute('isDurableObject', isDurableObject)

        // Run global before middleware
        await this.handleMiddleware({
          middleware: this.options.before,
          called: calledMiddleware,
          input,
          type: 'global-before'
        })

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
                await this.handleMiddleware({
                  middleware: route.before,
                  called: calledMiddleware,
                  input,
                  type: 'local-before'
                })

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
                await this.handleMiddleware({
                  middleware: route.after,
                  called: calledMiddleware,
                  input,
                  type: 'local-after'
                })
              }
            }

            span.end()
          })
        }

        // Run global after middleware
        await this.handleMiddleware({
          middleware: this.options.after,
          called: calledMiddleware,
          input,
          type: 'global-after'
        })

        // Construct response from reply
        span.end()

        return await Reply.toResponse(event.reply, this.options)
      } catch (error) {
        recordException('[Comet] Failed to handle request.')
        recordException(error)
        span.end()

        return await this.tracer.startActiveSpan('comet error handler', async span => {

          // Run global after middleware, as those mostly contain cleanups, analytics, logging, etc.
          // That would be useful to have if an error occurs earlier on.
          // This relies on the internal deduplication of called middleware, so if the error is thrown in a global-after
          // Middleware, it will not be called again.
          await this.handleMiddleware({
            middleware: this.options.after,
            called: calledMiddleware,
            input,
            type: 'global-after'
          })

          const response = CometErrorHandler.handle(input, error, this.options)
          span.end()

          return response
        })
      }
    })
  }

  private async handleMiddleware({
    middleware,
    called,
    input,
    type
  }: {
    called: Set<Middleware<any>['handler']>
    middleware: readonly Middleware<any>[] | undefined
    input: Parameters<MiddlewareHandler>[0]
    type: 'global-before' | 'local-before' | 'local-after' | 'global-after'
  }) {
    if (!middleware) return

    for (const mw of middleware) {
      if ((type === 'global-before' || type === 'local-before') && input.event.reply.sent) {
        return
      }

      await this.runMiddleware({
        mw,
        called,
        input,
        type
      })
    }
  }

  private async runMiddleware({
    mw,
    called,
    input,
    type
  }: {
    mw: Middleware<any>
    called: Set<Middleware<any>['handler']>
    input: Parameters<MiddlewareHandler>[0]
    type: 'global-before' | 'local-before' | 'local-after' | 'global-after'
  }) {

    // Prevent middleware from being called twice
    // Add before actually calling to prevent infinite loops
    if (called.has(mw.handler)) return
    called.add(mw.handler)

    await this.handleMiddleware({
      middleware: mw.requires,
      called,
      input,
      type
    })

    if ((type === 'global-before' || type === 'local-before') && input.event.reply.sent) {
      return
    }

    await this.tracer.startActiveSpan(
      typeof mw.name === 'string' ? `comet middleware ${mw.name}` : 'comet middleware', {
        attributes: {
          type
        }
      },
      async span => {
        await mw.handler(input)
        span.end()
      }
    )
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
