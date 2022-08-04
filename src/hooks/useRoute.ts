import { Body, Env, EventHandler, Method } from '../types'
import { Routes } from '../routes'
import { cometLogger } from '../logger'


export interface UseRouteOptions<TEnv = Env, TBody = Body> {
  after?: EventHandler<TEnv, TBody>[]
  before?: EventHandler<TEnv, TBody>[]
  compatibilityDate?: string
  method?: Method | keyof typeof Method | Lowercase<keyof typeof Method>
  name?: string
  pathname?: string
  server?: string
}

export function useRoute<TEnv = Env, TBody = Body>(
  handler: EventHandler<TEnv, TBody>
): void
export function useRoute<TEnv = Env, TBody = Body>(
  options: UseRouteOptions<TEnv, TBody>,
  handler: EventHandler<TEnv, TBody>
): void
export function useRoute<TEnv = Env, TBody = Body>(
  handlerOrOptions: EventHandler<TEnv, TBody> | UseRouteOptions<TEnv, TBody>,
  handlerOrUndefined?: EventHandler<TEnv, TBody>
) {
  try {
    const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : handlerOrUndefined
    const options = typeof handlerOrOptions === 'object' ? handlerOrOptions : {}
    if (!handler) return
    const server = options.server ?? 'main'
    const pathname = options.pathname ?? '*'
    const method = options.method ? options.method.toUpperCase() as Method : Method.ALL
    Routes.register(server, {
      after: options.after ?? [],
      before: options.before ?? [],
      compatibilityDate: options.compatibilityDate,
      handler,
      method,
      name: options.name ?? `${method} ${pathname}`,
      pathname
    })
  } catch (error) {
    cometLogger.error('[Comet] Failed to register a route.', error)
  }
}
