import { middleware, Status } from '@neoaren/comet'
import { z } from 'zod'

export const logger = (message: string) => middleware(({ event }) => {
  console.log(message)
  return event.next()
})

export const token = middleware({
  name: 'find-token'
}, ({ event }) => {
  const token = 'gf2ugfsdej6fg6u3fgejzf'
  return event.next({ token })
})

export const auth = middleware({
  name: 'auth',
  requires: [ token ]
}, ({ event }) => {
  // event.foo = 'bar'
  console.log('finding user for token', event.token)
  return event.next({ userId: '674253674253' })
})

export const perm = middleware({
  name: 'perm',
  requires: [ auth ],
  replies: {
    [Status.Forbidden]: z.string()
  }
}, async ({ event }) => {
  await new Promise(resolve => setTimeout(resolve, 500))
  console.log(event.userId)
  const can = false
  if (can) {
    return event.reply.forbidden('forbidden')
  }
  return event.next()
})

export const never = middleware(({ event }) => event.reply.internalServerError())
