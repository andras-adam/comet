import { Routes } from '../routes'
import { EventHandler } from '../event'
import { Method } from '../types'
import { cometLogger } from '../logger'
import type { MatchesSchemaType, SchemaType } from '@danifoldi/spartan-schema'


type ExtensionFrom<Handler> = Handler extends (event: infer Arg) => unknown ? Exclude<Arg, keyof Event> : never
type ExtensionsFrom<Handlers, Extensions = unknown> = Handlers extends [infer Current, ...infer Rest]
  ? ExtensionsFrom<Rest, Extensions & ExtensionFrom<Current>>
  : Extensions

type BodyFrom<Schema extends SchemaType> = { body: MatchesSchemaType<Schema, Record<never, never>> }

export interface UseRouteOptions<After extends EventHandler<never>[], Before extends EventHandler<never>[], Schema extends SchemaType> {
  after?: [...After]
  before?: [...Before]
  compatibilityDate?: string
  method?: Method | keyof typeof Method | Lowercase<keyof typeof Method>
  name?: string
  pathname?: string
  schema?: Schema
  server?: string
}

export function useRoute(handler: EventHandler): void
export function useRoute<After extends EventHandler<never>[], Before extends EventHandler<never>[], Schema extends SchemaType>(
  options: UseRouteOptions<After, Before, Schema>,
  handler: EventHandler<ExtensionsFrom<Before> & BodyFrom<Schema>>
): void
export function useRoute<After extends EventHandler<never>[], Before extends EventHandler<never>[], Schema extends SchemaType>(
  handlerOrOptions: EventHandler | UseRouteOptions<After, Before, Schema>,
  handlerOrUndefined?: EventHandler<ExtensionsFrom<Before> & BodyFrom<Schema>>
) {
  try {
    const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : handlerOrUndefined
    const options = typeof handlerOrOptions === 'object' ? handlerOrOptions : {}
    if (!handler) return
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
      schema: options.schema
    })
  } catch (error) {
    cometLogger.error('[Comet] Failed to register a route.', error)
  }
}
