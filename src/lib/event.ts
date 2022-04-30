import { IHeaders, IParams, IQuery, Method, Reply } from './types'
import { toSafeMethod, toSafePathname } from './utils'
import { ReplyManager } from './reply'


export class Event {

  public readonly method: Method
  public readonly pathname: string
  public headers: IHeaders
  public query: IQuery
  public params: IParams

  public readonly reply = new ReplyManager(this.createReply)
  public replyData: Reply | null = null

  private constructor(method: Method, pathname: string, headers: IHeaders, query: IQuery, params: IParams) {
    this.method = method
    this.pathname = pathname
    this.headers = headers
    this.query = query
    this.params = params
  }

  public next(): Event {
    return this
  }

  private createReply(status: number, headers?: IHeaders): Event {
    if (this.replyData) {
      console.warn('[Comet] Sending a reply multiple times will overwrite the previous reply')
    }
    this.replyData = { status, headers }
    return this
  }

  public static async fromRequest(request: Request): Promise<Event> {
    const url = new URL(request.url)
    const method = toSafeMethod(request.method)
    const pathname = toSafePathname(url.pathname)
    const query = Object.fromEntries(url.searchParams.entries())
    return new Event(method, pathname, request.headers, query, {})
  }

  public static async toResponse(event: Event): Promise<Response> {
    if (!event.replyData) {
      console.error('[Comet] No reply was sent for this event')
      return new Response(null, { status: 500 })
    }
    const { status, headers } = event.replyData
    return new Response(null, { status, headers })
  }

}
