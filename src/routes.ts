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

  // Registry mapping routes to a server, pathname and method
  private static registry: Record<string, Record<string, Record<string, Route>>> = {}

  // Register a new route to a server, pathname and method
  public static register(route: Route) {
    const { server, pathname, method } = route
    if (method === Method.OPTIONS) {
      console.warn(`[Comet] Skipping route '${method} ${pathname}', please consult the guide on how CORS can be configured via Comet.`)
      return
    }
    try {
      new URLPattern(pathname, BASE_URL)
    } catch (error) {
      console.error(`[Comet] Failed to set up route '${method} ${pathname}' due to an invalid pathname pattern.`, error)
      return
    }
    if (!this.registry[server]) this.registry[server] = {}
    if (!this.registry[server][pathname]) this.registry[server][pathname] = {}
    if (this.registry[server][pathname][method]) {
      console.warn(`[Comet] A route has already been registered for the path '${method} ${pathname}'.`)
      return
    }
    this.registry[server][pathname][method] = route
  }

  // Find a route by server, pathname and method
  public static find(server: string, pathname: string, method: Method): Route | undefined {
    for (const currentPathname in this.registry[server]) {
      const doPathnamesMatch = new URLPattern(currentPathname, BASE_URL).test(pathname, BASE_URL)
      if (!doPathnamesMatch) continue
      for (const currentMethod in this.registry[server][currentPathname]) {
        const doMethodsMatch = currentMethod === method || currentMethod === Method.ALL
        if (doMethodsMatch) return this.registry[server][currentPathname][currentMethod]
      }
    }
  }

  // Get the pathname parameters from a pathname based on a template pathname
  public static getPathnameParameters(pathname: string, template: string): Params {
    const result = new URLPattern(template, BASE_URL).exec(pathname, BASE_URL)
    return result?.pathname?.groups ?? {}
  }

}
