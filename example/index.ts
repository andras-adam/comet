import { handle, Method, useComet } from '../src'


useComet({
  method: Method.ALL,
  pathname: '/api/categories/:categoryId/products/:productId',
  before: [
    event => {
      console.log('Before 1')
      event.body.test = 123
      return event.next()
    },
    event => {
      console.log('Before 2')
      event.body.hello = 'there'
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
  console.log('Handler', event.headers['content-type'], event.body)
  return event.reply.ok({ success: true })
})

export default { fetch: handle }
