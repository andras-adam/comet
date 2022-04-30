import { handle, Method, useComet } from './lib'


useComet({
  method: Method.ALL,
  pathname: '/api/categories/:categoryId/products/:productId',
  before: [
    event => {
      console.log('Before 1', event.params)
      event.params.test = 123
      return event.next()
    },
    event => {
      console.log('Before 2', event.params)
      event.params.foo = 'bar'
      return event.reply.badRequest()
    }
  ],
  after: [
    event => {
      console.log('After 1', event.replyData)
      return event.next()
    }
  ]
}, event => {
  console.log('Handler', event.params)
  return event.reply.ok()
})

export default {
  async fetch(request: Request) {
    return handle(request)
  }
}
