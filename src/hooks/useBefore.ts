import { Middleware, Middlewares, MiddlewareType } from '../middlewares'
import { Body, Env, EventHandler } from '../types'
import { cometLogger } from '../logger'


export interface UseBeforeOptions extends Omit<Middleware, 'handler' | 'type'> {
  server?: string
}

export function useBefore<TEnv = Env, TBody = Body>(handler: EventHandler<TEnv, TBody>): void
export function useBefore<TEnv = Env, TBody = Body>(options: UseBeforeOptions, handler: EventHandler<TEnv, TBody>): void
export function useBefore<TEnv = Env, TBody = Body>(
  handlerOrOptions: EventHandler<TEnv, TBody> | UseBeforeOptions,
  handlerOrUndefined?: EventHandler<TEnv, TBody>
) {
  try {
    const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : handlerOrUndefined
    const options = typeof handlerOrOptions === 'object' ? handlerOrOptions : {}
    if (!handler) return
    const server = options.server ?? 'main'
    Middlewares.register(server, {
      handler,
      name: options.name ?? 'Unnamed Global Before',
      type: MiddlewareType.Before
    })
  } catch (error) {
    cometLogger.error('[Comet] Failed to register a global \'before\' middleware.', error)
  }
}
