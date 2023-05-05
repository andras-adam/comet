import { GlobalMiddlewares, GlobalMiddlewareType } from '../globalMiddlewares'
import { Event, EventHandler } from '../event'
import { cometLogger } from '../logger'
import { PromiseOrNot, Replace } from '../utils'
import { Reply } from '../reply'
import { ReplyFrom, ReplySchemas } from '../middleware'


export interface UseAfterOptions<Replies> {
  name?: string
  replies?: Replies
  server?: string
}

export function useAfter(handler: EventHandler): void
export function useAfter<Replies>(
  options: UseAfterOptions<Replies>,
  handler: (event: Replace<Event, 'reply', ReplyFrom<Replies>>) => PromiseOrNot<Reply | Event>
): void
export function useAfter<Replies>(
  handlerOrOptions: EventHandler | UseAfterOptions<Replies>,
  handlerOrUndefined?: (event: Replace<Event, 'reply', ReplyFrom<Replies>>) => PromiseOrNot<Reply | Event>
) {
  try {
    const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : handlerOrUndefined
    const options = typeof handlerOrOptions === 'object' ? handlerOrOptions : {}
    if (!handler) return
    const server = options.server ?? 'main'
    GlobalMiddlewares.register(server, {
      handler: handler as EventHandler,
      name: options.name ?? 'Unnamed Global After',
      type: GlobalMiddlewareType.After,
      replies: options.replies as ReplySchemas | undefined
    })
  } catch (error) {
    cometLogger.error('[Comet] Failed to register a global \'after\' middleware.', error)
  }
}
