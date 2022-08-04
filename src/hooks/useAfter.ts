import { Middleware, Middlewares, MiddlewareType } from '../middlewares'
import { Body, Env, EventHandler } from '../types'
import { cometLogger } from '../logger'


export interface UseAfterOptions extends Omit<Middleware, 'handler' | 'type'> {
  server?: string
}

export function useAfter<TEnv = Env, TBody = Body>(handler: EventHandler<TEnv, TBody>): void
export function useAfter<TEnv = Env, TBody = Body>(options: UseAfterOptions, handler: EventHandler<TEnv, TBody>): void
export function useAfter<TEnv = Env, TBody = Body>(
  handlerOrOptions: EventHandler<TEnv, TBody> | UseAfterOptions,
  handlerOrUndefined?: EventHandler<TEnv, TBody>
) {
  try {
    const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : handlerOrUndefined
    const options = typeof handlerOrOptions === 'object' ? handlerOrOptions : {}
    if (!handler) return
    const server = options.server ?? 'main'
    Middlewares.register(server, {
      handler,
      name: options.name ?? 'Unnamed Global After',
      type: MiddlewareType.After
    })
  } catch (error) {
    cometLogger.error('[Comet] Failed to register a global \'after\' middleware.', error)
  }
}
