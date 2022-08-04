import { Method, Configuration } from './types'
import { Event } from './event'
import { Routes } from './routes'
import { CORS } from './cors'
import { getPathnameParameters } from './utils'
import { cometLogger, setLogger } from './logger'
import { Middlewares } from './middlewares'


export interface CometOptions extends Omit<Partial<Configuration>, 'server'> {
  name?: string
}

export function comet(options: CometOptions) {
  // Construct the server's configuration
  const config: Configuration = {
    server: options.name ?? 'main',
    cookies: options.cookies,
    logger: options.logger ?? console,
    loglevel: options.loglevel ?? 'debug',
    cors: options.cors,
    prefix: options.prefix
  }
  // Initialize routes
  Routes.init(config.server)
  // Initialize logger
  setLogger(config.logger, config.loglevel)
  // Return handler function
  return async (
    request: Request,
    env: unknown,
    ctx: ExecutionContext,
    state?: DurableObjectState
  ): Promise<Response> => {
    try {
      // Construct event from request
      const event = await Event.fromRequest(config, request, env, ctx, state)
      const isPreflight = event.method === Method.OPTIONS
      const method = isPreflight
        ? event.headers.get('access-control-request-method') as Method
        : event.method as Method
      const origin = event.headers.get('origin') as string
      // Run global before middlewares
      for (const mw of Middlewares.getBefore(config.server)) {
        await mw.handler(event)
        if (event.reply.sent) break
      }
      // Main logic
      if (!event.reply.sent) {
        // Get and validate the compatibility date
        const compatibilityDate = event.headers.get('x-compatibility-date') as string
        if (compatibilityDate && new Date(compatibilityDate) > new Date()) {
          event.reply.badRequest({ message: 'Invalid compatibility date' })
        } else {
          // Find route
          const route = Routes.find(config.server, event.pathname, method, compatibilityDate, config.prefix)
          if (!route) {
            event.reply.notFound()
          } else {
            event.reply.headers = CORS.getHeaders(config.server, event.pathname, config.cors, isPreflight, origin)
            if (isPreflight) {
              event.reply.noContent()
            } else {
              event.params = getPathnameParameters(event.pathname, route.pathname, config.prefix)
              for (const mw of route.before) {
                await mw(event)
                if (event.reply.sent) break
              }
              if (!event.reply.sent) await route.handler(event)
              for (const mw of route.after) {
                await mw(event)
              }
            }
          }
        }
      }
      // Run global after middlewares
      for (const mw of Middlewares.getAfter(config.server)) {
        await mw.handler(event)
      }
      // Construct response from event
      return await Event.toResponse(event, config)
    } catch (error) {
      cometLogger.error('[Comet] Failed to handle request.', error)
      return new Response(null, { status: 500 })
    }
  }
}
