import { Body, CookiesOptions, Env, EventHandler, Method } from '../types'
import { Routes } from '../routes'


export interface UseRouteOptions<TEnv = Env, TBody = Body> {
  after?: EventHandler<TEnv, TBody>[]
  before?: EventHandler<TEnv, TBody>[]
  compatibilityDate?: string
  cookies?: Partial<CookiesOptions>
  method?: Method | keyof typeof Method | Lowercase<keyof typeof Method>
  name?: string
  pathname?: string
  server?: string
}

export function useRoute<TEnv = Env, TBody = Body>(
  options: UseRouteOptions<TEnv, TBody>,
  handler: EventHandler<TEnv, TBody>
) {
  try {
    const server = options.server ?? 'main'
    const pathname = options.pathname ?? '*'
    const method = options.method ? options.method.toUpperCase() as Method : Method.ALL
    Routes.register({
      after: options.after ?? [],
      before: options.before ?? [],
      compatibilityDate: options.compatibilityDate,
      cookies: options.cookies,
      handler,
      method,
      name: options.name ?? `${method} ${pathname}`,
      pathname,
      server
    })
  } catch (error) {
    console.error('[Comet] Failed to register a route.', error)
  }
}
