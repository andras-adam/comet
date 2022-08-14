import { Middleware, Middlewares, MiddlewareType } from '../middlewares'
import { EventHandler } from '../event'
import { cometLogger } from '../logger'


export interface UseBeforeOptions extends Omit<Middleware, 'handler' | 'type'> {
  server?: string
}

export function useBefore(handler: EventHandler): void
export function useBefore(options: UseBeforeOptions, handler: EventHandler): void
export function useBefore(handlerOrOptions: EventHandler | UseBeforeOptions, handlerOrUndefined?: EventHandler) {
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
