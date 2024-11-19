import { type MaybePromise, Method } from './types'
import {
  compareCompatibilityDates,
  compareMethods,
  comparePathnames,
  isValidCompatibilityDate,
  isValidPathname
} from './utils'
import { type Logger, recordException } from './logger'
import { type Reply, type ReplyFrom, Status } from './reply'
import { type Data } from './data'
import type { ExtensionsFrom, MiddlewareList } from './middleware'
import type { TypeOf, ZodObject, ZodType } from 'zod'
import type { Pipe, Strings, Tuples } from 'hotscript'


type RouteContext<IsDo extends boolean> = IsDo extends true ? {
  isDurableObject: true
  /**
   * @deprecated
   */
  state: DurableObjectState
} : {
  isDurableObject: false
  /**
   * @deprecated
   */
  ctx: ExecutionContext
}

type BodyFromSchema<T> = { body: T extends ZodType ? TypeOf<T> : unknown }
type ParamsFromSchema<T> = { params: T extends ZodType ? TypeOf<T> : Partial<Record<string, string>> }
type QueryFromSchema<T> = { query: T extends ZodType ? TypeOf<T> : Partial<Record<string, string>> }
type RouteParams<Body, Params, Query> = BodyFromSchema<Body> & ParamsFromSchema<Params> & QueryFromSchema<Query>
type RoutePathParams<T extends string> = ZodObject<{ [key in Pipe<T, [
  Strings.Split<'/'>,
  Tuples.Filter<Strings.StartsWith<':'>>,
  Tuples.Map<Strings.TrimLeft<':'>>,
  Tuples.ToUnion
]>]: ZodType }>
type RouteMethod = Method | keyof typeof Method

export interface Route {
  name: string
  method: Method
  pathname: string
  compatibilityDate?: string
  before?: MiddlewareList
  after?: MiddlewareList
  handler: (input: {
    event: any;
    env: Environment;
    ctx: any
    logger: Logger
  }) => MaybePromise<Reply>
  replies?: Partial<Record<Status, ZodType>>
  schemas: {
    body?: ZodType
    params?: ZodType
    query?: ZodType
  }
}

export type RouteResult = { exact: true; route: Route } | { exact: false; route?: Route }

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
    const RAfter extends MiddlewareList,
    const RoutePath extends string,
    const Replies extends Partial<Record<Status, ZodType>> | undefined = undefined,
    const Body extends ZodType | undefined = undefined,
    const Params extends (RoutePathParams<RoutePath> extends undefined
      ? never
      : RoutePathParams<RoutePath>
    ) | undefined = undefined,
    const Query extends ZodType | undefined = undefined
  >(
    options: {
      name?: string
      method?: RouteMethod | RouteMethod[]
      pathname?: RoutePath
      compatibilityDate?: string
      before?: RBefore
      after?: RAfter
      replies?: Replies
      body?: Body
      params?: Params
      query?: Query
    },
    handler: (input: {
      event: Data & RouteContext<IsDo> & RouteParams<Body, Params, Query> & { reply: ReplyFrom<Replies> }
        & { _raw: unknown }
        & ExtensionsFrom<SBefore> & ExtensionsFrom<RBefore>
      env: Environment
      ctx: IsDo extends true ? DurableObjectState : ExecutionContext
      logger: Logger
    }) => MaybePromise<Reply>
  ): void => {
    const _register = (inputMethod?: RouteMethod) => {
      const pathname = `${this.options.prefix ?? ''}${options.pathname ?? '*'}`
      const method = (inputMethod ?? Method.ALL) as Method
      const compatibilityDate = options.compatibilityDate
      const name = options.name ?? `${method} ${pathname}${compatibilityDate ? ` (${compatibilityDate})` : ''}`
      if (!isValidPathname(pathname)) {
        recordException(`[Comet] Failed to set up route '${name}' due to an invalid pathname.`)
        return
      }
      if (options.compatibilityDate !== undefined && !isValidCompatibilityDate(options.compatibilityDate)) {
        recordException(`[Comet] Failed to set up route '${name}' due to an invalid compatibility date.`)
        return
      }
      const schemas = { body: options.body, params: options.params, query: options.query }
      this.routes.push({ ...options, pathname, method, name, handler, schemas })
    }

    const { method } = options
    if (Array.isArray(method)) {
      for (const each of method) _register(each)
    } else {
      _register(method)
    }

    this.ready = false
  }

  // Find a route on a server by pathname, method and compatibility date
  public find = (
    pathname?: string,
    method?: string,
    compatibilityDate?: string,
    ignoreCompatibilityDate?: boolean
  ): RouteResult => {
    // Best non-exact match
    let bestMatch: Route | undefined
    for (const route of this.routes) {
      const doPathnamesMatch = comparePathnames(pathname, route.pathname)
      if (!doPathnamesMatch) continue

      if (!ignoreCompatibilityDate) {
        const doCompatibilityDatesMatch = compareCompatibilityDates(compatibilityDate, route.compatibilityDate)
        if (!doCompatibilityDatesMatch) continue
      }

      // At this point, we have a potential match. We need to check
      // if the methods match.
      const doMethodsMatch = compareMethods(method, route.method)
      if (doMethodsMatch) {
        // Methods are equal, we have an exact match.
        return { route, exact: true }
      }

      // Methods aren't equal, we don't have an exact match yet.
      bestMatch = route
    }

    // No exact match was found, return the bext match.
    return { route: bestMatch, exact: false }
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

  public getRoutes = (): Route[] => this.routes
}
