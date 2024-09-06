import { durableObjectRouter } from './server'

durableObjectRouter.route({
  pathname: '/test'
}, async ({ event }) => {
  console.log(event.state.id)
  return event.reply.ok()
})
