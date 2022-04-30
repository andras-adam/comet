import { IHeaders } from './types'
import { Event } from './event'


export class ReplyManager {

  private readonly event: Event

  constructor(event: Event) {
    this.event = event
  }

  // Send an HTTP `100 Continue` informational response
  public continue(headers?: IHeaders) {
    return this.event.createReply(100, headers)
  }

  // Send an HTTP `101 Switching Protocols` informational response
  public switchingProtocols(headers?: IHeaders) {
    return this.event.createReply(101, headers)
  }

  // Send an HTTP `102 Processing` informational response
  public processing(headers?: IHeaders) {
    return this.event.createReply(102, headers)
  }

  // Send an HTTP `200 OK` successful response
  public ok(headers?: IHeaders) {
    return this.event.createReply(200, headers)
  }

  // Send an HTTP `201 Created` successful response
  public created(headers?: IHeaders) {
    return this.event.createReply(201, headers)
  }

  // Send an HTTP `202 Accepted` successful response
  public accepted(headers?: IHeaders) {
    return this.event.createReply(202, headers)
  }

  // Send an HTTP `203 Non-Authoritative Information` successful response
  public nonAuthoritativeInformation(headers?: IHeaders) {
    return this.event.createReply(203, headers)
  }

  // Send an HTTP `204 No Content` successful response
  public noContent(headers?: IHeaders) {
    return this.event.createReply(204, headers)
  }

  // Send an HTTP `205 Reset Content` successful response
  public resetContent(headers?: IHeaders) {
    return this.event.createReply(205, headers)
  }

  // Send an HTTP `206 Partial Content` successful response
  public partialContent(headers?: IHeaders) {
    return this.event.createReply(206, headers)
  }

  // Send an HTTP `207 Multi-Status` successful response
  public multiStatus(headers?: IHeaders) {
    return this.event.createReply(207, headers)
  }

  // Send an HTTP `300 Multiple Choices` redirection response
  public multipleChoices(headers?: IHeaders) {
    return this.event.createReply(300, headers)
  }

  // Send an HTTP `301 Moved Permanently` redirection response
  public movedPermanently(headers?: IHeaders) {
    return this.event.createReply(301, headers)
  }

  // Send an HTTP `302 Moved Temporarily` redirection response
  public movedTemporarily(headers?: IHeaders) {
    return this.event.createReply(302, headers)
  }

  // Send an HTTP `303 See Other` redirection response
  public seeOther(headers?: IHeaders) {
    return this.event.createReply(303, headers)
  }

  // Send an HTTP `304 Not Modified` redirection response
  public notModified(headers?: IHeaders) {
    return this.event.createReply(304, headers)
  }

  // Send an HTTP `305 Use Proxy` redirection response
  public useProxy(headers?: IHeaders) {
    return this.event.createReply(305, headers)
  }

  // Send an HTTP `307 Temporary Redirect` redirection response
  public temporaryRedirect(headers?: IHeaders) {
    return this.event.createReply(307, headers)
  }

  // Send an HTTP `308 Permanent Redirect` redirection response
  public permanentRedirect(headers?: IHeaders) {
    return this.event.createReply(308, headers)
  }

  // Send an HTTP `400 Bad Request` client error response
  public badRequest(headers?: IHeaders) {
    return this.event.createReply(400, headers)
  }

  // Send an HTTP `401 Unauthorized` client error response
  public unauthorized(headers?: IHeaders) {
    return this.event.createReply(401, headers)
  }

  // Send an HTTP `402 Payment Required` client error response
  public paymentRequired(headers?: IHeaders) {
    return this.event.createReply(402, headers)
  }

  // Send an HTTP `403 Forbidden` client error response
  public forbidden(headers?: IHeaders) {
    return this.event.createReply(403, headers)
  }

  // Send an HTTP `404 Not Found` client error response
  public notFound(headers?: IHeaders) {
    return this.event.createReply(404, headers)
  }

  // Send an HTTP `405 Method Not Allowed` client error response
  public methodNotAllowed(headers?: IHeaders) {
    return this.event.createReply(405, headers)
  }

  // Send an HTTP `406 Not Acceptable` client error response
  public notAcceptable(headers?: IHeaders) {
    return this.event.createReply(406, headers)
  }

  // Send an HTTP `407 Proxy Authentication Required` client error response
  public proxyAuthenticationRequired(headers?: IHeaders) {
    return this.event.createReply(407, headers)
  }

  // Send an HTTP `408 Request Timeout` client error response
  public requestTimeout(headers?: IHeaders) {
    return this.event.createReply(408, headers)
  }

