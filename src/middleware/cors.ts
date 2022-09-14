import { Method } from '../types'
import { CORS, defaultCorsOptions } from '../cors'
import { parseListValue } from '../utils'
import { Routes } from '../routes'
import { defineEventHandler as middleware } from '../event'


export const cors = middleware(event => {
  // Prepare CORS options
  const foundOptions = CORS.find(event.config.server, event.pathname)
  const options = { ...defaultCorsOptions, ...event.config.cors, ...foundOptions }
  const allowedOrigins = parseListValue(options.origins)
  const allowedHeaders = parseListValue(options.headers)
  const allowedMethods = parseListValue(options.methods)
  const exposedHeaders = parseListValue(options.exposedHeaders)
  const { credentials: allowCredentials, maxAge } = options
  // Set the origin, credentials and exposed headers CORS headers on all requests' replies
  const origin = event.headers.get('origin')
  if (allowedOrigins.includes('*')) {
    event.reply.headers.set('access-control-allow-origin', '*')
  } else if (origin && allowedOrigins.includes(origin)) {
    event.reply.headers.set('access-control-allow-origin', origin)
    event.reply.headers.append('vary', 'origin')
  }
  if (allowCredentials) event.reply.headers.set('access-control-allow-credentials', 'true')
  if (exposedHeaders.length > 0) event.reply.headers.set('access-control-expose-headers', exposedHeaders.join(','))
  // Check if the event is a preflight request, call the next middleware in the chain if not
  if (event.method !== Method.OPTIONS) return event.next()
  // Verify that the preflighted route exists
  const requestMethod = event.headers.get('access-control-request-method') ?? undefined
  const route = Routes.find(event.config.server, event.pathname, requestMethod, undefined, event.config.prefix, true)
  if (!route) return event.reply.notFound()
  // Set the remaining CORS headers on the preflight response
  if (allowedHeaders.length > 0) event.reply.headers.set('access-control-allow-headers', allowedHeaders.join(','))
  if (allowedMethods.length > 0) event.reply.headers.set('access-control-allow-methods', allowedMethods.join(','))
  event.reply.headers.set('access-control-max-age', maxAge.toString())
  event.reply.headers.set('content-length', '0')
  return event.reply.noContent()
})
