import { MiddlewareList } from './middleware'
import { Router, RouterOptions } from './router'
import { CookiesOptions } from './cookies'
import { Data } from './data'
import { Reply } from './reply'
import { getPathnameParameters } from './utils'


export interface ServerOptions<
  Before extends MiddlewareList,
  After extends MiddlewareList,
  IsDo extends boolean
> extends RouterOptions {
  durableObject?: IsDo
  before?: Before
  after?: After
  cookies?: CookiesOptions
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

  //
  public handler = async (request: Request, env: Environment, ctxOrState: IsDo extends true ? DurableObjectState : ExecutionContext) => {
    try {
      // Initialize router
      this.router.init()

      // Construct event from request data, reply, and context / state
      const data = await Data.fromRequest(request, this.options)
      const reply = new Reply()
      const isDurableObject = 'id' in ctxOrState
      const event = { ...data, reply, request, env, isDurableObject, ...(isDurableObject ? { state: ctxOrState } : { ctx: ctxOrState }) }

      // Run global before middleware
      if (this.options.before) {
        for (const mw of this.options.before) {
          await mw.handler(event)
          if (event.reply.sent) break
        }
      }

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
            event.reply.notFound()
          } else {

            // Set path params on event
            event.params = getPathnameParameters(event.pathname, route.pathname, this.options.prefix)

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
      return await Reply.toResponse(event.reply, this.options)
    } catch (error) {
      console.error('[Comet] Failed to handle request.', error instanceof Error ? error.message : error)
      return new Response(null, { status: 500 })
    }
  }

}

export function server<
  const SBefore extends MiddlewareList,
  const SAfter extends MiddlewareList,
  const IsDo extends boolean = false
>(options?: ServerOptions<SBefore, SAfter, IsDo>) {
  return new Server(options)
}
