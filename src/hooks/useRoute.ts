import { z, TypeOf, ZodType } from 'zod'
import { Routes } from '../routes'
import { EventHandler } from '../event'
import { Method } from '../types'
import { cometLogger } from '../logger'


type ExtensionFrom<Handler> = Handler extends (event: infer Arg) => unknown ? Exclude<Arg, keyof Event> : never
type ExtensionsFrom<Handlers, Extensions = unknown> = Handlers extends [infer Current, ...infer Rest]
  ? ExtensionsFrom<Rest, Extensions & ExtensionFrom<Current>>
  : Extensions

const defaultBodySchema = z.unknown()
const defaultQuerySchema = z.record(z.string(), z.string())
const defaultParamsSchema = z.record(z.string(), z.string())

export function useRoute<
  After extends EventHandler<never>[],
  Before extends EventHandler<never>[],
  Body extends ZodType = typeof defaultBodySchema,
  Query extends ZodType = typeof defaultQuerySchema,
  Params extends ZodType = typeof defaultParamsSchema
>(
  options: {
    after?: [...After]
    before?: [...Before]
    body?: Body
    compatibilityDate?: string
    method?: Method | keyof typeof Method | Lowercase<keyof typeof Method>
    name?: string
    params?: Params
    pathname?: string
    query?: Query
    server?: string
  },
  handler: EventHandler<ExtensionsFrom<Before> & { body: TypeOf<Body>; query: TypeOf<Query>; params: TypeOf<Params> }>
) {
  try {
    const server = options.server ?? 'main'
    const pathname = options.pathname ?? '*'
    const method = options.method ? options.method.toUpperCase() as Method : Method.ALL
    Routes.register(server, {
      after: options.after ? options.after as unknown as EventHandler[] : [],
      before: options.before ? options.before as unknown as EventHandler[] : [],
      compatibilityDate: options.compatibilityDate,
      handler: handler as unknown as EventHandler,
      method,
      name: options.name ?? `${method} ${pathname}`,
      pathname,
      schemas: {
        body: options.body ?? defaultBodySchema,
        query: options.query ?? defaultQuerySchema,
        params: options.params ?? defaultParamsSchema
      }
    })
  } catch (error) {
    cometLogger.error('[Comet] Failed to register a route.', error)
  }
}
