import { comet, Method, useComet } from '../../src'


useComet<{ foo: string }, { bar: string }>({
  method: Method.ALL,
  pathname: '/api/categories/:categoryId/products/:productId',
  before: [
    event => {
      console.log('Before 1')
      return event.next()
    },
    event => {
      console.log('Before 2')
      event.reply.headers.set('x-powered-by', 'Comet')
      return event.next()
    }
  ],
  after: [
    event => {
      console.log('After 1', event.reply.body)
      return event.next()
    }
  ]
}, event => {
  console.log('Handler', event.cookies.get('foo'), event.params)
  event.reply.cookies.set('foo', 'bar', { httpOnly: true })
  return event.reply.ok({ success: true })
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
    }
  })
}
