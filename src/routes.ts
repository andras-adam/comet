import { CookiesOptions, EventHandler, Method, Params } from './types'
import { BASE_URL } from './utils'


export interface Route {
  after: EventHandler[]
  before: EventHandler[]
  cookies?: Partial<CookiesOptions>
  handler: EventHandler
  method: Method
  pathname: string
  server: string
}

export class Routes {

  // Registered routes
  private static routes: Route[] = []

  // Register a new route
  public static register(route: Route) {
    const { server, pathname, method } = route
    if (method === Method.OPTIONS) {
      console.warn(`[Comet] Skipping route '${method} ${pathname}', please consult the guide on how CORS can be configured via Comet.`)
      return
    }
    try {
      new URLPattern(pathname, BASE_URl)
    } catch (error) {
      console.error(`[Comet] Failed to set up route '${method} ${pathname}' due to an invalid pathname pattern.`, error)
      return
    }
    const blockingRoute = this.find(server, pathname, method)
    if (blockingRoute) {
      const { pathname: blockingPathname, method: blockingMethod } = blockingRoute
      console.warn(`[Comet] Skipping route '${method} ${pathname}' as it will be unreachable due to the already registered route '${blockingMethod} ${blockingPathname}'.`)
      return
    }
    this.routes.push(route)
  }

  // Find a route by server, pathname and method
  public static find(server: string, pathname: string, method: Method): Route | undefined {
    for (const currentRoute of this.routes) {
      if (currentRoute.server !== server) continue
      const doPathnamesMatch = new URLPattern(currentRoute.pathname, BASE_URl).test(pathname, BASE_URl)
      const doMethodsMatch = currentRoute.method === method || currentRoute.method === Method.ALL
      if (doPathnamesMatch && doMethodsMatch) return currentRoute
    }
  }

  // Get the pathname parameters from a pathname based on a template pathname
  public static getPathnameParameters(pathname: string, template: string): Params {
    const result = new URLPattern(template, BASE_URl).exec(pathname, BASE_URl)
    return result?.pathname?.groups ?? {}
  }

}
