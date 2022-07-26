import { BASE_URL, parseListValue } from './utils'


export interface CorsOptions {
  credentials?: boolean
  exposedHeaders?: string[] | string
  headers?: string[] | string
  maxAge?: number
  methods?: string[] | string
  origins?: string[] | string
}

export const defaultCorsOptions: Required<CorsOptions> = {
  credentials: false,
  exposedHeaders: [],
  headers: [],
  maxAge: 86400,
  methods: [],
  origins: []
}

export class CORS {

  // Registry mapping CORS options to a server and pathname
  private static registry: Record<string, Record<string, CorsOptions>> = {}

  // Register new CORS options to a server and pathname
  public static register(server: string, pathname: string, options: CorsOptions) {
    if (!this.registry[server]) this.registry[server] = {}
    if (this.registry[server][pathname]) {
      console.warn(`[Comet] A CORS policy has already been set up for the path '${pathname}'.`)
    } else {
      this.registry[server][pathname] = options
    }
  }

  // Find the CORS options for a server and pathname
  public static find(server: string, pathname: string): CorsOptions | undefined {
    for (const currentPathname in this.registry[server]) {
      const doPathnamesMatch = new URLPattern(currentPathname, BASE_URL).test(pathname, BASE_URL)
      if (doPathnamesMatch) return this.registry[server][currentPathname]
    }
  }

  // Get the CORS headers for a request
  public static getHeaders(
    server: string,
    pathname: string,
    fallbackOptions?: CorsOptions,
    isPreflight?: boolean,
    origin?: string
  ): Headers {
    // Get and parse the CORS options
    const foundOptions = this.find(server, pathname)
    const options = { ...defaultCorsOptions, ...fallbackOptions, ...foundOptions }
    const allowedOrigins = parseListValue(options.origins)
    const allowedHeaders = parseListValue(options.headers)
    const allowedMethods = parseListValue(options.methods)
    const exposedHeaders = parseListValue(options.exposedHeaders)
    const { credentials: allowCredentials, maxAge } = options
    // Set the CORS headers
    const headers = new Headers()
    if (allowedOrigins.includes('*')) {
      headers.set('access-control-allow-origin', '*')
    } else if (origin && allowedOrigins.includes(origin)) {
      headers.set('access-control-allow-origin', origin)
      headers.append('vary', 'origin')
    }
    if (allowCredentials) headers.set('access-control-allow-credentials', 'true')
    if (exposedHeaders.length > 0) headers.set('access-control-expose-headers', exposedHeaders.join(','))
    if (isPreflight) {
      if (allowedHeaders.length > 0) headers.set('access-control-allow-headers', allowedHeaders.join(','))
      if (allowedMethods.length > 0) headers.set('access-control-allow-methods', allowedMethods.join(','))
      headers.set('access-control-max-age', maxAge.toString())
      headers.set('content-length', '0')
    }
    return headers
  }

}
