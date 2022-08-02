import { CORS, CorsOptions } from '../cors'
import { cometLogger } from '../logger'


export interface UseCorsOptions extends CorsOptions {
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
    cometLogger.error('[Comet] Failed to register a CORS policy.', error)
  }
}
