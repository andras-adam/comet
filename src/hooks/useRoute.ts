import { EmptySchema, Env, EventHandler, Method } from '../types'
import { Routes } from '../routes'
import { cometLogger } from '../logger'
import type { Schema } from '@danifoldi/spartan-schema'


// eslint-disable-next-line @typescript-eslint/ban-types
export interface UseRouteOptions<TEnv = Env, TSchema extends Schema = EmptySchema> {
  after?: EventHandler<TEnv, TSchema>[]
  before?: EventHandler<TEnv, TSchema>[]
  compatibilityDate?: string
  method?: Method | keyof typeof Method | Lowercase<keyof typeof Method>
  name?: string
  pathname?: string
  schema?: TSchema
  server?: string
}

export function useRoute<TEnv = Env, TSchema extends Schema = EmptySchema>(
  handler: EventHandler<TEnv, TSchema>
): void
export function useRoute<TEnv = Env, TSchema extends Schema = EmptySchema>(
  options: UseRouteOptions<TEnv, TSchema>,
  handler: EventHandler<TEnv, TSchema>
): void
export function useRoute<TEnv = Env, TSchema extends Schema = EmptySchema>(
  handlerOrOptions: EventHandler<TEnv, TSchema> | UseRouteOptions<TEnv, TSchema>,
  handlerOrUndefined?: EventHandler<TEnv, TSchema>
) {
  try {
    const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : handlerOrUndefined
    const options = typeof handlerOrOptions === 'object' ? handlerOrOptions : {}
    if (!handler) return
    const server = options.server ?? 'main'
    const pathname = options.pathname ?? '*'
    const method = options.method ? options.method.toUpperCase() as Method : Method.ALL
    Routes.register(server, {
      after: options.after ?? [],
      before: options.before ?? [],
      compatibilityDate: options.compatibilityDate,
      handler,
      method,
      name: options.name ?? `${method} ${pathname}`,
      pathname,
      schema: options.schema
    })
  } catch (error) {
    cometLogger.error('[Comet] Failed to register a route.', error)
  }
}
