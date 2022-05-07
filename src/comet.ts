import { CometOptions, Configuration, Handler, IBody, Method, UseCometOptions } from './types'
import { getPathParameters, toSafeMethod, toSafePathname } from './utils'
import { Event } from './event'
import { Route } from './route'


const config: Configuration = {
  cors: {
    origins: [],
    headers: [],
    methods: [],
    maxAge: 86400
  }
}

const routes: Record<string, Record<string, Route>> = {}

// Find a registered route by the provided method and pathname
function getMatchingRoute(searchMethod: Method, searchPathname: string) {
  const searchPathnameSegments = searchPathname.split('/').map(s => s.startsWith(':') ? ':' : s)
  for (const currentPathname in routes) {
    const currentPathnameSegments = currentPathname.split('/').map(s => s.startsWith(':') ? ':' : s)
    if (currentPathnameSegments.length !== searchPathnameSegments.length) continue
    const doPathnamesMatch = currentPathnameSegments.every((currentPathnameSegment, index) => (
      currentPathnameSegment === ':' || currentPathnameSegment === searchPathnameSegments[index]
    ))
    if (doPathnamesMatch) {
      for (const currentMethod in routes[currentPathname]) {
        const doMethodsMatch = currentMethod === searchMethod || currentMethod === Method.ALL
        if (doMethodsMatch) return routes[currentPathname][currentMethod]
      }
    }
  }
}

export function useComet<TBody = IBody>(options: UseCometOptions<TBody>, handler: Handler<TBody>) {
  try {
    const { method: unsafeMethod, pathname: unsafePathname, before, after, cors } = options
    // Get safe method and pathname
    const safeMethod = toSafeMethod(unsafeMethod ?? Method.ALL)
    const safePathname = toSafePathname(unsafePathname)
    // Disallow using the OPTIONS method as CORS will be handled by default
    if (safeMethod === Method.OPTIONS) {
      console.warn(`[Comet] Skipping route '${safeMethod} ${safePathname}', please use the 'cors' option on 'useComet' instead.`)
      return
    }
    // Skip route and show warning if route will be unreachable
    const foundRoute = getMatchingRoute(safeMethod, safePathname)
    if (foundRoute) {
      const { pathname: foundPathname, method: foundMethod } = foundRoute
      console.warn(`[Comet] Skipping route '${safeMethod} ${safePathname}' as it will be unreachable due to the already registered route '${foundMethod} ${foundPathname}'.`)
      return
    }
    // Add the route to the routes if it doesn't yet exist
    if (!routes[safePathname]) routes[safePathname] = {}
    // Register route
    routes[safePathname][safeMethod] = new Route(safeMethod, safePathname, handler, before, after, cors)
  } catch (error) {
    console.error('[Comet] Failed to register a route.', error)
  }
}

export function applyCorsHeaders(event: Event, route: Route) {
  const origin = event.headers.get('origin')
  if (origin) {
    // Allowed origins
    const allowedOriginsRaw = route.cors?.origins ?? config.cors.origins
    const allowedOrigins = Array.isArray(allowedOriginsRaw) ? allowedOriginsRaw : allowedOriginsRaw.split(',').map(s => s.trim())
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      event.reply.headers.set('access-control-allow-origin', origin)
      event.reply.headers.append('vary', 'origin')
    }
  }
  if (event.method === Method.OPTIONS) {
    // Allowed headers
    const allowedHeadersRaw = route.cors?.headers ?? config.cors.headers
    const allowedHeaders = Array.isArray(allowedHeadersRaw) ? allowedHeadersRaw : allowedHeadersRaw.split(',').map(s => s.trim())
    if (allowedHeaders.length > 0) event.reply.headers.set('access-control-allow-headers', allowedHeaders.join(','))
    // Allowed methods
    const allowedMethodsRaw = route.cors?.methods ?? config.cors.methods
    const allowedMethods = Array.isArray(allowedMethodsRaw) ? allowedMethodsRaw : allowedMethodsRaw.split(',').map(s => s.trim())
    if (allowedMethods.length > 0) event.reply.headers.set('access-control-allow-methods', allowedMethods.join(','))
    // Max age
    const maxAge = route.cors?.maxAge ?? config.cors.maxAge
    event.reply.headers.set('access-control-max-age', maxAge.toString())
    // Content length
    event.reply.headers.set('content-length', '0')
  }
}

export async function handle(
  request: Request,
  env: Environment,
  ctx: ExecutionContext,
  state?: DurableObjectState
): Promise<Response> {
  try {
    const event = await Event.fromRequest(request, env, ctx, state)
    // Handle preflight requests
    if (event.method === Method.OPTIONS) {
      const requestedMethod = event.headers.get('Access-Control-Request-Method')
      if (!requestedMethod) return new Response(null, { status: 400 })
      const requestedRoute = getMatchingRoute(toSafeMethod(requestedMethod), event.pathname)
      if (!requestedRoute) return new Response(null, { status: 404 })
      applyCorsHeaders(event, requestedRoute)
      return new Response(null, { status: 204, headers: event.reply.headers })
    }
    // Handle regular requests
    const route = getMatchingRoute(event.method, event.pathname)
    if (route) {
      applyCorsHeaders(event, route)
      event.params = getPathParameters(route.pathname, event.pathname)
      for (const preMiddleware of route.before) {
        await preMiddleware(event)
        if (event.replyData) break
      }
      if (!event.replyData) await route.handler(event)
      for (const postMiddleware of route.after) {
        await postMiddleware(event)
      }
      return await Event.toResponse(event)
    }
    return new Response(null, { status: 404 })
  } catch (error) {
    console.error('[Comet] Failed to handle request.', error)
    return new Response(null, { status: 500 })
  }
}

export function comet(options: CometOptions) {
  if (options?.cors?.origins) config.cors.origins = options.cors.origins
  if (options?.cors?.headers) config.cors.headers = options.cors.headers
  if (options?.cors?.methods) config.cors.methods = options.cors.methods
  if (options?.cors?.maxAge) config.cors.maxAge = options.cors.maxAge
  return handle
}
