import { CorsOptions, Handler, Method, PostMiddleware, PreMiddleware } from './types'


export interface Route {
  after: PostMiddleware[]
  before: PreMiddleware[]
  cors?: Partial<CorsOptions>
  handler: Handler
  method: Method
  pathname: string
  server: string
}

export class Routes {

  // Registered routes
  private static routes: Record<string, Record<string, Record<string, Route>>> = {}

  // Register a new route
  public static register(route: Route) {
    const { server, pathname, method } = route
    if (method === Method.OPTIONS) {
      console.warn(`[Comet] Skipping route '${method} ${pathname}', please consult the guide to learn how to configure CORS with Comet.`)
      return
    }
    const blockingRoute = Routes.find(server, pathname, method)
    if (blockingRoute) {
      const { pathname: blockingPathname, method: blockingMethod } = blockingRoute
      console.warn(`[Comet] Skipping route '${method} ${pathname}' as it will be unreachable due to the already registered route '${blockingMethod} ${blockingPathname}'.`)
      return
    }
    if (!this.routes[server]) this.routes[server] = {}
    if (!this.routes[server][pathname]) this.routes[server][pathname] = {}
    if (!this.routes[server][pathname][method]) this.routes[server][pathname][method] = { ...route }
  }

  // Find a route by server, pathname, and method
  public static find(server: string, pathname: string, method: string): Route | undefined {
    if (!this.routes[server]) return undefined
    const searchPathnameSegments = pathname.split('/').map(s => s.startsWith(':') ? ':' : s)
    for (const currentPathname in this.routes[server]) {
      const currentPathnameSegments = currentPathname.split('/').map(s => s.startsWith(':') ? ':' : s)
      if (currentPathnameSegments.length !== searchPathnameSegments.length) continue
      const doPathnamesMatch = currentPathnameSegments.every((currentPathnameSegment, index) => (
        currentPathnameSegment === ':' || currentPathnameSegment === searchPathnameSegments[index]
      ))
      if (!doPathnamesMatch) continue
      for (const currentMethod in this.routes[server][currentPathname]) {
        const doMethodsMatch = currentMethod === method || currentMethod === Method.ALL
        if (doMethodsMatch) return this.routes[server][currentPathname][currentMethod]
      }
    }
  }

}
