import { Event } from './event'
import { Reply, ReplyData } from './reply'
import { PromiseOrNot, Replace } from './utils'
import type { z } from 'zod'


type TypeFromSchema<Schema> = Schema extends z.ZodType ? z.infer<Schema> : never

type ReplyFnFromBody<Body> = Body extends undefined ? () => Reply : (body: Body) => Reply

type ReplyFrom<Schemas> = Schemas extends Record<never, never>
  ? { [Key in keyof Schemas]: ReplyFnFromBody<TypeFromSchema<Schemas[Key]>> } & ReplyData
  : Reply

type ExtensionFrom<T> = T extends Record<never, never> ? TypeFromSchema<T> : unknown

export interface Middleware<EventMutation = unknown> {
  extension?: z.ZodType
  handler: (event: Event & EventMutation) => PromiseOrNot<Reply | Event>
  name?: string
  replies?: Record<number, z.ZodType>
}

export interface MiddlewareOptions<Extension, Replies> {
  extension?: Extension
  name?: string
  replies?: Replies
}

export function middleware(handler: (event: Event) => PromiseOrNot<Reply | Event>): Middleware
export function middleware<Extension, Replies>(
  options: MiddlewareOptions<Extension, Replies>,
  handler: (event: Replace<Event, 'reply', ReplyFrom<Replies>> & ExtensionFrom<Extension>) => PromiseOrNot<Reply | Event>
): Middleware<ExtensionFrom<Extension>>
export function middleware<Extension, Replies>(
  handlerOrOptions: ((event: Event) => PromiseOrNot<Reply | Event>) | MiddlewareOptions<Extension, Replies>,
  handlerOrUndefined?: (event: Replace<Event, 'reply', ReplyFrom<Replies>> & ExtensionFrom<Extension>) => PromiseOrNot<Reply | Event>
) {
  const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : handlerOrUndefined
  const options = typeof handlerOrOptions === 'object' ? handlerOrOptions : {}
  if (!handler) return
  return { ...options, handler }
}
