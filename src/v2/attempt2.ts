import { compareCompatibilityDates, compareMethods, comparePathnames, getPathnameParameters } from './utils'
import { Reply } from './reply'
import { Cookies, CookiesOptions } from './cookies'
import { isValidCompatibilityDate, isValidMethod, isValidPathname } from './utils'
import { Options } from './types'


// ---------- DATA ----------


class Data {

  private constructor(
    public readonly method: string,
    public readonly pathname: string,
    public readonly hostname: string,
    public readonly headers: Headers,
    public readonly cookies: Cookies,
    public query: unknown,
    public params: unknown,
    public body: unknown
  ) {}

  public static async fromRequest(request: Request, options: Options): Promise<Data> {
    const url = new URL(request.url)
    return new Data(
      request.method.toLowerCase(),
      url.pathname,
      url.hostname.toLowerCase(),
      request.headers,
      await Cookies.parse(request.headers, options.cookies),
      Object.fromEntries(url.searchParams.entries()),
      {},
      await this.parseRequestBody(request)
    )
  }

  private static async parseRequestBody(request: Request): Promise<unknown> {
    const contentType = request.headers.get('content-type')?.split(';')[0]
    switch (contentType) {
      case 'application/json':
        return await request.json()
      case 'multipart/form-data': {
        const formData = await request.formData()
        return Object.fromEntries(formData.entries())
      }
      case 'application/x-www-form-urlencoded': {
        const text = await request.text()
        const entries = text.split('&').map(x => x.split('=').map(decodeURIComponent))
        return Object.fromEntries(entries)
      }
      default:
        return
    }
  }

}


// ---------- MIDDLEWARE ----------


type MaybePromise<T> = Promise<T> | T

interface Middleware<T> {
  name?: string
  requires?: MiddlewareList
  handler: (event: any) => MaybePromise<T | Reply>
}

type MiddlewareList = readonly [...readonly Middleware<any>[]]

type ExtensionFrom<MW> = MW extends Middleware<infer Extension> ? Extension : never
type ExtensionsFrom<MWs, Accumulator = unknown> = MWs extends readonly [infer Current, ...infer Rest]
  ? ExtensionsFrom<Rest, Accumulator & ExtensionFrom<Current>>
  : Accumulator

type MiddlewareContext = { env: Environment; request: Request } & (
  { isDurableObject: true; state: DurableObjectState }
  |
  { isDurableObject: false; ctx: ExecutionContext }
)

class NextData<const T extends Record<string, unknown> = Record<never, never>> {
  // @ts-ignore
  constructor(public data: T = {}) {}
}

type NextFn = <const T extends Record<string, unknown> = Record<never, never>>(data?: T) => NextData<T>

const next: NextFn = (extension?: any) => new NextData(extension)

export function middleware<
  const Requires extends MiddlewareList,
  const Extension extends Record<string, unknown> = Record<never, never>
>(
  options: {
    name?: string
    requires?: Requires
  },
  handler: (event: Data & { reply: Reply; next: NextFn } & MiddlewareContext & ExtensionsFrom<Requires>) => MaybePromise<NextData<Extension> | Reply>
): Middleware<Extension extends Record<any, any> ? Extension : unknown> {
  return { ...options, handler: (event: any) => handler(Object.assign(event, { next })) as any }
}


// ---------- ROUTER ----------


type RouteContext<IsDo extends boolean> = IsDo extends true
  ? { request: Request; env: Environment; isDurableObject: true; state: DurableObjectState }
  : { request: Request; env: Environment; isDurableObject: false; ctx: ExecutionContext }

interface Route {
  name: string
  method: string
  pathname: string
  compatibilityDate?: string
  before?: MiddlewareList
  after?: MiddlewareList
  handler: (event: any) => MaybePromise<Reply>
}

interface RouterOptions {
  prefix?: string
}

class Router<
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


// ---------- SERVER ----------


interface ServerOptions<
  Before extends MiddlewareList,
  After extends MiddlewareList,
  IsDo extends boolean
> extends RouterOptions {
  durableObject?: IsDo
  before?: Before
  after?: After
  cookies?: CookiesOptions
}

class Server<
  const SBefore extends MiddlewareList,
  const SAfter extends MiddlewareList,
  const IsDo extends boolean = false
