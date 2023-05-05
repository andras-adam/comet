import { ExtensionsFrom, MiddlewareList } from './middleware'
import { MaybePromise } from './types'
import { Reply } from './reply'
import { Data } from './data'
import {
  compareCompatibilityDates,
  compareMethods,
  comparePathnames,
  isValidCompatibilityDate,
  isValidMethod,
  isValidPathname
} from './utils'


type RouteContext<IsDo extends boolean> = IsDo extends true
  ? { request: Request; env: Environment; isDurableObject: true; state: DurableObjectState }
  : { request: Request; env: Environment; isDurableObject: false; ctx: ExecutionContext }

export interface Route {
  name: string
  method: string
  pathname: string
  compatibilityDate?: string
  before?: MiddlewareList
  after?: MiddlewareList
  handler: (event: any) => MaybePromise<Reply>
}

export interface RouterOptions {
  prefix?: string
}

export class Router<
  const SBefore extends MiddlewareList,
  const SAfter extends MiddlewareList,
  const IsDo extends boolean = false
> {

  // Registry of routes
  private routes: Route[] = []
  private ready = true

  // Take router options
  constructor(private options: RouterOptions) {}

  // Register a new route
  public register = <
    const RBefore extends MiddlewareList,
    const RAfter extends MiddlewareList
  >(
    options: {
      name?: string
      method?: string
      pathname?: string
      compatibilityDate?: string
      before?: RBefore
      after?: RAfter
    },
    handler: (event: Data & RouteContext<IsDo> & { reply: Reply } & ExtensionsFrom<SBefore> & ExtensionsFrom<RBefore>) => MaybePromise<Reply>
  ): void => {
    const pathname = `${this.options.prefix ?? ''}${options.pathname ?? '*'}`
    const method = options.method ?? 'ALL'
    const compatibilityDate = options.compatibilityDate
    const name = options.name ?? `${method} ${pathname}${compatibilityDate ? ` (${compatibilityDate})` : ''}`
    if (!isValidPathname(pathname)) {
      console.error(`[Comet] Failed to set up route '${name}' due to an invalid pathname.`)
      return
    }
    if (!isValidMethod(method)) {
      console.error(`[Comet] Failed to set up route '${name}' due to an invalid method.`)
      return
    }
    if (options.compatibilityDate !== undefined && !isValidCompatibilityDate(options.compatibilityDate)) {
      console.error(`[Comet] Failed to set up route '${name}' due to an invalid compatibility date.`)
      return
    }
    this.routes.push({ ...options, pathname, method, name, handler })
    this.ready = false
  }

  // Find a route on a server by pathname, method and compatibility date
  public find = (pathname: string, method: string, compatibilityDate?: string): Route | undefined => {
    for (const route of this.routes) {
      const doPathnamesMatch = comparePathnames(pathname, route.pathname)
      if (!doPathnamesMatch) continue
      const doMethodsMatch = compareMethods(method, route.method)
      if (!doMethodsMatch) continue
      const doCompatibilityDatesMatch = compareCompatibilityDates(compatibilityDate, route.compatibilityDate)
      if (doCompatibilityDatesMatch) return route
    }
  }

  // Initialize router by sorting the routes by compatibility date in descending order to ensure the correct functioning of the find algorithm
  public init = (): void => {
    if (this.ready) return
    this.routes.sort((a, b) => {
      if (a.pathname !== b.pathname || a.method !== b.method) return 0
      return compareCompatibilityDates(a.compatibilityDate, b.compatibilityDate) ? -1 : 1
    })
    this.ready = true
  }

}
