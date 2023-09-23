import { Router, RouterOptions, Route } from './router'
import { Data } from './data'
import { Reply } from './reply'
import { getPathnameParameters } from './utils'
import { schemaValidation } from './schemaValidation'
import { Method } from './types'
import { cors, CorsOptions, preflightHandler } from './cors'
import { Logger, LoggerOptions } from './logger'
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
  logger?: LoggerOptions
}

export class Server<
  const SBefore extends MiddlewareList,
  const SAfter extends MiddlewareList,
  const IsDo extends boolean = false
> {

  private readonly logger
  private readonly router
  public route: Router<SBefore, SAfter, IsDo>['register']

  constructor(private options: ServerOptions<SBefore, SAfter, IsDo> = {}) {
    this.logger = new Logger(options.logger)
    this.router = new Router<SBefore, SAfter, IsDo>(options, this.logger)
    this.route = this.router.register
    //this.openapi = function(){}
  }

  public handler = async (
    request: Request,
    env: Environment,
    ctxOrState: IsDo extends true ? DurableObjectState : ExecutionContext
  ) => {
    try {
      // Initialize router
      this.router.init()

      // Construct event from request data, reply, and context / state
      const data = await Data.fromRequest(request, this.options, this.logger, this.options.name)
      const reply = new Reply(this.logger)
      const isDurableObject = 'id' in ctxOrState
      const event = {
        ...data, reply, next, isDurableObject,
        ...(isDurableObject ? { state: ctxOrState } : { ctx: ctxOrState })
      }

      const input = { event, env, logger: this.logger }

      // Run global before middleware
      if (this.options.before) {
        for (const mw of this.options.before) {
          await mw.handler(input)
          if (event.reply.sent) break
        }
      }

      // Run CORS middleware
      if (!event.reply.sent) await cors(this.options.cors).handler(input)

      // Main logic
      if (!event.reply.sent) {

        // Get and validate the compatibility date
        const compatibilityDate = event.headers.get('x-compatibility-date') ?? undefined
        if (compatibilityDate && new Date(compatibilityDate) > new Date()) {
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
                await mw.handler(input)
                if (event.reply.sent) break
              }
            }

            // Run route handler
            if (!event.reply.sent) await route.handler(input)

            // Run local after middleware
            if (route.after) {
              for (const mw of route.after) {
                await mw.handler(input)
              }
            }

          }
        }
      }

      // Run local after middleware
      if (this.options.after) {
        for (const mw of this.options.after) {
          await mw.handler(input)
        }
      }

      // Construct response from reply
      return await Reply.toResponse(event.reply, this.options, this.logger)
    } catch (error) {
      this.logger.error('[Comet] Failed to handle request.', error instanceof Error ? error.message : error)
      return new Response(null, { status: 500 })
    }
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
