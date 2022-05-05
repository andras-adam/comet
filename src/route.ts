import { CorsOptions, Handler, Method, PostMiddleware, PreMiddleware } from './types'


export class Route {

  public readonly method: Method
  public readonly pathname: string
  public readonly handler: Handler
  public readonly before: Readonly<PreMiddleware[]>
  public readonly after: Readonly<PostMiddleware[]>
  public readonly cors?: CorsOptions

  constructor(
    method: Method,
    pathname: string,
    handler: Handler,
    before?: PreMiddleware[],
    after?: PostMiddleware[],
    cors?: CorsOptions
  ) {
    this.method = method
    this.pathname = pathname
    this.handler = handler
    this.before = before || []
    this.after = after || []
    this.cors = cors
  }

}
