import { CorsOptions, Method } from './types'
import { Event } from './event'


// Get an array or CSV as an array
function parseListValue(value: string | string[]) {
  return Array.isArray(value) ? value : value.split(',').map(s => s.trim())
}

// Apply CORS headers to an event's reply
export function applyCorsHeaders(event: Event, options: CorsOptions) {
  // Parse options
  const allowedOrigins = parseListValue(options.origins)
  const allowedHeaders = parseListValue(options.headers)
  const allowedMethods = parseListValue(options.methods)
  const exposedHeaders = parseListValue(options.exposedHeaders)
  const { credentials, maxAge } = options
  // Set allowed origin header
  const origin = event.headers.get('origin')
  if (origin) {
    if (allowedOrigins.includes('*')) {
      event.reply.headers.set('access-control-allow-origin', '*')
    } else if (allowedOrigins.includes(origin)) {
      event.reply.headers.set('access-control-allow-origin', origin)
      event.reply.headers.append('vary', 'origin')
    }
  }
  // Set allowed credentials header
  if (credentials) event.reply.headers.set('access-control-allow-credentials', 'true')
  // Set exposed headers header
  if (exposedHeaders.length > 0) event.reply.headers.set('access-control-expose-headers', exposedHeaders.join(','))
  // Set remaining CORS headers for preflight requests
  if (event.method === Method.OPTIONS) {
    if (allowedHeaders.length > 0) event.reply.headers.set('access-control-allow-headers', allowedHeaders.join(','))
    if (allowedMethods.length > 0) event.reply.headers.set('access-control-allow-methods', allowedMethods.join(','))
    event.reply.headers.set('access-control-max-age', maxAge.toString())
    event.reply.headers.set('content-length', '0')
  }
}
