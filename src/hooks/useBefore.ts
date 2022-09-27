import { GlobalMiddlewares, GlobalMiddlewareType } from '../globalMiddlewares'
import { Event, EventHandler } from '../event'
import { cometLogger } from '../logger'
import { PromiseOrNot, Replace } from '../utils'
import { Reply } from '../reply'
import { ReplyFrom, ReplySchemas } from '../middleware'


export interface UseBeforeOptions<Replies> {
  name?: string
  replies?: Replies
  server?: string
}

export function useBefore(handler: EventHandler): void
export function useBefore<Replies>(
  options: UseBeforeOptions<Replies>,
  handler: (event: Replace<Event, 'reply', ReplyFrom<Replies>>) => PromiseOrNot<Reply | Event>
): void
export function useBefore<Replies>(
  handlerOrOptions: EventHandler | UseBeforeOptions<Replies>,
  handlerOrUndefined?: (event: Replace<Event, 'reply', ReplyFrom<Replies>>) => PromiseOrNot<Reply | Event>
) {
  try {
    const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : handlerOrUndefined
    const options = typeof handlerOrOptions === 'object' ? handlerOrOptions : {}
    if (!handler) return
    const server = options.server ?? 'main'
    GlobalMiddlewares.register(server, {
      handler: handler as EventHandler,
      name: options.name ?? 'Unnamed Global Before',
      type: GlobalMiddlewareType.Before,
      replies: options.replies as ReplySchemas | undefined
    })
  } catch (error) {
    cometLogger.error('[Comet] Failed to register a global \'before\' middleware.', error)
  }
}
