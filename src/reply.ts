import { Event } from './event'
import { Body } from './types'


export class ReplyManager {

  private readonly event: Event

  public readonly headers = new Headers()

  constructor(event: Event) {
    this.event = event
  }

  // Send an HTTP `100 Continue` informational response
  public continue(body?: Body) {
    return this.event.createReply(100, this.headers, body)
  }

  // Send an HTTP `101 Switching Protocols` informational response
  public switchingProtocols(body?: Body) {
    return this.event.createReply(101, this.headers, body)
  }

  // Send an HTTP `102 Processing` informational response
  public processing(body?: Body) {
    return this.event.createReply(102, this.headers, body)
  }

  // Send an HTTP `200 OK` successful response
  public ok(body?: Body) {
    return this.event.createReply(200, this.headers, body)
  }

  // Send an HTTP `201 Created` successful response
  public created(body?: Body) {
    return this.event.createReply(201, this.headers, body)
  }

  // Send an HTTP `202 Accepted` successful response
  public accepted(body?: Body) {
    return this.event.createReply(202, this.headers, body)
  }

  // Send an HTTP `203 Non-Authoritative Information` successful response
  public nonAuthoritativeInformation(body?: Body) {
    return this.event.createReply(203, this.headers, body)
  }

  // Send an HTTP `204 No Content` successful response
  public noContent(body?: Body) {
    return this.event.createReply(204, this.headers, body)
  }

  // Send an HTTP `205 Reset Content` successful response
  public resetContent(body?: Body) {
    return this.event.createReply(205, this.headers, body)
  }

  // Send an HTTP `206 Partial Content` successful response
  public partialContent(body?: Body) {
    return this.event.createReply(206, this.headers, body)
  }

  // Send an HTTP `207 Multi-Status` successful response
  public multiStatus(body?: Body) {
    return this.event.createReply(207, this.headers, body)
  }

  // Send an HTTP `300 Multiple Choices` redirection response
  public multipleChoices(body?: Body) {
    return this.event.createReply(300, this.headers, body)
  }

  // Send an HTTP `301 Moved Permanently` redirection response
  public movedPermanently(body?: Body) {
    return this.event.createReply(301, this.headers, body)
  }

  // Send an HTTP `302 Moved Temporarily` redirection response
  public movedTemporarily(body?: Body) {
    return this.event.createReply(302, this.headers, body)
  }

  // Send an HTTP `303 See Other` redirection response
  public seeOther(body?: Body) {
    return this.event.createReply(303, this.headers, body)
  }

  // Send an HTTP `304 Not Modified` redirection response
  public notModified(body?: Body) {
    return this.event.createReply(304, this.headers, body)
  }

  // Send an HTTP `305 Use Proxy` redirection response
  public useProxy(body?: Body) {
    return this.event.createReply(305, this.headers, body)
  }

  // Send an HTTP `307 Temporary Redirect` redirection response
  public temporaryRedirect(body?: Body) {
    return this.event.createReply(307, this.headers, body)
  }

  // Send an HTTP `308 Permanent Redirect` redirection response
  public permanentRedirect(body?: Body) {
    return this.event.createReply(308, this.headers, body)
  }

  // Send an HTTP `400 Bad Request` client error response
  public badRequest(body?: Body) {
    return this.event.createReply(400, this.headers, body)
  }

  // Send an HTTP `401 Unauthorized` client error response
  public unauthorized(body?: Body) {
    return this.event.createReply(401, this.headers, body)
  }

  // Send an HTTP `402 Payment Required` client error response
  public paymentRequired(body?: Body) {
    return this.event.createReply(402, this.headers, body)
  }

  // Send an HTTP `403 Forbidden` client error response
  public forbidden(body?: Body) {
    return this.event.createReply(403, this.headers, body)
  }

  // Send an HTTP `404 Not Found` client error response
  public notFound(body?: Body) {
    return this.event.createReply(404, this.headers, body)
  }

  // Send an HTTP `405 Method Not Allowed` client error response
  public methodNotAllowed(body?: Body) {
    return this.event.createReply(405, this.headers, body)
  }

  // Send an HTTP `406 Not Acceptable` client error response
  public notAcceptable(body?: Body) {
    return this.event.createReply(406, this.headers, body)
  }

  // Send an HTTP `407 Proxy Authentication Required` client error response
  public proxyAuthenticationRequired(body?: Body) {
    return this.event.createReply(407, this.headers, body)
  }

  // Send an HTTP `408 Request Timeout` client error response
  public requestTimeout(body?: Body) {
    return this.event.createReply(408, this.headers, body)
  }

