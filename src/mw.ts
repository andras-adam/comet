import { Event } from './event'
import { Reply } from './reply'


type Handler<Mutation = unknown> = (event: Event & Mutation) => Promise<Reply | Event> | Event | Reply

type MutationFrom<Handler> = Handler extends (event: infer Argument) => unknown ? Omit<Argument, keyof Event> : never
type MutationsFrom<Handlers, Mutations = Record<string, never>> = Handlers extends [infer Current, ...infer Rest]
  ? MutationsFrom<Rest, Mutations & MutationFrom<Current>>
  : Mutations

function defineMutatingHandler<Mutation = unknown>(handler: Handler<Mutation>) {
  return handler
}

const test = defineMutatingHandler(event => {
  return event.reply.ok()
})

const logger = defineMutatingHandler<{ logged: boolean }>(event => {
  console.log('logged')
  event.logged = true
  return event.next()
})

const auth = defineMutatingHandler<{ user: { userId: string } }>(event => {
  event.user = { userId: 'NeoAren' }
  return event.next()
})

declare function useRoute<After extends Handler<never>[], Before extends Handler<never>[]>(
  options: {
    after?: [...After]
    before?: [...Before]
  },
  handler: Handler<MutationsFrom<Before>>
): void

useRoute({
  before: [ logger, auth, test ]
}, event => {
  event.env
  return event.reply.ok()
})
