import { z } from 'zod'
import { GET } from '../types'
import { OpenApi, OpenApiOptions } from '../openapi'
import { registry } from '../routes'
import { useRoute } from './useRoute'


export interface UseOpenApiOptions extends OpenApiOptions {
  pathname?: string
  server?: string
}

export function useOpenapi(options: UseOpenApiOptions): void {
  const { server, pathname } = options
  useRoute({
    pathname,
    server,
    method: GET,
    query: z.object({
      date: z.string().optional()
    })
  }, async event => {
    const now = new Date()
    const date = event.query.date ?? `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`
    const paths: OpenApi['paths'] = Object.fromEntries(Object.entries(registry).map(([ path, routes ]) => {
      return [path, routes]
    }))
    const data: OpenApi = { ...options, paths, openapi: '3.1.0' }
    return event.reply.ok(data)
  })
}
