import { BaseEvent, IBody, IHeaders, IParams, IQuery, Method, Reply } from './types'
import { toSafeMethod, toSafePathname } from './utils'
import { ReplyManager } from './reply'


export class Event {

  public readonly method: Method
  public readonly pathname: string
  public headers: IHeaders
  public query: IQuery
  public params: IParams = {}
  public body: IBody = {}

  public readonly reply = new ReplyManager(this)
  public replyData: Reply | null = null

  private constructor(method: Method, pathname: string, headers: IHeaders, query: IQuery) {
    this.method = method
    this.pathname = pathname
    this.headers = headers
    this.query = query
  }

  public next(): BaseEvent {
    return this
  }

  public createReply(status: number, body?: IBody, headers?: IHeaders): BaseEvent {
    if (this.replyData) {
      console.warn('[Comet] Sending a reply multiple times will overwrite the previous reply.')
    }
    this.replyData = { status, body, headers }
    return this
  }

  public static async fromRequest(request: Request): Promise<Event> {
    const url = new URL(request.url)
    const method = toSafeMethod(request.method)
    const pathname = toSafePathname(url.pathname)
    const query = Object.fromEntries(url.searchParams.entries())
    const headers = Object.fromEntries(request.headers.entries())
    const event = new Event(method, pathname, headers, query)
    if (method !== Method.GET && headers['content-type'] === 'application/json') {
      event.body = await request.json()
    }
    return event
  }

  public static async toResponse(event: Event): Promise<Response> {
    if (!event.replyData) {
      console.error('[Comet] No reply was sent for this event.')
      return new Response(null, { status: 500 })
    }
    const status = event.replyData.status
    const headers = event.replyData.headers || {}
    let body: string | null = null
    if (event.replyData.body) {
      headers['content-type'] = 'application/json'
      body = JSON.stringify(event.replyData.body)
    }
    return new Response(body, { status, headers })
  }

}