  // Send an HTTP `409 Conflict` client error response
  public conflict(body?: Body) {
    return this.event.createReply(409, this.headers, body)
  }

  // Send an HTTP `410 Gone` client error response
  public gone(body?: Body) {
    return this.event.createReply(410, this.headers, body)
  }

  // Send an HTTP `411 Length Required` client error response
  public lengthRequired(body?: Body) {
    return this.event.createReply(411, this.headers, body)
  }

  // Send an HTTP `412 Precondition Failed` client error response
  public preconditionFailed(body?: Body) {
    return this.event.createReply(412, this.headers, body)
  }

  // Send an HTTP `413 Request Too Long` client error response
  public requestTooLong(body?: Body) {
    return this.event.createReply(413, this.headers, body)
  }

  // Send an HTTP `414 Request URI Too Long` client error response
  public requestUriTooLong(body?: Body) {
    return this.event.createReply(414, this.headers, body)
  }

  // Send an HTTP `415 Unsupported Media Type` client error response
  public unsupportedMediaType(body?: Body) {
    return this.event.createReply(415, this.headers, body)
  }

  // Send an HTTP `416 Requested Range Not Satisfiable` client error response
  public requestedRangeNotSatisfiable(body?: Body) {
    return this.event.createReply(416, this.headers, body)
  }

  // Send an HTTP `417 Expectation Failed` client error response
  public expectationFailed(body?: Body) {
    return this.event.createReply(417, this.headers, body)
  }

  // Send an HTTP `418 I'm a teapot` client error response
  public imATeapot(body?: Body) {
    return this.event.createReply(418, this.headers, body)
  }

  // Send an HTTP `419 Insufficient Space On Resource` client error response
  public insufficientSpaceOnResource(body?: Body) {
    return this.event.createReply(419, this.headers, body)
  }

  // Send an HTTP `420 Method Failure` client error response
  public methodFailure(body?: Body) {
    return this.event.createReply(420, this.headers, body)
  }

  // Send an HTTP `421 Misdirected Request` client error response
  public misdirectedRequest(body?: Body) {
    return this.event.createReply(421, this.headers, body)
  }

  // Send an HTTP `422 Unprocessable Entity` client error response
  public unprocessableEntity(body?: Body) {
    return this.event.createReply(422, this.headers, body)
  }

  // Send an HTTP `424 Failed Dependency` client error response
  public failedDependency(body?: Body) {
    return this.event.createReply(424, this.headers, body)
  }

  // Send an HTTP `428 Precondition Required` client error response
  public preconditionRequired(body?: Body) {
    return this.event.createReply(428, this.headers, body)
  }

  // Send an HTTP `429 Too Many Requests` client error response
  public tooManyRequests(body?: Body) {
    return this.event.createReply(429, this.headers, body)
  }

  // Send an HTTP `431 Request Header Fields Too Large` client error response
  public requestHeaderFieldsTooLarge(body?: Body) {
    return this.event.createReply(431, this.headers, body)
  }

  // Send an HTTP `451 Unavailable For Legal Reasons` client error response
  public unavailableForLegalReasons(body?: Body) {
    return this.event.createReply(451, this.headers, body)
  }

  // Send an HTTP `500 Internal Server Error` server error response
  public internalServerError(body?: Body) {
    return this.event.createReply(500, this.headers, body)
  }

  // Send an HTTP `501 Not Implemented` server error response
  public notImplemented(body?: Body) {
    return this.event.createReply(501, this.headers, body)
  }

  // Send an HTTP `502 Bad Gateway` server error response
  public badGateway(body?: Body) {
    return this.event.createReply(502, this.headers, body)
  }

  // Send an HTTP `503 Service Unavailable` server error response
  public serviceUnavailable(body?: Body) {
    return this.event.createReply(503, this.headers, body)
  }

  // Send an HTTP `504 Gateway Timeout` server error response
  public gatewayTimeout(body?: Body) {
    return this.event.createReply(504, this.headers, body)
  }

  // Send an HTTP `505 Http Version Not Supported` server error response
  public httpVersionNotSupported(body?: Body) {
    return this.event.createReply(505, this.headers, body)
  }

  // Send an HTTP `507 Insufficient Storage` server error response
  public insufficientStorage(body?: Body) {
    return this.event.createReply(507, this.headers, body)
  }

  // Send an HTTP `511 Network Authentication Required` server error response
  public networkAuthenticationRequired(body?: Body) {
    return this.event.createReply(511, this.headers, body)
  }

}
