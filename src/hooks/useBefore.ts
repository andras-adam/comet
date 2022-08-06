import { Middleware, Middlewares, MiddlewareType } from '../middlewares'
import { EmptySchema, Env, EventHandler } from '../types'
import { cometLogger } from '../logger'
import type { Schema } from '@danifoldi/spartan-schema'


export interface UseBeforeOptions extends Omit<Middleware, 'handler' | 'type'> {
  server?: string
}

export function useBefore<TEnv = Env, TSchema extends Schema = EmptySchema>(handler: EventHandler<TEnv, TSchema>): void
export function useBefore<TEnv = Env, TSchema extends Schema = EmptySchema>(options: UseBeforeOptions, handler: EventHandler<TEnv, TSchema>): void
export function useBefore<TEnv = Env, TSchema extends Schema = EmptySchema>(
  handlerOrOptions: EventHandler<TEnv, TSchema> | UseBeforeOptions,
  handlerOrUndefined?: EventHandler<TEnv, TSchema>
) {
  try {
    const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : handlerOrUndefined
    const options = typeof handlerOrOptions === 'object' ? handlerOrOptions : {}
    if (!handler) return
    const server = options.server ?? 'main'
    Middlewares.register(server, {
      handler,
      name: options.name ?? 'Unnamed Global Before',
      type: MiddlewareType.Before
    })
  } catch (error) {
    cometLogger.error('[Comet] Failed to register a global \'before\' middleware.', error)
  }
}
