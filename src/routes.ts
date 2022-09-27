import { ZodType } from 'zod'
import { EventHandler } from './event'
import { Method } from './types'
import { BASE_URL, compareCompatibilityDates, compareMethods, comparePathnames } from './utils'
import { cometLogger } from './logger'
import { Middleware, ReplySchemas } from './middleware'


export interface Route {
  after: Middleware[]
  before: Middleware[]
  compatibilityDate?: string
  handler: EventHandler
  method: Method
  name: string
  pathname: string
  replies?: ReplySchemas
  schemas: {
    body: ZodType
    query: ZodType
    params: ZodType
  }
}

export class Routes {

  // Registry mapping routes to a server
  private static registry: Record<string, Route[]> = {}

  // Register a new route to a server
  public static register(server: string, route: Route): void {
    const { pathname, method, name, compatibilityDate } = route
    if (method === Method.OPTIONS) {
      cometLogger.warn(`[Comet] Skipping route '${name}', please consult the guide on how CORS can be configured via Comet.`)
      return
    }
    try {
      new URLPattern(pathname, BASE_URL)
    } catch (error) {
      cometLogger.error(`[Comet] Failed to set up route '${name}' due to an invalid pathname pattern.`, error)
      return
    }
    if (typeof compatibilityDate === 'string' && Number.isNaN(new Date(compatibilityDate).valueOf())) {
      cometLogger.error(`[Comet] Failed to set up route '${name}' due to an invalid compatibility date.`)
      return
    }
    if (!this.registry[server]) this.registry[server] = []
    this.registry[server].push(route)
  }

  // Find a route on a server by pathname, method and compatibility date
  public static find(
    server: string,
    pathname: string,
    method?: string,
    compatibilityDate?: string,
    prefix?: string,
    ignoreCompatibilityDate?: boolean
  ): Route | undefined {
    for (const route of this.registry[server]) {
      const doPathnamesMatch = comparePathnames(pathname, `${prefix ?? ''}${route.pathname}`)
      if (!doPathnamesMatch) continue
      const doMethodsMatch = compareMethods(method, route.method)
      if (!doMethodsMatch) continue
      if (ignoreCompatibilityDate) return route
      const doCompatibilityDatesMatch = compareCompatibilityDates(compatibilityDate, route.compatibilityDate)
      if (doCompatibilityDatesMatch) return route
    }
  }

  // Initialize routes for a server by sorting them by compatibility date in
  // descending order to ensure the correct functioning of the find algorithm
  public static init(server: string): void {
    this.registry[server]?.sort((a, b) => {
      if (a.pathname !== b.pathname || a.method !== b.method) return 0
      return compareCompatibilityDates(a.compatibilityDate, b.compatibilityDate) ? -1 : 1
    })
  }

}
