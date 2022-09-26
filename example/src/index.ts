import { z } from 'zod'
import { comet, Method, useAfter, useBefore, useRoute, middleware, Status } from '../../src'


const logger = middleware(event => {
  console.log('[local mw] logger')
  return event.next()
})

const auth = middleware({
  name: 'auth',
  extension: z.object({ user: z.object({ id: z.number() }) }),
  replies: {
    [Status.Unauthorized]: z.object({ success: z.boolean(), message: z.string() })
  }
}, event => {
  console.log('[local mw] auth')
  const couldAuthenticate = true
  if (!couldAuthenticate) {
    return event.reply.unauthorized({ success: false, message: 'haha no' })
  }
  event.user = { id: 123 }
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

useRoute({
  method: Method.ALL,
  pathname: '/test/mw',
  compatibilityDate: '2022-06-30',
  before: [ logger, auth ]
}, event => {
  console.log('[handler]', event.user, event.body)
  return event.reply.ok()
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
