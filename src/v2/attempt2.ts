import { BASE_URL, compareCompatibilityDates, compareMethods, comparePathnames } from '../utils'
import { Reply } from './reply'
import { Cookies, CookiesOptions } from '../cookies'
import { isValidCompatibilityDate, isValidMethod, isValidPathname } from './utils'


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

  public static async fromRequest(request: Request): Promise<Data> {
    const url = new URL(request.url)
    return new Data(
      request.method.toLowerCase(),
      url.pathname,
      url.hostname.toLowerCase(),
      request.headers,
      await Cookies.parse(request.headers, { server: '' }), // TODO config
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


// ---------- MIDDLEWARES ----------


type MaybePromise<T> = Promise<T> | T

interface Middleware<T> {
  name: string
  handler: (event: any) => MaybePromise<T>
  // TODO replies
}

// TODO request, env, etc. on mw event

type MiddlewareList = readonly [...readonly Middleware<any>[]]

type ExtensionFrom<MW> = MW extends Middleware<infer Extension> ? Extension : never
type ExtensionsFrom<MWs, Accumulator = unknown> = MWs extends readonly [infer Current, ...infer Rest]
  ? ExtensionsFrom<Rest, Accumulator & ExtensionFrom<Current>>
  : Accumulator

declare function middleware<
  const Requires extends MiddlewareList
>(options: {
  name?: string
  requires?: Requires
}, handler: (event: Data & ExtensionsFrom<Requires>) => MaybePromise<void | undefined>
): Middleware<unknown>

declare function middleware<
  const Requires extends MiddlewareList,
  const Extension extends Record<string, unknown>
>(options: {
  name?: string
  requires?: Requires
}, handler: (event: Data & ExtensionsFrom<Requires>) => MaybePromise<Extension>
): Middleware<Extension>


// ---------- ROUTER ----------


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
  public register<
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
    handler: (event: Data & Context<IsDo> & { reply: Reply } & ExtensionsFrom<SBefore> & ExtensionsFrom<RBefore>) => MaybePromise<Reply>
  ): void {
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
  public find(pathname: string, method: string, compatibilityDate?: string): Route | undefined {
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
  public init(): void {
    if (this.ready) return
    this.routes.sort((a, b) => {
      if (a.pathname !== b.pathname || a.method !== b.method) return 0
      return compareCompatibilityDates(a.compatibilityDate, b.compatibilityDate) ? -1 : 1
    })
    this.ready = true
  }

}


// ---------- SERVER ----------

// TODO does not work
type Context<IsDo extends boolean> = IsDo extends true
  ? { request: Request; env: Environment; state: DurableObjectState }
  : { request: Request; env: Environment; ctx: ExecutionContext }

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

  public router
  public route

  constructor(public options: ServerOptions<SBefore, SAfter, IsDo>) {
    this.router = new Router<SBefore, SAfter, IsDo>(options)
    this.route = this.router.register
  }

  //
  public async handle(request: Request, env: Environment, ctxOrState: IsDo extends true ? DurableObjectState : ExecutionContext) {
    //
    this.router.init()
    //
    const data = await Data.fromRequest(request)
    const reply = new Reply()
    const x = Object.assign(data, { reply, request, env }, 'id' in ctxOrState ? { state: ctxOrState } : { ctx: ctxOrState })
    //

    // const nextFunction = (...args: unknown[]) => args
    //
    // if (this.options.before) {
    //   for (const mw of this.options.before) {
    //     mw.handler()
    //   }
    // }

    const route = this.router.find(x.pathname, x.method, x.headers.get('x-compatibility-date') ?? undefined)

    //
    //
    return new Response()
  }

}


// ---------- TESTING ----------


const logger = middleware({
  name: 'logger'
}, event => {
  console.log('logged content')
})

const token = middleware({
  name: 'token'
}, event => {
  return { token: 'dagsdkaszdg' }
})

const auth = middleware({
  name: 'auth',
  requires: [ token ]
}, async event => {
  //
  // return event.
  //
  return { user: [ 123, 456 ] }
})

const perm = middleware({
  name: 'perm',
  requires: [ logger, auth, token ]
}, async event => {
  // do checks
  return { can: true }
})

// Worker usage
const myWorkerComet = new Server({
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
const myDoComet =  new Server({
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
