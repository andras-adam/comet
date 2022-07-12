import { CORS, CorsOptions } from '../cors'


export interface UseCorsOptions extends Partial<CorsOptions> {
  pathname?: string
  server?: string
}

export function useCors(options: UseCorsOptions): void {
  try {
    const { server: serverFromOptions, pathname: pathnameFromOptions, ...corsOptions } = options
    const server = serverFromOptions ?? 'main'
    const pathname = pathnameFromOptions ?? '*'
    CORS.register(server, pathname, corsOptions)
  } catch (error) {
    console.error('[Comet] Failed to register a CORS policy.', error)
  }
}
