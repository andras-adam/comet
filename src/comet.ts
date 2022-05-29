import { CometOptions, ServerConfiguration, Body, Method, UseCometOptions, Env, EventHandler } from './types'
import { Event } from './event'
import { Routes } from './routes'
import { applyCorsHeaders } from './cors'
import { getPathParameters } from './utils'


const defaultConfig: ServerConfiguration = {
  name: 'main',
  cookies: {
    decode: decodeURIComponent,
    encode: encodeURIComponent,
    limit: 64
  },
  cors: {
    credentials: false,
    exposedHeaders: [],
    headers: [],
    maxAge: 86400,
    methods: [],
    origins: []
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
      cors: options.cors,
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
    cors: { ...defaultConfig.cors, ...options.cors }
  }
  // Return handler function
  return async (
    request: Request,
    env: unknown,
    ctx: ExecutionContext,
    state?: DurableObjectState
  ): Promise<Response> => {
    try {
      const event = await Event.fromRequest(request, config, env, ctx, state)
      if (event.method === Method.OPTIONS) {
        // Handle preflight requests
        const requestedMethod = event.headers.get('access-control-request-method')
        if (!requestedMethod) return new Response(null, { status: 400 })
        const route = Routes.find(config.name, event.pathname, requestedMethod)
        if (route) {
          applyCorsHeaders(event, { ...config.cors, ...route.cors })
          return new Response(null, { status: 204, headers: event.reply.headers })
        }
      } else {
        // Handle regular requests
        const route = Routes.find(config.name, event.pathname, event.method)
        if (route) {
          applyCorsHeaders(event, { ...config.cors, ...route.cors })
          event.params = getPathParameters(route.pathname, event.pathname)
          for (const preMiddleware of route.before) {
            await preMiddleware(event)
            if (event.reply.sent) break
          }
          if (!event.reply.sent) await route.handler(event)
          for (const postMiddleware of route.after) {
            await postMiddleware(event)
          }
          return await Event.toResponse(event, config)
        }
      }
      return new Response(null, { status: 404 })
    } catch (error) {
      console.error('[Comet] Failed to handle request.', error)
      return new Response(null, { status: 500 })
    }
  }
}
