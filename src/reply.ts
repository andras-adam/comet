import { trace } from '@opentelemetry/api'
import { Cookies } from './cookies'
import { recordException } from './logger'
import type { Options } from './types'
import type { TypeOf, ZodType } from 'zod'


export enum Status {
  Continue = 'continue',
  SwitchingProtocols = 'switchingProtocols',
  Processing = 'processing',
  Ok = 'ok',
  Created = 'created',
  Accepted = 'accepted',
  NonAuthoritativeInformation = 'nonAuthoritativeInformation',
  NoContent = 'noContent',
  ResetContent = 'resetContent',
  PartialContent = 'partialContent',
  MultiStatus = 'multiStatus',
  MultipleChoices = 'multipleChoices',
  MovedPermanently = 'movedPermanently',
  MovedTemporarily = 'movedTemporarily',
  SeeOther = 'seeOther',
  NotModified = 'notModified',
  UseProxy = 'useProxy',
  TemporaryRedirect = 'temporaryRedirect',
  PermanentRedirect = 'permanentRedirect',
  BadRequest = 'badRequest',
  Unauthorized = 'unauthorized',
  PaymentRequired = 'paymentRequired',
  Forbidden = 'forbidden',
  NotFound = 'notFound',
  MethodNotAllowed = 'methodNotAllowed',
  NotAcceptable = 'notAcceptable',
  ProxyAuthenticationRequired = 'proxyAuthenticationRequired',
  RequestTimeout = 'requestTimeout',
  Conflict = 'conflict',
  Gone = 'gone',
  LengthRequired = 'lengthRequired',
  PreconditionFailed = 'preconditionFailed',
  RequestTooLong = 'requestTooLong',
  RequestUriTooLong = 'requestUriTooLong',
  UnsupportedMediaType = 'unsupportedMediaType',
  RequestedRangeNotSatisfiable = 'requestedRangeNotSatisfiable',
  ExpectationFailed = 'expectationFailed',
  ImATeapot = 'imATeapot',
  InsufficientSpaceOnResource = 'insufficientSpaceOnResource',
  MethodFailure = 'methodFailure',
  MisdirectedRequest = 'misdirectedRequest',
  UnprocessableEntity = 'unprocessableEntity',
  FailedDependency = 'failedDependency',
  PreconditionRequired = 'preconditionRequired',
  TooManyRequests = 'tooManyRequests',
  RequestHeaderFieldsTooLarge = 'requestHeaderFieldsTooLarge',
  UnavailableForLegalReasons = 'unavailableForLegalReasons',
  InternalServerError = 'internalServerError',
  NotImplemented = 'notImplemented',
  BadGateway = 'badGateway',
  ServiceUnavailable = 'serviceUnavailable',
  GatewayTimeout = 'gatewayTimeout',
  HttpVersionNotSupported = 'httpVersionNotSupported',
  InsufficientStorage = 'insufficientStorage',
  NetworkAuthenticationRequired = 'networkAuthenticationRequired'
}

export interface ReplyData {
  status: number
  headers: Headers
  cookies: Cookies
  sent?: Date
}

type TypeOfSafe<Schema> = Schema extends ZodType ? TypeOf<Schema> : never
type ReplyFnFrom<Body> = Body extends undefined ? () => Reply : (body: TypeOfSafe<Body>) => Reply

export type ReplyFrom<Schemas extends Partial<Record<Status, ZodType>> | undefined> = Schemas extends undefined
  ? Reply
  : ReplyData & { [Key in keyof Schemas as `${string & Key}`]: ReplyFnFrom<Schemas[Key]> }

export class Reply implements ReplyData {

  // Reply data for regular replies
  private body?: unknown
  public status = Number.NaN
  public headers = new Headers()
  public cookies = new Cookies()

  // Reply data for raw replies
  private _raw?: Response

  // The date the reply was sent
  public sent?: Date


  // Convert a reply to a standard response
  static async toResponse(reply: Reply, options: Options): Promise<Response> {
    // Return error response if no reply was sent
    if (!reply.sent) {
      recordException('[Comet] No reply was sent for this event.')

      return new Response(null, { status: 500 })
    }

    // Handle sending a raw response
    if (reply._raw !== undefined) {
      trace.getActiveSpan()?.addEvent('return raw response')

      return reply._raw
    }

    // Get status, headers and serialize cookies
    const status = reply.status
    const headers = reply.headers
    await Cookies.serialize(reply.cookies, reply.headers, options.cookies)
    // Handle websocket response
    if (reply.body instanceof WebSocket) {
      trace.getActiveSpan()?.addEvent('return websocket response')

      return new Response(null, { status, headers, webSocket: reply.body })
    }

    // Handle stream response
    if (reply.body instanceof ReadableStream) {
      trace.getActiveSpan()?.addEvent('return streamed response')

      return new Response(reply.body, { status, headers })
    }

    if (reply.body instanceof ArrayBuffer) {
      trace.getActiveSpan()?.addEvent('return arraybuffer response')

      return new Response(reply.body, { status, headers })
    }

    if (reply.body instanceof Blob) {
      trace.getActiveSpan()?.addEvent('return blob response')

      return new Response(reply.body, { status, headers })
    }

    // Handle json response
    let body: string | null = null
    if (reply.body) {
      headers.set('content-type', 'application/json')
      body = options.dev ? JSON.stringify(reply.body, null, 2) : JSON.stringify(reply.body)
    }

    trace.getActiveSpan()?.addEvent('convert response')

    return new Response(body, { status, headers })
  }

