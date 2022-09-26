import { GlobalMiddleware, GlobalMiddlewares, GlobalMiddlewareType } from '../globalMiddlewares'
import { EventHandler } from '../event'
import { cometLogger } from '../logger'


export interface UseAfterOptions extends Omit<GlobalMiddleware, 'handler' | 'type'> {
  server?: string
}

export function useAfter(handler: EventHandler): void
export function useAfter(options: UseAfterOptions, handler: EventHandler): void
export function useAfter(handlerOrOptions: EventHandler | UseAfterOptions, handlerOrUndefined?: EventHandler) {
  try {
    const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : handlerOrUndefined
    const options = typeof handlerOrOptions === 'object' ? handlerOrOptions : {}
    if (!handler) return
    const server = options.server ?? 'main'
    GlobalMiddlewares.register(server, {
      handler,
      name: options.name ?? 'Unnamed Global After',
      type: GlobalMiddlewareType.After
    })
  } catch (error) {
    cometLogger.error('[Comet] Failed to register a global \'after\' middleware.', error)
  }
}
