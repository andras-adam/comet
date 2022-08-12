import { Event } from './event'
import { Reply } from './reply'


type Handler<TMutation = unknown, TEnv = unknown, TBody = unknown> = (event: Event<TEnv, TBody> & TMutation) => Promise<Reply | Event> | Event | Reply

function defineMutatingHandler<TMutation = unknown, TEnv = unknown, TBody = unknown>(handler: Handler<TMutation, TEnv, TBody>) {
  return handler
}

const test = defineMutatingHandler(event => {
  return event.reply.ok()
})

const logger = defineMutatingHandler<{ logged: boolean }, { env: 'ha' }>(event => {
  console.log('logged')
  event.logged = true
  return event.next()
})

const auth = defineMutatingHandler<{ user: { userId: string } }, { env: 'asd' }>(event => {
  event.user = { userId: 'NeoAren' }
  return event.next()
})


type MutationFrom<Handler> = Handler extends (event: infer Argument) => unknown ? Omit<Argument, keyof Event> : never
type MutationsFrom<Handlers, Mutations = Record<string, never>> = Handlers extends [infer Current, ...infer Rest]
  ? MutationsFrom<Rest, Mutations & MutationFrom<Current>>
  : Mutations


declare function useRoute<
  TEnv = unknown,
  TBody = unknown,
  // After extends Handler<never, TEnv, TBody>[] | undefined,
  // Before extends Handler<never, TEnv, TBody>[]
>(
  options: {
    after?: [...Handler[]]
    before?: [...Handler<never, never, never>[]]
  },
  handler: typeof options.before extends Handler<never, never, never>[] ? Handler<MutationsFrom<[...typeof options.before]>> : Handler
): void

useRoute<{ env: 'ha' }>({
  before: [ logger, auth, test ]
}, event => {
  event.env
  return event.reply.ok()
})
