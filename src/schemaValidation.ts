import { trace } from '@opentelemetry/api'
import { middleware } from './middleware'
import type { Route } from './router'


export const schemaValidation = (route: Route) => middleware({
  name: 'Schema validation'
}, async ({ event }) => {
  // Get the schemas from the route config
  const { body: bodySchema, params: paramsSchema, query: querySchema } = route.schemas
  // Parse and validate request params, query and body
  const paramsResult = paramsSchema?.safeParse(event.params)
  trace.getActiveSpan()?.addEvent('params schema parse', {
    success: paramsResult?.success
  })
  const queryResult = querySchema?.safeParse(event.query)
  trace.getActiveSpan()?.addEvent('query schema parse', {
    success: queryResult?.success
  })
  const bodyResult = bodySchema?.safeParse(event.body)
  trace.getActiveSpan()?.addEvent('body schema parse', {
    success: bodyResult?.success
  })
  // Return a reply with errors
  const errors: Record<string, unknown> = {}
  if (paramsResult?.success === false) errors.params = paramsResult.error.issues
  if (queryResult?.success === false) errors.query = queryResult.error.issues
  if (bodyResult?.success === false) errors.body = bodyResult.error.issues
  if (errors.body || errors.params || errors.query) {
    return event.reply.badRequest({ success: false, errors })
  }
  // Set the parsed params, query and body on the event and continue to the next handler
  if (paramsResult?.success) event.params = paramsResult.data
  if (queryResult?.success) event.query = queryResult.data
  if (bodyResult?.success) event.body = bodyResult.data
  return event.next()
})
