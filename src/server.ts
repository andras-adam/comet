import { MiddlewareList } from './middleware'
import { Router, RouterOptions } from './router'
import { CookiesOptions } from './cookies'
import { Data } from './data'
import { Reply } from './reply'
import { getPathnameParameters } from './utils'
import { schemaValidation } from './schemaValidation'
import { Method } from './types'
import { cors, CorsOptions, preflightHandler } from './cors'
import { Logger, LoggerOptions } from './logger'
import { OpenApi, OpenApiOptions, routeToOpenApiOperation } from './openapi'


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
  }

  public handler = async (request: Request, env: Environment, ctxOrState: IsDo extends true ? DurableObjectState : ExecutionContext) => {
    try {
      // Initialize router
      this.router.init()

      // Construct event from request data, reply, and context / state
      const data = await Data.fromRequest(request, this.options, this.logger)
      const reply = new Reply(this.logger)
      const isDurableObject = 'id' in ctxOrState
      const event = { ...data, reply, request, env, isDurableObject, ...(isDurableObject ? { state: ctxOrState } : { ctx: ctxOrState }), logger: this.logger }

      // Run global before middleware
      if (this.options.before) {
        for (const mw of this.options.before) {
          await mw.handler(event)
          if (event.reply.sent) break
        }
      }

      // Run CORS middleware
      if (!event.reply.sent) await cors(this.options.cors).handler(event)

      // Main logic
      if (!event.reply.sent) {

        // Get and validate the compatibility date
        const compatibilityDate = event.headers.get('x-compatibility-date') ?? undefined
        if (compatibilityDate && new Date(compatibilityDate) > new Date()) {
          event.reply.badRequest({ message: 'Invalid compatibility date' })
        } else {

          // Find the route
          const route = this.router.find(event.pathname, event.method, compatibilityDate)
          if (!route) {

            // Use built-in preflight handler for preflight requests, return 404 otherwise
            if (event.method === Method.OPTIONS) {
              await preflightHandler(this.router, this.options.cors).handler(event)
            } else {
              event.reply.notFound()
            }

          } else {

            // Set path params on event
            event.params = getPathnameParameters(event.pathname, route.pathname)

            // Schema validation
            if (!event.reply.sent) schemaValidation(route).handler(event)

            // Run local before middleware
            if (route.before) {
              for (const mw of route.before) {
                await mw.handler(event)
                if (event.reply.sent) break
              }
            }

            // Run route handler
            if (!event.reply.sent) await route.handler(event)

            // Run local after middleware
            if (route.after) {
              for (const mw of route.after) {
                await mw.handler(event)
              }
            }

          }
        }
      }

      // Run local after middleware
      if (this.options.after) {
        for (const mw of this.options.after) {
          await mw.handler(event)
        }
      }

      // Construct response from reply
      return await Reply.toResponse(event.reply, this.options, this.logger)
    } catch (error) {
      this.logger.error('[Comet] Failed to handle request.', error instanceof Error ? error.message : error)
      return new Response(null, { status: 500 })
    }
  }

  public openapi = async (openApiOptions: OpenApiOptions, compatibilityDate = `${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`): Promise<OpenApi> => {
    const methods: Record<Exclude<Method, Method.ALL>, Lowercase<Method>> = {
      [Method.GET]: 'get',
      [Method.PUT]: 'put',
      [Method.POST]: 'post',
      [Method.DELETE]: 'delete',
      [Method.OPTIONS]: 'options',
      [Method.HEAD]: 'head',
      [Method.PATCH]: 'patch',
      [Method.TRACE]: 'trace',
      [Method.CONNECT]: 'connect'
    }

    const paths: OpenApi['paths'] = Object.fromEntries(this.router.getRoutes().map(route => {
      return [
        (route.pathname.startsWith('/') ? route.pathname : `/${route.pathname}`) as `/${string}`,
        Object.fromEntries(Object.entries(methods).map(([ cometMethod, openApiMethod ]) => {
          const operation = routeToOpenApiOperation(this.router.find(route.pathname, cometMethod, compatibilityDate))
          return [
            openApiMethod,
            operation
          ]
        }).filter(([ t ]) => t !== undefined))
      ]
    }))

    return { ...openApiOptions, paths, openapi: '3.1.0' }
  }
}

export function server<
  const SBefore extends MiddlewareList,
  const SAfter extends MiddlewareList,
  const IsDo extends boolean = false
>(options?: ServerOptions<SBefore, SAfter, IsDo>) {
  return new Server(options)
}