  // Send an HTTP `409 Conflict` client error response
  public conflict(headers?: IHeaders) {
    return this.event.createReply(409, headers)
  }

  // Send an HTTP `410 Gone` client error response
  public gone(headers?: IHeaders) {
    return this.event.createReply(410, headers)
  }

  // Send an HTTP `411 Length Required` client error response
  public lengthRequired(headers?: IHeaders) {
    return this.event.createReply(411, headers)
  }

  // Send an HTTP `412 Precondition Failed` client error response
  public preconditionFailed(headers?: IHeaders) {
    return this.event.createReply(412, headers)
  }

  // Send an HTTP `413 Request Too Long` client error response
  public requestTooLong(headers?: IHeaders) {
    return this.event.createReply(413, headers)
  }

  // Send an HTTP `414 Request URI Too Long` client error response
  public requestUriTooLong(headers?: IHeaders) {
    return this.event.createReply(414, headers)
  }

  // Send an HTTP `415 Unsupported Media Type` client error response
  public unsupportedMediaType(headers?: IHeaders) {
    return this.event.createReply(415, headers)
  }

  // Send an HTTP `416 Requested Range Not Satisfiable` client error response
  public requestedRangeNotSatisfiable(headers?: IHeaders) {
    return this.event.createReply(416, headers)
  }

  // Send an HTTP `417 Expectation Failed` client error response
  public expectationFailed(headers?: IHeaders) {
    return this.event.createReply(417, headers)
  }

  // Send an HTTP `418 I'm a teapot` client error response
  public imATeapot(headers?: IHeaders) {
    return this.event.createReply(418, headers)
  }

  // Send an HTTP `419 Insufficient Space On Resource` client error response
  public insufficientSpaceOnResource(headers?: IHeaders) {
    return this.event.createReply(419, headers)
  }

  // Send an HTTP `420 Method Failure` client error response
  public methodFailure(headers?: IHeaders) {
    return this.event.createReply(420, headers)
  }

  // Send an HTTP `421 Misdirected Request` client error response
  public misdirectedRequest(headers?: IHeaders) {
    return this.event.createReply(421, headers)
  }

  // Send an HTTP `422 Unprocessable Entity` client error response
  public unprocessableEntity(headers?: IHeaders) {
    return this.event.createReply(422, headers)
  }

  // Send an HTTP `424 Failed Dependency` client error response
  public failedDependency(headers?: IHeaders) {
    return this.event.createReply(424, headers)
  }

  // Send an HTTP `428 Precondition Required` client error response
  public preconditionRequired(headers?: IHeaders) {
    return this.event.createReply(428, headers)
  }

  // Send an HTTP `429 Too Many Requests` client error response
  public tooManyRequests(headers?: IHeaders) {
    return this.event.createReply(429, headers)
  }

  // Send an HTTP `431 Request Header Fields Too Large` client error response
  public requestHeaderFieldsTooLarge(headers?: IHeaders) {
    return this.event.createReply(431, headers)
  }

  // Send an HTTP `451 Unavailable For Legal Reasons` client error response
  public unavailableForLegalReasons(headers?: IHeaders) {
    return this.event.createReply(451, headers)
  }

  // Send an HTTP `500 Internal Server Error` server error response
  public internalServerError(headers?: IHeaders) {
    return this.event.createReply(500, headers)
  }

  // Send an HTTP `501 Not Implemented` server error response
  public notImplemented(headers?: IHeaders) {
    return this.event.createReply(501, headers)
  }

  // Send an HTTP `502 Bad Gateway` server error response
  public badGateway(headers?: IHeaders) {
    return this.event.createReply(502, headers)
  }

  // Send an HTTP `503 Service Unavailable` server error response
  public serviceUnavailable(headers?: IHeaders) {
    return this.event.createReply(503, headers)
  }

  // Send an HTTP `504 Gateway Timeout` server error response
  public gatewayTimeout(headers?: IHeaders) {
    return this.event.createReply(504, headers)
  }

  // Send an HTTP `505 Http Version Not Supported` server error response
  public httpVersionNotSupported(headers?: IHeaders) {
    return this.event.createReply(505, headers)
  }

  // Send an HTTP `507 Insufficient Storage` server error response
  public insufficientStorage(headers?: IHeaders) {
    return this.event.createReply(507, headers)
  }

  // Send an HTTP `511 Network Authentication Required` server error response
  public networkAuthenticationRequired(headers?: IHeaders) {
    return this.event.createReply(511, headers)
  }

}
