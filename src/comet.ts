import { Method, Configuration } from './types'
import { Event } from './event'
import { Routes } from './routes'
import { CORS } from './cors'
import { getPathnameParameters } from './utils'
import { cometLogger, setLogger } from './logger'


export interface CometOptions extends Omit<Partial<Configuration>, 'server'> {
  name?: string
}

export function comet(options: CometOptions) {
  // Construct the server's configuration
  const config: Configuration = {
    server: options.name ?? 'main',
    cookies: options.cookies,
    logger: options.logger ?? console,
    cors: options.cors,
    prefix: options.prefix
  }
  // Initialize routes
  Routes.init(config.server)
  // Initialize logger
  setLogger(config.logger)
  // Return handler function
  return async (
    request: Request,
    env: unknown,
    ctx: ExecutionContext,
    state?: DurableObjectState
  ): Promise<Response> => {
    try {
      const pathname = new URL(request.url).pathname
      const isPreflight = request.method === Method.OPTIONS
      const method = isPreflight
        ? request.headers.get('access-control-request-method') as Method
        : request.method as Method
      const compatibilityDate = request.headers.get('x-compatibility-date') as string
      const route = Routes.find(config.server, pathname, method, compatibilityDate, config.prefix)
      if (route) {
        const event = await Event.fromRequest(config, request, env, ctx, state)
        event.params = getPathnameParameters(event.pathname, route.pathname)
        const origin = request.headers.get('origin') as string
        event.reply.headers = CORS.getHeaders(config.server, event.pathname, config.cors, isPreflight, origin)
        if (isPreflight) {
          event.reply.noContent()
        } else {
          for (const preMiddleware of route.before) {
            await preMiddleware(event)
            if (event.reply.sent) break
          }
          if (!event.reply.sent) await route.handler(event)
          for (const postMiddleware of route.after) {
            await postMiddleware(event)
          }
        }
        return await Event.toResponse(event, config)
      }
      return new Response(null, { status: 404 })
    } catch (error) {
      cometLogger.error('[Comet] Failed to handle request.', error)
      return new Response(null, { status: 500 })
    }
  }
}
