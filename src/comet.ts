import { Body, CometOptions, Env, EventHandler, Method, ServerConfiguration, UseCometOptions } from './types'
import { Event } from './event'
import { Routes } from './routes'
import { CORS } from './cors'


const defaultConfig: ServerConfiguration = {
  name: 'main',
  cookies: {
    decode: decodeURIComponent,
    encode: encodeURIComponent,
    limit: 64
  }
}

export function useComet<TEnv = Env, TBody = Body>(
  options: UseCometOptions<TEnv, TBody>,
  handler: EventHandler<TEnv, TBody>
) {
  try {
    Routes.register({
      after: options.after ?? [],
      before: options.before ?? [],
      cookies: options.cookies,
      handler,
      method: options.method ? options.method.toUpperCase() as Method : Method.ALL,
      pathname: options.pathname,
      server: options.server ?? defaultConfig.name
    })
  } catch (error) {
    console.error('[Comet] Failed to register a route.', error)
  }
}

export function comet(options: CometOptions) {
  // Construct the server's configuration
  const config: ServerConfiguration = {
    name: options.name ?? defaultConfig.name,
    cookies: { ...defaultConfig.cookies, ...options.cookies },
    cors: options.cors
  }
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
      const route = Routes.find(config.name, pathname, method)
      if (route) {
        config.cookies = { ...config.cookies, ...route.cookies } // fixme overrides config each time
        const event = await Event.fromRequest(request, config, env, ctx, state)
        event.params = Routes.getPathnameParameters(event.pathname, route.pathname)
        const origin = request.headers.get('origin') as string
        event.reply.headers = CORS.getHeaders(config.name, event.pathname, config.cors, isPreflight, origin)
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
      console.error('[Comet] Failed to handle request.', error)
      return new Response(null, { status: 500 })
    }
  }
}
