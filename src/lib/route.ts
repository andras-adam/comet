import { Handler, Method, PostMiddleware, PreMiddleware } from './types'


export class Route implements Iterator<Handler | PreMiddleware | PostMiddleware> {

  public readonly method: Method
  public readonly pathname: string
  public readonly handler: Handler
  public readonly before: Readonly<PreMiddleware[]>
  public readonly after: Readonly<PostMiddleware[]>
  private index = 0

  constructor(method: Method, pathname: string, handler: Handler, before?: PreMiddleware[], after?: PostMiddleware[]) {
    this.method = method
    this.pathname = pathname
    this.handler = handler
    this.before = before || []
    this.after = after || []
  }

  next(): IteratorResult<Handler | PreMiddleware | PostMiddleware> {
    if (this.index < this.before.length) {
      return { done: false, value: this.before[this.index++] }
    } else if (this.index++ === this.before.length) {
      return { done: false, value: this.handler }
    } else if (this.index < this.before.length + this.after.length + 1) {
      return { done: false, value: this.after[this.index++ - this.before.length - 1] }
    }
    return { value: undefined, done: true }
  }

  [Symbol.iterator](): Iterator<Handler | PreMiddleware | PostMiddleware> {
    return this
  }
}
