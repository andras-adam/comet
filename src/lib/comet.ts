import { Method, PostMiddleware, PreMiddleware, ValidMethod, Handler } from './types'
import { getPathParameters, toSafeMethod, toSafePathname } from './utils'
import { Event } from './event'
import { Route } from './route'


const routes: Record<string, Record<string, Route>> = {}

interface UseCometOptions {
  method: ValidMethod
  pathname: string
  before?: PreMiddleware[]
  after?: PostMiddleware[]
}

// Find a registered route by the provided pathname and method
function getMatchingRoute(searchPathname: string, searchMethod: Method) {
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

export function useComet(options: UseCometOptions, handler: Handler) {
  try {
    const { method: unsafeMethod, pathname: unsafePathname, before, after } = options
    // Get safe method and pathname
    const safeMethod = toSafeMethod(unsafeMethod)
    const safePathname = toSafePathname(unsafePathname)
    // Skip route and show warning if route will be unreachable
    const foundRoute = getMatchingRoute(safePathname, safeMethod)
    if (foundRoute) {
      const { pathname: foundPathname, method: foundMethod } = foundRoute
      console.warn(`[Comet] Skipping route '${safeMethod} ${safePathname}' as it will be unreachable due to the already registered route '${foundMethod} ${foundPathname}'.`)
      return
    }
    // Add the route to the routes if it doesn't yet exist
    if (!routes[safePathname]) routes[safePathname] = {}
    // Register route
    routes[safePathname][safeMethod] = new Route(safeMethod, safePathname, handler, before, after)
  } catch (error) {
    console.error('[Comet] Failed to register a route', error)
  }
}

export async function handle(request: Request): Promise<Response> {
  try {
    const event = await Event.fromRequest(request)
    const route = getMatchingRoute(event.pathname, event.method)
    if (route) {
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
    console.error('[Comet] Failed to handle request', error)
    return new Response(null, { status: 500 })
  }
}
