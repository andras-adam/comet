import { EventHandler } from './event'
import { ReplySchemas } from './middleware'


export enum GlobalMiddlewareType {
  Before = 'before',
  After = 'after'
}

export interface GlobalMiddleware {
  handler: EventHandler
  name?: string
  replies?: ReplySchemas
  type: GlobalMiddlewareType
}

export class GlobalMiddlewares {

  private static registry: Record<string, Record<string, GlobalMiddleware[]>> = {}

  public static register(server: string, middleware: GlobalMiddleware) {
    if (!this.registry[server]) this.registry[server] = {}
    if (!this.registry[server][middleware.type]) this.registry[server][middleware.type] = []
    this.registry[server][middleware.type].push(middleware)
  }

  public static getBefore(server: string): GlobalMiddleware[] {
    return this.registry[server]?.[GlobalMiddlewareType.Before] ?? []
  }

  public static getAfter(server: string): GlobalMiddleware[] {
    return this.registry[server]?.[GlobalMiddlewareType.After] ?? []
  }

}
