import { CorsOptions, Method } from './types'


// Get an array or CSV as an array
function parseListValue(value: string | string[]) {
  return Array.isArray(value) ? value : value.split(',').map(s => s.trim())
}

// Apply CORS headers to an event's reply
export function getCorsHeaders(request: Request, options: CorsOptions): Headers {
  const headers = new Headers()
  // Parse options
  const allowedOrigins = parseListValue(options.origins)
  const allowedHeaders = parseListValue(options.headers)
  const allowedMethods = parseListValue(options.methods)
  const exposedHeaders = parseListValue(options.exposedHeaders)
  const { credentials, maxAge } = options
  // Set allowed origin header
  const origin = request.headers.get('origin')
  if (origin) {
    if (allowedOrigins.includes('*')) {
      headers.set('access-control-allow-origin', '*')
    } else if (allowedOrigins.includes(origin)) {
      headers.set('access-control-allow-origin', origin)
      headers.append('vary', 'origin')
    }
  }
  // Set allowed credentials header
  if (credentials) headers.set('access-control-allow-credentials', 'true')
  // Set exposed headers header
  if (exposedHeaders.length > 0) headers.set('access-control-expose-headers', exposedHeaders.join(','))
  // Set remaining CORS headers for preflight requests
  if (request.method === Method.OPTIONS) {
    if (allowedHeaders.length > 0) headers.set('access-control-allow-headers', allowedHeaders.join(','))
    if (allowedMethods.length > 0) headers.set('access-control-allow-methods', allowedMethods.join(','))
    headers.set('access-control-max-age', maxAge.toString())
    headers.set('content-length', '0')
  }
  return headers
}
