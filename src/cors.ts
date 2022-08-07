import { comparePathnames } from './utils'
import { cometLogger } from './logger'


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
      cometLogger.warn(`[Comet] A CORS policy has already been set up for the path '${pathname}'.`)
    } else {
      this.registry[server][pathname] = options
    }
  }

  // Find the CORS options for a server and pathname
  public static find(server: string, pathname: string): CorsOptions | undefined {
    for (const currentPathname in this.registry[server]) {
      const doPathnamesMatch = comparePathnames(pathname, currentPathname)
      if (doPathnamesMatch) return this.registry[server][currentPathname]
    }
  }

}
