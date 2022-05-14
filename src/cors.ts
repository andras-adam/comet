import { CorsOptions, Method } from './types'
import { Event } from './event'


// Get an array or CSV as an array
const parseListValue = (value: string | string[]) => {
  return Array.isArray(value) ? value : value.split(',').map(s => s.trim())
}

// Apply CORS headers to an event reply
export function applyCorsHeaders(event: Event, cors: CorsOptions) {
  // Parse options
  const allowedOrigins = parseListValue(cors.origins)
  const allowedHeaders = parseListValue(cors.headers)
  const allowedMethods = parseListValue(cors.methods)
  const maxAge = cors.maxAge
  // Set allowed origin header
  const origin = event.headers.get('origin')
  if (origin && (allowedOrigins.includes(origin) || allowedOrigins.includes('*'))) {
    event.reply.headers.set('access-control-allow-origin', origin)
    event.reply.headers.append('vary', 'origin')
  }
  // Set remaining CORS headers for preflight requests
  if (event.method === Method.OPTIONS) {
    if (allowedHeaders.length > 0) event.reply.headers.set('access-control-allow-headers', allowedHeaders.join(','))
    if (allowedMethods.length > 0) event.reply.headers.set('access-control-allow-methods', allowedMethods.join(','))
    event.reply.headers.set('access-control-max-age', maxAge.toString())
    event.reply.headers.set('content-length', '0')
  }
}
