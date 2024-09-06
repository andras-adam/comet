import { server } from '@neoaren/comet'
import { logger, token } from '../middleware'

export const durableObjectRouter = server({
  name: 'durable-object',
  durableObject: true,
  before: [ logger('global before'), token ],
  after: [ logger('global after') ]
})
