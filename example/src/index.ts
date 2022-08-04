import { comet, Method, useAfter, useBefore, useCors, useRoute } from '../../src'


useBefore(event => {
  console.log('before 1', event.method, event.pathname, event.params)
  return event.next()
})

useBefore({ name: 'check origin' }, event => {
  const hasOrigin = !!event.headers.get('origin')
  console.log('before 2', hasOrigin)
  if (!hasOrigin) return event.reply.badRequest('An origin header must be present.')
  return event.next()
})

useAfter(event => {
  console.log('after', 'reply status is', event.reply.status)
  return event.next()
})

useCors({
  pathname: '/api',
  origins: [ 'http://localhost:3000', 'http://localhost:4000' ]
})

useRoute({
  method: Method.ALL,
  pathname: '/books/:bookId'
}, event => {
  console.log('route', event.params)
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
