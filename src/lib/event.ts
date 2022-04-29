import { CompletedEvent, IBody, IHeaders, IParams, IQuery, Method, Reply } from './types'
import { toSafeMethod, toSafePathname } from './utils'
import { ReplyManager } from './reply'


export class Event {
  public readonly method: Method
  public readonly pathname: string
  public headers: IHeaders
  public query: IQuery
  public params: IParams
  public hasReplied = true
  public isNextAllowed = true

  public reply: ReplyManager

  private constructor(method: Method, pathname: string, headers: IHeaders, query: IQuery, params: IParams) {
    this.method = method
    this.pathname = pathname
    this.headers = headers
    this.query = query
    this.params = params
    this.reply = new ReplyManager(this.createReply)
  }

  public next() {
    if (!this.isNextAllowed) {
      throw new Error('[Comet] cannot call next')
    }
    return this
  }

  private createReply(status: number, body?: IBody, headers?: IHeaders): CompletedEvent {
    if (this.hasReplied) {
      throw new Error('[Comet] Cannot reply more than once')
    }
    this.hasReplied = true
    this.isNextAllowed = false
    const reply: Reply = { status, body, headers }
    return { ...this, canReply: false, reply }
  }

  public static async fromRequest(request: Request): Promise<Event> {
    const url = new URL(request.url)
    const method = toSafeMethod(request.method)
    const pathname = toSafePathname(url.pathname)
    const query = Object.fromEntries(url.searchParams.entries())
    return new Event(method, pathname, request.headers, query, {})
  }

  public static async toResponse(event: Event): Promise<Response> {
    return new Response(null, { status: 200 })
  }

}
