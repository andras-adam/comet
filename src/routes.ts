import { EventHandler, Method, Params, Configuration } from './types'
import { BASE_URL } from './utils'


// Check a compatibility date against another one
export function compareCompatibilityDates(check?: string, against?: string) {
  if (!against) return true // Checking anything against a default will match
  if (!check) return false // Checking nothing against a non-default will not match
  return new Date(check) >= new Date(against) // Checking a newer date against an older one will match
}

export interface Route {
  after: EventHandler[]
  before: EventHandler[]
  compatibilityDate?: string
  handler: EventHandler
  method: Method
  name: string
  pathname: string
  server: string
}

export class Routes {

  // Registry mapping routes to a server, pathname and method
  private static registry: Record<string, Record<string, Record<string, Route[]>>> = {}

  // Register a new route to a server, pathname and method
  public static register(route: Route) {
    const { server, pathname, method, name, compatibilityDate } = route
    if (method === Method.OPTIONS) {
      console.warn(`[Comet] Skipping route '${name}', please consult the guide on how CORS can be configured via Comet.`)
      return
    }
    try {
      new URLPattern(pathname, BASE_URL)
    } catch (error) {
      console.error(`[Comet] Failed to set up route '${name}' due to an invalid pathname pattern.`, error)
      return
    }
    if (typeof compatibilityDate === 'string' && Number.isNaN(new Date(compatibilityDate).valueOf())) {
      console.error(`[Comet] Failed to set up route '${name}' due to an invalid compatibility date.`)
      return
    }
    if (!this.registry[server]) this.registry[server] = {}
    if (!this.registry[server][pathname]) this.registry[server][pathname] = {}
    if (!this.registry[server][pathname][method]) this.registry[server][pathname][method] = []
    this.registry[server][pathname][method].push(route)
  }

  // Find a route by server, pathname and method
  public static find(
    config: Configuration,
    server: string,
    pathname: string,
    method: Method,
    compatibilityDate?: string
  ): Route | undefined {
    const searchPathname = config.prefix ? `${config.prefix}${pathname}` : pathname
    for (const currentPathname in this.registry[server]) {
      const doPathnamesMatch = new URLPattern(currentPathname, BASE_URL).test(searchPathname, BASE_URL)
      if (!doPathnamesMatch) continue
      for (const currentMethod in this.registry[server][currentPathname]) {
        const doMethodsMatch = currentMethod === method || currentMethod === Method.ALL
        if (!doMethodsMatch) continue
        for (const currentRoute of this.registry[server][currentPathname][currentMethod]) {
          const isCompatible = compareCompatibilityDates(compatibilityDate, currentRoute.compatibilityDate)
          if (isCompatible) return currentRoute
        }
      }
    }
  }

  // Initialize routes for a server by sorting them by compatibility date in
  // descending order to ensure the correct functioning of the find algorithm
  public static init(server: string): void {
    for (const pathname in this.registry[server]) {
      for (const method in this.registry[server][pathname]) {
        this.registry[server][pathname][method].sort((a, b) => {
          return compareCompatibilityDates(a.compatibilityDate, b.compatibilityDate) ? -1 : 1
        })
      }
    }
  }

  // Get the pathname parameters from a pathname based on a template pathname
  public static getPathnameParameters(pathname: string, template: string): Params {
    const result = new URLPattern(template, BASE_URL).exec(pathname, BASE_URL)
    return result?.pathname?.groups ?? {}
  }

}
