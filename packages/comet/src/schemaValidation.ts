import { trace } from '@opentelemetry/api'
import { middleware } from './middleware'
import { type Route } from './router'
import { CometError, ErrorType } from './error'


export const schemaValidation = (route: Route) => middleware({
  name: 'Schema validation'
}, async ({ event }) => {
  // Get the schemas from the route config
  const { body: bodySchema, params: paramsSchema, query: querySchema } = route.schemas

  // Parse and validate request params, query and body
  const paramsResult = await paramsSchema?.['~standard'].validate(event.params)
  trace.getActiveSpan()?.addEvent('params schema parse', {
    success: !!paramsResult?.issues,
    errors: paramsResult?.issues?.map(issue => issue.message)
  })
  const queryResult = await querySchema?.['~standard'].validate(event.query)
  trace.getActiveSpan()?.addEvent('query schema parse', {
    success: !!queryResult?.issues,
    errors: queryResult?.issues?.map(issue => issue.message)
  })
  const bodyResult = await bodySchema?.['~standard'].validate(event.body)
  trace.getActiveSpan()?.addEvent('body schema parse', {
    success: !!bodyResult?.issues,
    errors: bodyResult?.issues?.map(issue => issue.message)
  })

  // Return a reply with errors
  const errors: Record<string, unknown> = {}
  if (paramsResult?.issues) errors.params = paramsResult.issues
  if (queryResult?.issues) errors.query = queryResult.issues
  if (bodyResult?.issues) errors.body = bodyResult.issues
  if (errors.body || errors.params || errors.query) {
    throw new CometError(ErrorType.SchemaValidation, errors)
  }

  // Set the parsed params, query and body on the event and continue to the next handler
  if (paramsResult && !paramsResult?.issues) event.params = paramsResult?.value
  if (queryResult && !queryResult?.issues) event.query = queryResult?.value
  if (bodyResult && !bodyResult?.issues) event.body = bodyResult?.value

  return event.next()
})
