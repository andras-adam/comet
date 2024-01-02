import { GET, middleware, POST, server, Status } from '@neoaren/comet'
import { z } from 'zod'


// MIDDLEWARES


const logger = (message: string) => middleware(({ event }) => {
  console.log(message)

  return event.next()
})

const token = middleware({
  name: 'find-token'
}, ({ event }) => {
  const token = 'gf2ugfsdej6fg6u3fgejzf'

  return event.next({ token })
})

const auth = middleware({
  name: 'auth',
  requires: [ token ]
}, ({ event }) => {
  // event.foo = 'bar'
  console.log('finding user for token', event.token)

  return event.next({ userId: '674253674253' })
})

const perm = middleware({
  name: 'perm',
  requires: [ auth ],
  replies: {
    [Status.Forbidden]: z.string()
  }
}, async ({ event }) => {
  await scheduler.wait(500)
  console.log(event.userId)

  const can = false
  if (can) {
    return event.reply.forbidden('forbidden')
  }

  return event.next()
})

const never = middleware(({ event }) => event.reply.internalServerError())


// WORKER


const workerComet = server({
  name: 'Worker',
  before: [ logger('global before'), token ],
  after: [ logger('global after') ],
  prefix: '/api',
  cookies: {},
  durableObject: false,
  cors: {
    origins: 'http://localhost:3000',
    methods: '*',
    headers: '*'
  }
})

workerComet.route({
  pathname: '/test',
  method: GET
}, ({ event }) => {
  //
  event.reply

  //
  return event.reply.ok(123)
})

workerComet.route({
  pathname: '/test/:id',
  method: GET,
  before: [ logger('local before'), auth, perm ],
  after: [ logger('local after') ]
}, async ({ event }) => {
  const { id } = event.params
  // console.log(event)
  console.log(id, event.userId)

  // await new Promise(resolve => setTimeout(resolve, 2000))
  return event.reply.ok({ found: true })
})

workerComet.route({
  pathname: '/test',
  method: POST
}, async ({ event, logger }) => {
  //
  // env.MY_KV // exist
  // console.log(event.ctx.waitUntil) // exists
  //
  logger.warn('weeeeee')

  //
  return event.reply.ok('foo')
})

workerComet.route({
  pathname: '/never',
  before: [ never ]
}, ({ event }) => event.reply.ok())

workerComet.route({
  name: 'Schema testing',
  pathname: '/test/stuff/:id',
  method: POST,
  body: z.strictObject({
    foo: z.string()
  }),
  params: z.strictObject({
    id: z.string()
  }),
  query: z.strictObject({
    test: z.string().optional()
  }),
  replies: {
    [Status.Ok]: z.strictObject({ foo: z.string() }),
    [Status.InternalServerError]: z.strictObject({ message: z.string() })
  }
}, async ({ event }) => {
  try {
    //
    console.log(event.body)
    //
    event.body
    event.params
    event.query.test
    //
    event.reply

    //
    return event.reply.ok({ foo: 'bar' })
  } catch (error) {
    console.error(error)

    return event.reply.internalServerError({ message: 'asd' })
  }
})

export default <ExportedHandler>{
  fetch: workerComet.handler
}
export { TestDo }


// DURABLE OBJECTS


const doComet = server({
  before: [ logger('global before'), token ],
  after: [ logger('global after') ],
  durableObject: true
})

doComet.route({
  pathname: '/test'
}, async ({ event }) => {
  console.log(event.state.id)

  return event.reply.ok()
})

class TestDo implements DurableObject {
  constructor(private state: DurableObjectState, private env: Environment) {}
  fetch(request: Request): Promise<Response> {
    return doComet.handler(request, this.env, this.state)
  }
}
