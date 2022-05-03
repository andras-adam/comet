import { BaseEvent, IBody, IHeaders, IParams, IQuery, Method, Reply } from './types'
import { toSafeMethod, toSafePathname } from './utils'
import { ReplyManager } from './reply'


export class Event {

  public readonly method: Method
  public readonly pathname: string
  public headers: IHeaders
  public query: IQuery
  public params: IParams
  public body: IBody

  public readonly request: Request
  public readonly env: Environment
  public readonly ctx: ExecutionContext

  public readonly reply = new ReplyManager(this)
  public replyData: Reply | null = null

  private constructor(baseEvent: BaseEvent) {
    this.method = baseEvent.method
    this.pathname = baseEvent.pathname
    this.headers = baseEvent.headers
    this.query = baseEvent.query
    this.params = baseEvent.params
    this.body = baseEvent.body
    this.request = baseEvent.request
    this.env = baseEvent.env
    this.ctx = baseEvent.ctx
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

  public static async fromRequest(request: Request, env: Environment, ctx: ExecutionContext): Promise<Event> {
    const url = new URL(request.url)
    const method = toSafeMethod(request.method)
    const pathname = toSafePathname(url.pathname)
    const query = Object.fromEntries(url.searchParams.entries())
    const headers = Object.fromEntries(request.headers.entries())
    const event = new Event({ body: {}, ctx, env, headers, method, params: {}, pathname, query, request })
    if (method !== Method.GET) {
      switch (headers['content-type'].split(';')[0]) {
        case 'application/json': {
          event.body = await request.json()
          break
        }
        case 'multipart/form-data': {
          const fromData = await request.formData()
          event.body = Object.fromEntries(fromData.entries())
          break
        }
        case 'application/x-www-form-urlencoded': {
          const text = await request.text()
          const entries = text.split('&').map(x => x.split('=').map(decodeURIComponent))
          event.body = Object.fromEntries(entries)
          break
        }
      }
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
