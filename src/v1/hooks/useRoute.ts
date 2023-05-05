import { z, TypeOf, ZodType } from 'zod'
import { Routes } from '../routes'
import { Event, EventHandler } from '../event'
import { Method } from '../types'
import { cometLogger } from '../logger'
import { Middleware, ReplyFrom, ReplySchemas } from '../middleware'
import { PromiseOrNot, Replace } from '../utils'
import { Reply } from '../reply'


type ExtensionFrom<MW> = MW extends Middleware<infer Extension> ? Extension : never
type ExtensionsFrom<MWs, Extensions = unknown> = MWs extends [infer Current, ...infer Rest]
  ? ExtensionsFrom<Rest, Extensions & ExtensionFrom<Current>>
  : Extensions

const defaultBodySchema = z.unknown()
const defaultQuerySchema = z.record(z.string(), z.string().optional())
const defaultParamsSchema = z.record(z.string(), z.string().optional())

export function useRoute<
  Replies,
  After extends Middleware<never>[],
  Before extends Middleware<never>[],
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
    replies?: Replies
    server?: string
  },
  handler: (
    event:
      Replace<Event, 'reply', ReplyFrom<Replies>> &
      ExtensionsFrom<Before> &
      { body: TypeOf<Body>; query: TypeOf<Query>; params: TypeOf<Params> }
  ) => PromiseOrNot<Reply | Event>
) {
  try {
    const server = options.server ?? 'main'
    const pathname = options.pathname ?? '*'
    const method = options.method ? options.method.toUpperCase() as Method : Method.ALL
    Routes.register(server, {
      after: options.after ? options.after as unknown as Middleware[] : [],
      before: options.before ? options.before as unknown as Middleware[] : [],
      compatibilityDate: options.compatibilityDate,
      handler: handler as EventHandler,
      method,
      name: options.name ?? `${method} ${pathname}`,
      pathname,
      replies: options.replies as ReplySchemas | undefined,
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
