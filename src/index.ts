import { handle, Method, useComet } from './lib'


useComet({
  method: Method.ALL,
  pathname: '/api/categories/:categoryId/products/:productId',
  before: [
    event => {
      console.log(event.params)
      event.params.test = 123
      return event.next()
    },
    event => {
      console.log(event.params)
      return event.next()
    }
  ],
  after: [
    event => {
      console.log(event.params)
      return event.next()
    }
  ]
}, event => {
  console.log(event.params)
  return event.reply.ok()
})

export default {
  async fetch(request: Request) {
    return handle(request)
  }
}
