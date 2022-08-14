import { comet, Method, middleware, mw, useAfter, useBefore, useCors, useRoute } from '../../src'


const test = middleware(event => {
  console.log('[local mw] test')
  return event.reply.badRequest({ message: 'test mw sending error and breaking the middleware chain' })
})

const logger = middleware<{ logged: boolean }>(event => {
  console.log('[local mw] logger')
  event.logged = true
  return event.next()
})

const auth = middleware<{ user: { userId: string } }>(event => {
  console.log('[local mw] auth')
  event.user = { userId: 'NeoAren' }
  return event.next()
})

useBefore(event => {
  console.log('[global mw] before')
  return event.next()
})

useAfter(event => {
  console.log('[global mw] after')
  return event.next()
})

useCors({
  pathname: '/api',
  origins: [ 'http://localhost:3000', 'http://localhost:4000' ]
})

useRoute({
  method: Method.ALL,
  pathname: '/books/:bookId',
  compatibilityDate: '2022-06-30',
  before: [
    logger,
    // test,
    auth,
    mw(event => {
      console.log('[local mw] inline')
      return event.next()
    })
  ],
  schema: { id: 'string(0,10)' }
}, event => {
  console.log('[handler]', event.logged, event.user, event.body)
  return event.reply.ok()
})

useRoute({
  method: Method.POST,
  pathname: '/test',
  schema: {
    firstname: 'string',
    lastname: 'string(1,5)'
  }
}, event => {
  return event.reply.ok(event.body)
})

export default {
  fetch: comet({
    cookies: {
      limit: 32
    },
    cors: {
      origins: 'http://localhost:3000',
      methods: '*',
      headers: '*'
    },
    prefix: '/api'
  })
}
