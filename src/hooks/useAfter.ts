import { Middleware, Middlewares, MiddlewareType } from '../middlewares'
import { EmptySchema, Env, EventHandler } from '../types'
import { cometLogger } from '../logger'
import type { Schema } from '@danifoldi/spartan-schema'


export interface UseAfterOptions extends Omit<Middleware, 'handler' | 'type'> {
  server?: string
}

export function useAfter<TEnv = Env, TSchema extends Schema = EmptySchema>(handler: EventHandler<TEnv, TSchema>): void
export function useAfter<TEnv = Env, TSchema extends Schema = EmptySchema>(options: UseAfterOptions, handler: EventHandler<TEnv, TSchema>): void
export function useAfter<TEnv = Env, TSchema extends Schema = EmptySchema>(
  handlerOrOptions: EventHandler<TEnv, TSchema> | UseAfterOptions,
  handlerOrUndefined?: EventHandler<TEnv, TSchema>
) {
  try {
    const handler = typeof handlerOrOptions === 'function' ? handlerOrOptions : handlerOrUndefined
    const options = typeof handlerOrOptions === 'object' ? handlerOrOptions : {}
    if (!handler) return
    const server = options.server ?? 'main'
    Middlewares.register(server, {
      handler,
      name: options.name ?? 'Unnamed Global After',
      type: MiddlewareType.After
    })
  } catch (error) {
    cometLogger.error('[Comet] Failed to register a global \'after\' middleware.', error)
  }
}
