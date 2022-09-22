import { z as zod } from 'zod'
import { Event } from './event'
import { Reply, SentReply, statuses } from './reply'
import type { z } from 'zod'


// ---


type X = {
  '200': z.ZodNumber
  '500': z.ZodString
}

type Replies = {
  [P in keyof X as `${string & typeof statuses[P]}`]: (body: z.infer<X[P]>) => Reply
}

declare const x: Replies
x.ok('123')
// x.internalServerError

type Z = '200' | '500'

type Test = {
  [P in Z as `${string & typeof statuses[P]}`]: unknown
}


// ---


type ReplyFrom<T> = T extends Record<never, never>
  ? { [K in keyof T]: SentReply<K extends number ? K : never, T[K] extends z.ZodType ? z.infer<T[K]> : never> }[keyof T]
  : T

type PromiseOrNot<T> = Promise<T> | T


declare function middleware<Responses = undefined>(
  options: {
    name?: string
    // responses?: Responses
  },
  handler: (event: Event) => PromiseOrNot<SentReply<number, unknown> | Event>
): Responses
declare function middleware<Responses = undefined>(
  options: {
    name?: string
    responses: Responses
  },
  handler: (event: Event) => PromiseOrNot<ReplyFrom<typeof options.responses> | Event>
): Responses

middleware({
  // responses: {
  //   200: zod.object({ id: zod.number() }),
  //   500: zod.object({ message: zod.string() })
  // }
}, async event => {
  // return event.next()
  // return event.reply.internalServerError({ message: 'fuck you' })
  // return event.reply.ok({ id: 123 })
  return event.reply.ok()
})
