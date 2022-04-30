import { Handler, Method, PostMiddleware, PreMiddleware } from './types'


export class Route {

  public readonly method: Method
  public readonly pathname: string
  public readonly handler: Handler
  public readonly before: Readonly<PreMiddleware[]>
  public readonly after: Readonly<PostMiddleware[]>

  constructor(method: Method, pathname: string, handler: Handler, before?: PreMiddleware[], after?: PostMiddleware[]) {
    this.method = method
    this.pathname = pathname
    this.handler = handler
    this.before = before || []
    this.after = after || []
  }

}
