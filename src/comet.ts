import { Configuration } from './types'
import { Event } from './event'
import { Routes } from './routes'
import { getPathnameParameters } from './utils'
import { cometLogger, setLogger } from './logger'
import { Middlewares } from './middlewares'
import { cors } from './middleware/cors'
import { schemaValidation } from './middleware/schemaValidation'


export interface CometOptions extends Omit<Partial<Configuration>, 'server'> {
  name?: string
}

export function comet(options?: CometOptions) {
  // Construct the server's configuration
  const config: Configuration = {
    cookies: options?.cookies,
    cors: options?.cors,
    logger: options?.logger ?? console,
    loglevel: options?.loglevel ?? 'debug',
    prefix: options?.prefix,
    server: options?.name ?? 'main'
  }
  // Initialize routes
  Routes.init(config.server)
  // Initialize logger
  setLogger(config.logger, config.loglevel)
  // Return handler function
  return async (
    request: Request,
    env: Environment,
    ctx: ExecutionContext,
    state?: DurableObjectState
  ): Promise<Response> => {
    try {
      // Construct event from request
      const event = await Event.fromRequest(config, request, env, ctx, state)
      // Run global before middlewares
      for (const mw of Middlewares.getBefore(config.server)) {
        await mw.handler(event)
        if (event.reply.sent) break
      }
      // Run special global middleware
      if (!event.reply.sent) cors(event)
      // Main logic
      if (!event.reply.sent) {
        // Get and validate the compatibility date
        const compatibilityDate = event.headers.get('x-compatibility-date') ?? undefined
        if (compatibilityDate && new Date(compatibilityDate) > new Date()) {
          event.reply.badRequest({ message: 'Invalid compatibility date' })
        } else {
          // Find route
          const route = Routes.find(config.server, event.pathname, event.method, compatibilityDate, config.prefix)
          if (!route) {
            event.reply.notFound()
          } else {
            // Set the route and path parameters on the event
            event.route = route
            event.params = getPathnameParameters(event.pathname, route.pathname, config.prefix)
            // Schema validation
            if (!event.reply.sent) schemaValidation(event)
            // Route middleware and handler
            if (!event.reply.sent) {
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
      cometLogger.error('[Comet] Failed to handle request.', error instanceof Error ? error.message : error)
      return new Response(null, { status: 500 })
    }
  }
}