> {

  private readonly router
  public route

  constructor(private options: ServerOptions<SBefore, SAfter, IsDo>) {
    this.router = new Router<SBefore, SAfter, IsDo>(options)
    this.route = this.router.register
  }

  // public route: Router<SBefore, SAfter, IsDo>['register'] = (...args) => {
  //   return this.router.register(...args)
  // }

  //
  public handle = async (request: Request, env: Environment, ctxOrState: IsDo extends true ? DurableObjectState : ExecutionContext) => {
    //
    // console.log(this)
    this.router.init()
    //
    const data = await Data.fromRequest(request, this.options)
    const reply = new Reply()
    const isDurableObject = 'id' in ctxOrState
    const event = Object.assign(data, { reply, request, env, isDurableObject }, isDurableObject ? { state: ctxOrState } : { ctx: ctxOrState })
    let custom: Record<string, unknown> = {}
    //

    // Run global before middleware
    if (this.options.before) {
      for (const mw of this.options.before) {
        const extension = await mw.handler(Object.assign(event, custom))
        if (extension instanceof NextData) custom = { ...custom, ...extension.data }
        if (event.reply.sent) break
      }
    }

    // Main logic
    if (!event.reply.sent) {

      // Get and validate the compatibility date
      const compatibilityDate = event.headers.get('x-compatibility-date') ?? undefined
      if (compatibilityDate && new Date(compatibilityDate) > new Date()) {
        event.reply.badRequest({ message: 'Invalid compatibility date' })
      } else {

        // Find the route
        const route = this.router.find(event.pathname, event.method, compatibilityDate)
        if (!route) {
          event.reply.notFound()
        } else {
          event.params = getPathnameParameters(event.pathname, route.pathname, this.options.prefix)

          // Run local before middleware
          if (route.before) {
            for (const mw of route.before) {
              const extension = await mw.handler(Object.assign(event, custom))
              if (extension instanceof NextData) custom = { ...custom, ...extension.data }
              if (event.reply.sent) break
            }
          }

          //
          if (!event.reply.sent) await route.handler(Object.assign(event, custom))

          // Run local after middleware
          if (route.after) {
            for (const mw of route.after) {
              const extension = await mw.handler(Object.assign(event, custom))
              if (extension instanceof NextData) custom = { ...custom, ...extension.data }
            }
          }

        }
      }
    }

    // Run local after middleware
    if (this.options.after) {
      for (const mw of this.options.after) {
        const extension = await mw.handler(Object.assign(event, custom))
        if (extension instanceof NextData) custom = { ...custom, ...extension.data }
      }
    }

    //
    return await Reply.toResponse(event.reply, this.options)
  }

}

export function server<
  const SBefore extends MiddlewareList,
  const SAfter extends MiddlewareList,
  const IsDo extends boolean = false
>(options: ServerOptions<SBefore, SAfter, IsDo>) {
  return new Server(options)
}


// ---------- TESTING ----------


const x = middleware({
  name: 'test'
}, event => {
  // nothing
  // return event.next({ foo: 'bar' })
  return event.next()
})

const logger = middleware({
  name: 'logger'
}, async event => {
  if (false) {
    return event.reply.ok({ success: true })
  }
  // event.next()
  console.log('logged content')
  return event.next()
})

const token = middleware({
  name: 'token'
}, event => {
  return event.next({ token: 'asdg263f36dfu63fd' })
})

const auth = middleware({
  name: 'auth',
  requires: [ token ]
}, async event => {
  try {
    //
    // return event.
    // event.next()
    //
    return event.next({ user: [ 123, 456 ] })
  } catch {
    return event.reply.internalServerError()
  }
})

const perm = middleware({
  name: 'perm',
  requires: [ logger, auth, token ]
}, async event => {
  if (false) {
    return event.reply.forbidden()
  }
  // do checks
  return event.next({ can: true })
})

// Worker usage
const myWorkerComet = server({
  durableObject: false,
  before: [ logger, token ],
  after: [ logger ]
})

myWorkerComet.route({
  method: 'post',
  pathname: '/api/test',
  before: [ auth, perm ]
}, async event => {
  try {
    //
    event.ctx
    //
    return event.reply.ok()
  } catch (error) {
    console.error(error)
    return event.reply.internalServerError()
  }
})

export default <ExportedHandler>{
  fetch: myWorkerComet.handle
}

// DO usage
const myDoComet = server({
  durableObject: true
})

myDoComet.route({
  method: 'post',
  pathname: ''
}, async event => {
  //
  event.state
  //
  return event.reply.ok()
})

class TestDo implements DurableObject {
  constructor(private state: DurableObjectState, private env: Environment) {}
  fetch(request: Request): Promise<Response> {
    return myDoComet.handle(request, this.env, this.state)
  }
}
