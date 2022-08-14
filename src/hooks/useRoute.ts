import { Routes } from '../routes'
import { Event, EventHandler } from '../event'
import { Method } from '../types'
import { cometLogger } from '../logger'


type ExtensionFrom<Handler> = Handler extends (event: infer Arg) => unknown ? Exclude<Arg, keyof Event> : never
type ExtensionsFrom<Handlers, Extensions = unknown> = Handlers extends [infer Current, ...infer Rest]
  ? ExtensionsFrom<Rest, Extensions & ExtensionFrom<Current>>
  : Extensions

export interface UseRouteOptions<After extends EventHandler<never>[], Before extends EventHandler<never>[]> {
  after?: [...After]
  before?: [...Before]
  compatibilityDate?: string
  method?: Method | keyof typeof Method | Lowercase<keyof typeof Method>
  name?: string
  pathname?: string
  server?: string
}

export function useRoute(handler: EventHandler): void
export function useRoute<After extends EventHandler<never>[], Before extends EventHandler<never>[]>(
  options: UseRouteOptions<After, Before>,
  handler: EventHandler<ExtensionsFrom<Before>>
): void
export function useRoute<After extends EventHandler<never>[], Before extends EventHandler<never>[]>(
  handlerOrOptions: EventHandler<ExtensionsFrom<Before>> | UseRouteOptions<After, Before>,
  handlerOrUndefined?: EventHandler<ExtensionsFrom<Before>>
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
      pathname
    })
  } catch (error) {
    cometLogger.error('[Comet] Failed to register a route.', error)
  }
}
