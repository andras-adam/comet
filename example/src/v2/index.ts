import { middleware, server } from '../../../src/v2'


const logger = (tag: string) => middleware({}, async event => {
  console.log(`Logger middleware in '${tag}'`)
  return event.next()
})

const auth = middleware({}, async event => {
  console.log('Auth middleware')
  const header = event.headers.get('authorization')
  if (!header) {
    return event.reply.unauthorized({ success: false, message: 'Authorization header missing.' })
  }
  const token = header.startsWith('Bearer ') ? header.split(' ')[1] : header
  if (!token) {
    return event.reply.unauthorized({ success: false, message: 'Authorization token invalid' })
  }
  const userId: string = '2374627846872374'
  return event.next({ userId })
})

const perm = middleware({
  requires: [ auth ]
}, async event => {
  console.log(`Checking permission for user ${event.userId}`)
  const can = true
  if (!can) {
    return event.reply.forbidden({ success: false, message: 'Permission denied.' })
  }
  return event.next()
})

const main = server({
  prefix: '/api',
  before: [ logger('before server') ],
  after: [ logger('after server') ],
  cookies: {
    limit: 10
  }
})

main.route({
  pathname: '/test',
  method: 'post',
  before: [ logger('before route'), auth, perm ],
  after: [ logger('after route') ]
}, async event => {
  try {
    console.log('Route handler')
    //
    console.log(`Authenticated user for route is ${event.userId}`)
    //
    return event.reply.ok({ success: true })
  } catch (error) {
    console.error(error)
    return event.reply.internalServerError({ success: error, message: 'An unexpected error has occured.' })
  }
})

export default {
  fetch: main.handle
}
