import { useComet } from './lib'
import { Method } from './lib/types'


useComet({
  method: Method.ALL,
  pathname: '/api/users/:userId'
}, event => event.reply.ok())

useComet({
  method: Method.POST,
  pathname: '/api/users/search'
}, event => event.reply.ok())

export default {
  async fetch(request: Request) {
    return new Response(JSON.stringify({ foo: 'bar' }))
  }
}
