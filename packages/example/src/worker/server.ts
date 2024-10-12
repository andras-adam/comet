import { server } from '@neoaren/comet'
import { logger, token } from '../middleware'

export const workerRouter = server({
  name: 'worker',
  durableObject: false,
  before: [ logger('global before'), token ],
  after: [ logger('global after') ],
  prefix: '/api',
  cookies: {},
  cors: {
    origins: 'http://localhost:3000',
    methods: '*',
    headers: '*'
  },
  errorHandler: ({ event, error }) => {
    console.error('Caught an unexpected error', error)
    // Not returning anything to let the internal error handler take care of this.
    return undefined
  }
})
