import { GET, POST, PUT, Status } from '@neoaren/comet'
import { z } from 'zod'
import { workerRouter } from './server'
import { auth, logger, never, perm, mwError } from '../middleware'

workerRouter.route({
  pathname: '/test',
  method: GET
}, ({ event }) => {
  //
  event.reply
  //
  return event.reply.ok(123)
})

workerRouter.route({
  pathname: '/test/:id',
  method: GET,
  before: [ logger('local before'), auth, perm ],
  after: [ logger('local after') ]
}, async ({ event }) => {
  const { id } = event.params
  // console.log(event)
  console.log(event.userId)
  event.body
  event._raw
  // await new Promise(resolve => setTimeout(resolve, 2000))
  return event.reply.ok({ found: true })
})

workerRouter.route({
  pathname: '/test',
  method: POST
}, async ({ event, env, logger }) => {
  //
  // env.MY_KV // exist
  env.MY_DURABLE_OBJECT
  // console.log(event.ctx.waitUntil) // exists
  //
  logger.warn('weeeeee')
  //
  return event.reply.ok('foo')
})

workerRouter.route({
  pathname: '/never',
  before: [ never ]
}, ({ event }) => event.reply.ok())

workerRouter.route({
  pathname: '/error/1'
}, ({ event }) => {
  throw new Error('Endpoint error test succesful')
})

workerRouter.route({
  name: 'Schema testing',
  pathname: '/test2/stuff/:id',
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

workerRouter.route({
  pathname: '/test/foo',
  method: [ POST, PUT ]
}, async ({ event }) => {
  const reply = `'${event.request.method}' method found!`
  return event.reply.ok(reply)
})

// Tests for error handling
workerRouter.route({
  pathname: '/test/error/1',
  method: [GET, POST],
}, async ({ event }) => {
  throw new Error('Endpoint error test succesful')
})
workerRouter.route({
pathname: '/test/error/2',
  method: [GET, POST],
  before: [ mwError ],
}, async ({ event }) => {
  return event.reply.ok('No error! This means something went wrong.')
})
workerRouter.route({
  pathname: '/test/error/3',
  method: GET,
  body: z.strictObject({})
}, async ({ event }) => {
  return event.reply.ok('Get method shouldn\'t have a body')
})
