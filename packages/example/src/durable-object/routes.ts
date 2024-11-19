import { durableObjectRouter } from './server'


durableObjectRouter.route({
  pathname: '/test'
}, async ({ event, ctx }) => {
  console.log(event.state.id)
  console.log(ctx.id)
  return event.reply.ok()
})

durableObjectRouter.route({
  pathname: '/abort'
}, async ({ event, ctx }) => {
  
  ctx.abort()

  return event.reply.ok()
})