  // Send a regular reply
  private send(status: number, body?: unknown): Reply {
    if (this.sent) {
      recordException('[Comet] Cannot send a reply after one has already been sent.')

      return this
    }

    this.status = status
    this.body = body
    this.sent = new Date()
    trace.getActiveSpan()?.addEvent('send reply', {
      status,
      sent: +this.sent
    })

    return this
  }

  // Send a raw reply
  public raw(response: Response): Reply {
    if (this.sent) {
      recordException('[Comet] Cannot send a reply after one has already been sent.')

      return this
    }

    this._raw = response
    this.sent = new Date()
    trace.getActiveSpan()?.addEvent('raw reply', {
      sent: +this.sent
    })

    return this
  }

  // Send a custom HTTP response
  public custom(status: number, body?: unknown) {
    return this.send(status, body)
  }

  // Send an HTTP `100 Continue` informational response
  public continue(body?: unknown) {
    return this.send(100, body)
  }

  // Send an HTTP `101 Switching Protocols` informational response
  public switchingProtocols(body?: unknown) {
    return this.send(101, body)
  }

  // Send an HTTP `102 Processing` informational response
  public processing(body?: unknown) {
    return this.send(102, body)
  }

  // Send an HTTP `200 OK` successful response
  public ok(body?: unknown) {
    return this.send(200, body)
  }

  // Send an HTTP `201 Created` successful response
  public created(body?: unknown) {
    return this.send(201, body)
  }

  // Send an HTTP `202 Accepted` successful response
  public accepted(body?: unknown) {
    return this.send(202, body)
  }

  // Send an HTTP `203 Non-Authoritative Information` successful response
  public nonAuthoritativeInformation(body?: unknown) {
    return this.send(203, body)
  }

  // Send an HTTP `204 No Content` successful response
  public noContent(body?: unknown) {
    return this.send(204, body)
  }

  // Send an HTTP `205 Reset Content` successful response
  public resetContent(body?: unknown) {
    return this.send(205, body)
  }

  // Send an HTTP `206 Partial Content` successful response
  public partialContent(body?: unknown) {
    return this.send(206, body)
  }

  // Send an HTTP `207 Multi-Status` successful response
  public multiStatus(body?: unknown) {
    return this.send(207, body)
  }

  // Send an HTTP `300 Multiple Choices` redirection response
  public multipleChoices(body?: unknown) {
    return this.send(300, body)
  }

  // Send an HTTP `301 Moved Permanently` redirection response
  public movedPermanently(body?: unknown) {
    return this.send(301, body)
  }

  // Send an HTTP `302 Moved Temporarily` redirection response
  public movedTemporarily(body?: unknown) {
    return this.send(302, body)
  }

  // Send an HTTP `303 See Other` redirection response
  public seeOther(body?: unknown) {
    return this.send(303, body)
  }

  // Send an HTTP `304 Not Modified` redirection response
  public notModified(body?: unknown) {
    return this.send(304, body)
  }

  // Send an HTTP `305 Use Proxy` redirection response
  public useProxy(body?: unknown) {
    return this.send(305, body)
  }

  // Send an HTTP `307 Temporary Redirect` redirection response
  public temporaryRedirect(body?: unknown) {
    return this.send(307, body)
  }

  // Send an HTTP `308 Permanent Redirect` redirection response
  public permanentRedirect(body?: unknown) {
    return this.send(308, body)
  }

  // Send an HTTP `400 Bad Request` client error response
  public badRequest(body?: unknown) {
    return this.send(400, body)
  }

  // Send an HTTP `401 Unauthorized` client error response
  public unauthorized(body?: unknown) {
    return this.send(401, body)
  }

  // Send an HTTP `402 Payment Required` client error response
  public paymentRequired(body?: unknown) {
    return this.send(402, body)
  }

  // Send an HTTP `403 Forbidden` client error response
  public forbidden(body?: unknown) {
    return this.send(403, body)
  }

