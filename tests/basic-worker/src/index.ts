import { server as comet, GET } from '@neoaren/comet'


export const server = comet()

server.route({
  pathname: '/sanity-test',
  method: GET
}, ({ event }) => {
  return event.reply.ok()
})

server.route({
  pathname: '/get-env-var',
  method: GET
}, ({ event, env }) => {
  return event.reply.ok(env.SECRET_KEY)
})

export default {
  fetch: server.handler
} satisfies ExportedHandler<Environment>
