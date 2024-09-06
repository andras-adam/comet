import { workerRouter } from './server'
import './routes'

export default {
  fetch: workerRouter.handler
} satisfies ExportedHandler<Environment>
