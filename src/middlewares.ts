import { EventHandler } from './event'


export enum MiddlewareType {
  Before = 'before',
  After = 'after'
}

export interface Middleware {
  handler: EventHandler
  name?: string
  type: MiddlewareType
}

export class Middlewares {

  private static registry: Record<string, Record<string, Middleware[]>> = {}

  public static register(server: string, middleware: Middleware) {
    if (!this.registry[server]) this.registry[server] = {}
    if (!this.registry[server][middleware.type]) this.registry[server][middleware.type] = []
    this.registry[server][middleware.type].push(middleware)
  }

  public static getBefore(server: string): Middleware[] {
    return this.registry[server]?.[MiddlewareType.Before] ?? []
  }

  public static getAfter(server: string): Middleware[] {
    return this.registry[server]?.[MiddlewareType.After] ?? []
  }

}
