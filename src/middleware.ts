import { z as zod } from 'zod'
import { Event } from './event'
import { Reply, SentReply, statuses } from './reply'
import type { z } from 'zod'


// ---


type X = {
  '200': zod.ZodNumber
  '500': zod.ZodString
}

type FunctionFromStatus<Status> = Status extends keyof typeof statuses ? typeof statuses[Status] : never

type TypeFromSchema<Schema> = Schema extends z.ZodType ? z.infer<Schema> : never

type Replies<T> = {
  [P in keyof T as FunctionFromStatus<P>]: (body: TypeFromSchema<T[P]>) => Reply
}

// the number key is causing the issue
const responses = {
  200: zod.number(),
  500: zod.string()
}

type Y = typeof responses
type Z = { [key in keyof Y as `${Lowercase<string & key>}`]: Y[key] }

declare const reply: Replies<Y>
reply.ok()
reply.ok(123)
// x.internalServerError

// type Z = '200' | '500'
//
// type Test = {
//   [P in Z as `${string & typeof statuses[P]}`]: unknown
// }


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
