import { comet, Method, useCors, useRoute } from '../../src'


useCors({
  pathname: '/api',
  origins: [ 'http://localhost:3000', 'http://localhost:4000' ]
})

useRoute({
  method: Method.POST,
  pathname: '/books'
}, event => event.reply.ok({ message: 1 }))

useRoute({
  method: Method.GET,
  pathname: '/books'
}, event => event.reply.ok({ message: 2 }))

useRoute({
  method: Method.GET,
  pathname: '/books',
  compatibilityDate: '2022-02-12'
}, event => event.reply.ok({ message: 3 }))

useRoute({
  method: Method.GET,
  pathname: '/books',
  compatibilityDate: '2022-04-12'
}, event => event.reply.ok({ message: 4 }))

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
