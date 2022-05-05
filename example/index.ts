import { comet, Method, useComet } from '../src'


useComet<{ foo: string }>({
  method: Method.ALL,
  pathname: '/api/categories/:categoryId/products/:productId',
  before: [
    event => {
      console.log('Before 1')
      event.body.foo = '123'
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
      console.log('After 1', event.replyData)
      return event.next()
    }
  ]
}, event => {
  console.log('Handler', event.headers.get('content-type'), event.reply.headers.get('x-powered-by'), event.body)
  return event.reply.ok({ success: true })
})

export default {
  fetch: comet({
    cors: {
      origins: 'http://localhost:3000',
      methods: '*',
      headers: '*'
    }
  })
}
