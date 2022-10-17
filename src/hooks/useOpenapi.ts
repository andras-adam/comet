import { z } from 'zod'
import { GET, Method } from '../types'
import { OpenApi, OpenApiOptions } from '../openapi'
import { registry, Route, Routes } from '../routes'
import { useRoute } from './useRoute'


function routeToOperation(route?: Route): OpenApi['paths']['/']['get'] | undefined {
  if (!route) {
    return
  }

  const pathParams = route.schemas.params.map().map(el => ({ in: 'path', required: true, ...el }))
  const queryParams = route.schemas.query.map().map(el => ({ in: 'query', ...el }))
  const body = route.schemas.body.map()
  const responses = route.replies ? Object.fromEntries(Object.entries(route.replies).map()) : undefined

  return {
    parameters: pathParams.concat(queryParams),
    requestBody: body,
    responses
  }
}

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
      const get = routeToOperation(Routes.find(server ?? 'main', path, Method.GET, date))
      const put = routeToOperation(Routes.find(server ?? 'main', path, Method.PUT, date))
      const post = routeToOperation(Routes.find(server ?? 'main', path, Method.POST, date))
      const _delete = routeToOperation(Routes.find(server ?? 'main', path, Method.DELETE, date))
      const options = routeToOperation(Routes.find(server ?? 'main', path, Method.OPTIONS, date))
      const head = routeToOperation(Routes.find(server ?? 'main', path, Method.HEAD, date))
      const patch = routeToOperation(Routes.find(server ?? 'main', path, Method.PATCH, date))
      const trace = routeToOperation(Routes.find(server ?? 'main', path, Method.TRACE, date))

      const pathItem = {
        // eslint-disable-next-line sort-keys
        get, put, post, _delete, options, head, patch, trace
      }
      return [ (path.startsWith('/') ? path : `/${path}`) as `/${string}`, pathItem ]
    }))
    const data: OpenApi = { ...options, paths, openapi: '3.1.0' }
    return event.reply.ok(data)
  })
}
