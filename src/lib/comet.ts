import { Method, PostMiddleware, PreMiddleware, ValidMethod, Handler } from './types'


interface Route {
  method: Method
  pathname: string
  before: PreMiddleware[]
  after: PostMiddleware[]
  handler: Handler
}

const routes: Record<string, Record<string, Route>> = {}

interface UseCometOptions {
  method: ValidMethod
  pathname: string
  before?: PreMiddleware[]
  after?: PostMiddleware[]
}

// Find a registered handler for the provided pathname and method
function findHandlerFor(searchPathname: string, searchMethod: Method) {
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
  const { method: rawMethod, pathname: rawPathname, before, after } = options
  // Get safe pathname and method
  const safeMethod = Method[rawMethod.toUpperCase() as keyof typeof Method]
  const safePathname = rawPathname.trim().replace(/^([^/])/, '/$1').replace(/\/$/, '')
  // Skip route and show warning if route will be unreachable
  const foundHandler = findHandlerFor(safePathname, safeMethod)
  if (foundHandler) {
    const { pathname: foundPathname, method: foundMethod } = foundHandler
    console.warn(`[Comet] Skipping route '${safeMethod} ${safePathname}' as it will be unreachable due to the already registered route '${foundMethod} ${foundPathname}'.`)
    return
  }
  // Add the route to the routes if it doesn't yet exist
  if (!routes[safePathname]) routes[safePathname] = {}
  // Register route
  routes[safePathname][safeMethod] = {
    after: after || [],
    before: before || [],
    handler,
    method: safeMethod,
    pathname: safePathname
  }
}
