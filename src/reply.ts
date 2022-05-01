import { IBody, IHeaders } from './types'
import { Event } from './event'


export class ReplyManager {

  private readonly event: Event

  constructor(event: Event) {
    this.event = event
  }

  // Send an HTTP `100 Continue` informational response
  public continue(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(100, body, headers)
  }

  // Send an HTTP `101 Switching Protocols` informational response
  public switchingProtocols(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(101, body, headers)
  }

  // Send an HTTP `102 Processing` informational response
  public processing(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(102, body, headers)
  }

  // Send an HTTP `200 OK` successful response
  public ok(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(200, body, headers)
  }

  // Send an HTTP `201 Created` successful response
  public created(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(201, body, headers)
  }

  // Send an HTTP `202 Accepted` successful response
  public accepted(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(202, body, headers)
  }

  // Send an HTTP `203 Non-Authoritative Information` successful response
  public nonAuthoritativeInformation(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(203, body, headers)
  }

  // Send an HTTP `204 No Content` successful response
  public noContent(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(204, body, headers)
  }

  // Send an HTTP `205 Reset Content` successful response
  public resetContent(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(205, body, headers)
  }

  // Send an HTTP `206 Partial Content` successful response
  public partialContent(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(206, body, headers)
  }

  // Send an HTTP `207 Multi-Status` successful response
  public multiStatus(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(207, body, headers)
  }

  // Send an HTTP `300 Multiple Choices` redirection response
  public multipleChoices(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(300, body, headers)
  }

  // Send an HTTP `301 Moved Permanently` redirection response
  public movedPermanently(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(301, body, headers)
  }

  // Send an HTTP `302 Moved Temporarily` redirection response
  public movedTemporarily(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(302, body, headers)
  }

  // Send an HTTP `303 See Other` redirection response
  public seeOther(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(303, body, headers)
  }

  // Send an HTTP `304 Not Modified` redirection response
  public notModified(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(304, body, headers)
  }

  // Send an HTTP `305 Use Proxy` redirection response
  public useProxy(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(305, body, headers)
  }

  // Send an HTTP `307 Temporary Redirect` redirection response
  public temporaryRedirect(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(307, body, headers)
  }

  // Send an HTTP `308 Permanent Redirect` redirection response
  public permanentRedirect(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(308, body, headers)
  }

  // Send an HTTP `400 Bad Request` client error response
  public badRequest(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(400, body, headers)
  }

  // Send an HTTP `401 Unauthorized` client error response
  public unauthorized(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(401, body, headers)
  }

  // Send an HTTP `402 Payment Required` client error response
  public paymentRequired(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(402, body, headers)
  }

  // Send an HTTP `403 Forbidden` client error response
  public forbidden(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(403, body, headers)
  }

  // Send an HTTP `404 Not Found` client error response
  public notFound(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(404, body, headers)
  }

  // Send an HTTP `405 Method Not Allowed` client error response
  public methodNotAllowed(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(405, body, headers)
  }

  // Send an HTTP `406 Not Acceptable` client error response
  public notAcceptable(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(406, body, headers)
  }

  // Send an HTTP `407 Proxy Authentication Required` client error response
  public proxyAuthenticationRequired(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(407, body, headers)
  }

  // Send an HTTP `408 Request Timeout` client error response
  public requestTimeout(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(408, body, headers)
  }

  // Send an HTTP `409 Conflict` client error response
  public conflict(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(409, body, headers)
  }

  // Send an HTTP `410 Gone` client error response
  public gone(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(410, body, headers)
  }

  // Send an HTTP `411 Length Required` client error response
  public lengthRequired(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(411, body, headers)
  }

  // Send an HTTP `412 Precondition Failed` client error response
  public preconditionFailed(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(412, body, headers)
  }

  // Send an HTTP `413 Request Too Long` client error response
  public requestTooLong(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(413, body, headers)
  }

  // Send an HTTP `414 Request URI Too Long` client error response
  public requestUriTooLong(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(414, body, headers)
  }

  // Send an HTTP `415 Unsupported Media Type` client error response
  public unsupportedMediaType(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(415, body, headers)
  }

  // Send an HTTP `416 Requested Range Not Satisfiable` client error response
  public requestedRangeNotSatisfiable(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(416, body, headers)
  }

  // Send an HTTP `417 Expectation Failed` client error response
  public expectationFailed(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(417, body, headers)
  }

  // Send an HTTP `418 I'm a teapot` client error response
  public imATeapot(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(418, body, headers)
  }

  // Send an HTTP `419 Insufficient Space On Resource` client error response
  public insufficientSpaceOnResource(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(419, body, headers)
  }

  // Send an HTTP `420 Method Failure` client error response
  public methodFailure(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(420, body, headers)
  }

  // Send an HTTP `421 Misdirected Request` client error response
  public misdirectedRequest(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(421, body, headers)
  }

  // Send an HTTP `422 Unprocessable Entity` client error response
  public unprocessableEntity(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(422, body, headers)
  }

  // Send an HTTP `424 Failed Dependency` client error response
  public failedDependency(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(424, body, headers)
  }

  // Send an HTTP `428 Precondition Required` client error response
  public preconditionRequired(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(428, body, headers)
  }

  // Send an HTTP `429 Too Many Requests` client error response
  public tooManyRequests(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(429, body, headers)
  }

  // Send an HTTP `431 Request Header Fields Too Large` client error response
  public requestHeaderFieldsTooLarge(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(431, body, headers)
  }

  // Send an HTTP `451 Unavailable For Legal Reasons` client error response
  public unavailableForLegalReasons(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(451, body, headers)
  }

  // Send an HTTP `500 Internal Server Error` server error response
  public internalServerError(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(500, body, headers)
  }

  // Send an HTTP `501 Not Implemented` server error response
  public notImplemented(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(501, body, headers)
  }

  // Send an HTTP `502 Bad Gateway` server error response
  public badGateway(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(502, body, headers)
  }

  // Send an HTTP `503 Service Unavailable` server error response
  public serviceUnavailable(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(503, body, headers)
  }

  // Send an HTTP `504 Gateway Timeout` server error response
  public gatewayTimeout(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(504, body, headers)
  }

  // Send an HTTP `505 Http Version Not Supported` server error response
  public httpVersionNotSupported(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(505, body, headers)
  }

  // Send an HTTP `507 Insufficient Storage` server error response
  public insufficientStorage(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(507, body, headers)
  }

  // Send an HTTP `511 Network Authentication Required` server error response
  public networkAuthenticationRequired(body?: IBody, headers?: IHeaders) {
    return this.event.createReply(511, body, headers)
  }

}
