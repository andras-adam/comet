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
  await new Promise(resolve => setTimeout(resolve, 500))
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

/**
 * @description Basic test route
 */
workerComet.route({
  pathname: '/test',
  method: GET,
  query: z.strictObject({
    filter: z.string()
  })
}, ({ event }) => {
  //
  event.reply
  //
  return event.reply.ok(123)
})

/**
 * @description Post works without error
 */
workerComet.route({
  pathname: '/test',
  method: GET,
  compatibilityDate: '2023-09-01',
  query: z.strictObject({
    filter: z.string()
  })
}, ({ event }) => {
  //
  event.reply
  //
  return event.reply.ok(123)
})

/**
 * @summary Test id summary comment
 */
workerComet.route({
  pathname: '/test/:id',
  method: GET,
  before: [ logger('local before'), auth, perm ],
  after: [ logger('local after') ]
}, async ({ event }) => {
  const { id } = event.params
  // console.log(event)
  console.log(event.userId)
  // await new Promise(resolve => setTimeout(resolve, 2000))
  return event.reply.ok({ found: true })
})

/**
 * @description Post test route
 */
workerComet.route({
  pathname: '/test',
  method: POST
}, async ({ event, env, logger }) => {
  //
  // env.MY_KV // exist
  // console.log(event.ctx.waitUntil) // exists
  //
  logger.warn('weeeeee')
  //
  return event.reply.ok('foo')
})

/**
 * @description Never test route for compatibilityData check
 */
workerComet.route({
  pathname: '/never',
  before: [ never ]
}, ({ event }) => event.reply.ok())

/**
 * @description Haha working
 * @tag 1
 * @tag 2
 * @tag 3
 */
workerComet.route({
  pathname: '/never',
  compatibilityDate: '2023-09-01',
  before: [ never ],
  query: z.strictObject({
    filter: z.string()
  })
}, ({ event }) => event.reply.ok())

workerComet.route({
  pathname: '/never',
  compatibilityDate: '2023-10-01',
  before: [ never ]
}, ({ event }) => event.reply.ok())

/**
 * @description Schema and param test route
 * @summary This is a summary for schema and param test route
 */
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

export { workerComet }