  // Send an HTTP `404 Not Found` client error response
  public notFound(body?: unknown) {
    return this.send(404, body)
  }

  // Send an HTTP `405 Method Not Allowed` client error response
  public methodNotAllowed(body?: unknown) {
    return this.send(405, body)
  }

  // Send an HTTP `406 Not Acceptable` client error response
  public notAcceptable(body?: unknown) {
    return this.send(406, body)
  }

  // Send an HTTP `407 Proxy Authentication Required` client error response
  public proxyAuthenticationRequired(body?: unknown) {
    return this.send(407, body)
  }

  // Send an HTTP `408 Request Timeout` client error response
  public requestTimeout(body?: unknown) {
    return this.send(408, body)
  }

  // Send an HTTP `409 Conflict` client error response
  public conflict(body?: unknown) {
    return this.send(409, body)
  }

  // Send an HTTP `410 Gone` client error response
  public gone(body?: unknown) {
    return this.send(410, body)
  }

  // Send an HTTP `411 Length Required` client error response
  public lengthRequired(body?: unknown) {
    return this.send(411, body)
  }

  // Send an HTTP `412 Precondition Failed` client error response
  public preconditionFailed(body?: unknown) {
    return this.send(412, body)
  }

  // Send an HTTP `413 Request Too Long` client error response
  public requestTooLong(body?: unknown) {
    return this.send(413, body)
  }

  // Send an HTTP `414 Request URI Too Long` client error response
  public requestUriTooLong(body?: unknown) {
    return this.send(414, body)
  }

  // Send an HTTP `415 Unsupported Media Type` client error response
  public unsupportedMediaType(body?: unknown) {
    return this.send(415, body)
  }

  // Send an HTTP `416 Requested Range Not Satisfiable` client error response
  public requestedRangeNotSatisfiable(body?: unknown) {
    return this.send(416, body)
  }

  // Send an HTTP `417 Expectation Failed` client error response
  public expectationFailed(body?: unknown) {
    return this.send(417, body)
  }

  // Send an HTTP `418 I'm a teapot` client error response
  public imATeapot(body?: unknown) {
    return this.send(418, body)
  }

  // Send an HTTP `419 Insufficient Space On Resource` client error response
  public insufficientSpaceOnResource(body?: unknown) {
    return this.send(419, body)
  }

  // Send an HTTP `420 Method Failure` client error response
  public methodFailure(body?: unknown) {
    return this.send(420, body)
  }

  // Send an HTTP `421 Misdirected Request` client error response
  public misdirectedRequest(body?: unknown) {
    return this.send(421, body)
  }

  // Send an HTTP `422 Unprocessable Entity` client error response
  public unprocessableEntity(body?: unknown) {
    return this.send(422, body)
  }

  // Send an HTTP `424 Failed Dependency` client error response
  public failedDependency(body?: unknown) {
    return this.send(424, body)
  }

  // Send an HTTP `428 Precondition Required` client error response
  public preconditionRequired(body?: unknown) {
    return this.send(428, body)
  }

  // Send an HTTP `429 Too Many Requests` client error response
  public tooManyRequests(body?: unknown) {
    return this.send(429, body)
  }

  // Send an HTTP `431 Request Header Fields Too Large` client error response
  public requestHeaderFieldsTooLarge(body?: unknown) {
    return this.send(431, body)
  }

  // Send an HTTP `451 Unavailable For Legal Reasons` client error response
  public unavailableForLegalReasons(body?: unknown) {
    return this.send(451, body)
  }

  // Send an HTTP `500 Internal Server Error` server error response
  public internalServerError(body?: unknown) {
    return this.send(500, body)
  }

  // Send an HTTP `501 Not Implemented` server error response
  public notImplemented(body?: unknown) {
    return this.send(501, body)
  }

  // Send an HTTP `502 Bad Gateway` server error response
  public badGateway(body?: unknown) {
    return this.send(502, body)
  }

  // Send an HTTP `503 Service Unavailable` server error response
  public serviceUnavailable(body?: unknown) {
    return this.send(503, body)
  }

  // Send an HTTP `504 Gateway Timeout` server error response
  public gatewayTimeout(body?: unknown) {
    return this.send(504, body)
  }

  // Send an HTTP `505 Http Version Not Supported` server error response
  public httpVersionNotSupported(body?: unknown) {
    return this.send(505, body)
  }

  // Send an HTTP `507 Insufficient Storage` server error response
  public insufficientStorage(body?: unknown) {
    return this.send(507, body)
  }

  // Send an HTTP `511 Network Authentication Required` server error response
  public networkAuthenticationRequired(body?: unknown) {
    return this.send(511, body)
  }

}
