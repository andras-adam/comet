import { defineEventHandler as middleware } from '../event'


export const schemaValidation = middleware(event => {
  if (!event.route) return event.next()
  // Get the schemas from the route config
  const { body: bodySchema, params: paramsSchema, query: querySchema } = event.route.schemas
  // Parse and validate request params, query and body
  const paramsResult = paramsSchema.safeParse(event.params)
  const queryResult = querySchema.safeParse(event.query)
  const bodyResult = bodySchema.safeParse(event.body)
  // Return a reply with errors
  const errors: Record<string, unknown> = {}
  if (!paramsResult.success) errors.params = paramsResult.error.issues
  if (!queryResult.success) errors.query = queryResult.error.issues
  if (!bodyResult.success) errors.body = bodyResult.error.issues
  if (!paramsResult.success || !queryResult.success || !bodyResult.success) {
    return event.reply.badRequest({ errors })
  }
  // Set the parsed params, query and body on the event and continue to the next handler
  event.params = paramsResult.data
  event.query = queryResult.data
  event.body = bodyResult.data
  return event.next()
})
