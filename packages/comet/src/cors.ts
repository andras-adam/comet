import { middleware } from './middleware'
import { Method } from './types'
import { type Router } from './router'


export interface CorsOptions {
  credentials?: boolean
  exposedHeaders?: string[] | string
  headers?: string[] | string
  maxAge?: number
  methods?: string[] | string
  origins?: string[] | string
}

const defaultCorsOptions: Required<CorsOptions> = {
  credentials: false,
  exposedHeaders: [],
  headers: [],
  maxAge: 86400,
  methods: [],
  origins: []
}

function getAllOptions(options?: CorsOptions) {
  const allOptions = { ...defaultCorsOptions, ...options }
  const allowedOrigins = parseListValue(allOptions.origins)
  const allowedHeaders = parseListValue(allOptions.headers)
  const allowedMethods = parseListValue(allOptions.methods)
  const exposedHeaders = parseListValue(allOptions.exposedHeaders)
  const { credentials: allowCredentials, maxAge } = allOptions
  return { allowedOrigins, allowedHeaders, allowedMethods, exposedHeaders, allowCredentials, maxAge }
}

// Parse an array or CSV to an array
function parseListValue(value: string | string[]) {
  return Array.isArray(value) ? value : value.split(',').map(s => s.trim())
}

// Run on all requests, apply generic CORS headers
export const cors = (options?: CorsOptions) => middleware({
  name: 'CORS'
}, ({ event }) => {
  // Get all CORS options
  const { allowedOrigins, exposedHeaders, allowCredentials } = getAllOptions(options)
  // Set the origin, credentials and exposed headers CORS headers on all requests' replies
  const origin = event.headers.get('origin')
  if (allowedOrigins.includes('*')) {
    event.reply.headers.set('access-control-allow-origin', '*')
  } else if (origin
    && (allowedOrigins.includes(origin)
      || allowedOrigins.some(allowed => allowed.startsWith('https://*.') && origin.endsWith(allowed.slice(9))))) {
    event.reply.headers.set('access-control-allow-origin', origin)
    event.reply.headers.append('vary', 'origin')
  }
  if (allowCredentials) event.reply.headers.set('access-control-allow-credentials', 'true')
  if (exposedHeaders.length > 0) event.reply.headers.set('access-control-expose-headers', exposedHeaders.join(','))
  // Continue to the next middleware
  return event.next()
})

// Handle preflight requests
export const preflightHandler = (router: Router<any, any, any>, options?: CorsOptions) => middleware({
  name: 'Preflight handler'
}, ({ event }) => {
  // Run only on preflight requests
  if (event.method !== Method.OPTIONS) return event.next()
  // Get all CORS options
  const { allowedHeaders, allowedMethods, maxAge } = getAllOptions(options)
  // Verify that the preflighted route exists
  const requestMethod = event.headers.get('access-control-request-method') ?? undefined
  const { route, exact } = router.find(event.pathname, requestMethod, undefined, true)
  if (!route) {
    return event.reply.notFound()
  } else if (!exact) {
    return event.reply.methodNotAllowed()
  }

  // Set the appropriate CORS headers on the preflight response
  if (allowedHeaders.length > 0) event.reply.headers.set('access-control-allow-headers', allowedHeaders.join(','))
  if (allowedMethods.length > 0) event.reply.headers.set('access-control-allow-methods', allowedMethods.join(','))
  event.reply.headers.set('access-control-max-age', maxAge.toString())
  event.reply.headers.set('content-length', '0')
  return event.reply.noContent()
})
