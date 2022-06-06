import { Body } from './types'
import { Cookies } from './cookies'


export class Reply {

  public sent = false
  public status = 200
  public body?: Body
  public readonly headers = new Headers()
  public readonly cookies = new Cookies()

  // Send a custom HTTP response
  private send(status: number, body?: Body): Reply {
    if (this.sent) {
      console.warn('[Comet] Cannot send a reply after one has already been sent.')
      return this
    }
    this.sent = true
    this.status = status
    this.body = body
    return this
  }

  // Send a custom HTTP response
  public custom(status: number, body?: Body) {
    return this.send(status, body)
  }

  // Send an HTTP `100 Continue` informational response
  public continue(body?: Body) {
    return this.send(100, body)
  }

  // Send an HTTP `101 Switching Protocols` informational response
  public switchingProtocols(body?: Body) {
    return this.send(101, body)
  }

  // Send an HTTP `102 Processing` informational response
  public processing(body?: Body) {
    return this.send(102, body)
  }

  // Send an HTTP `200 OK` successful response
  public ok(body?: Body) {
    return this.send(200, body)
  }

  // Send an HTTP `201 Created` successful response
  public created(body?: Body) {
    return this.send(201, body)
  }

  // Send an HTTP `202 Accepted` successful response
  public accepted(body?: Body) {
    return this.send(202, body)
  }

  // Send an HTTP `203 Non-Authoritative Information` successful response
  public nonAuthoritativeInformation(body?: Body) {
    return this.send(203, body)
  }

  // Send an HTTP `204 No Content` successful response
  public noContent(body?: Body) {
    return this.send(204, body)
  }

  // Send an HTTP `205 Reset Content` successful response
  public resetContent(body?: Body) {
    return this.send(205, body)
  }

  // Send an HTTP `206 Partial Content` successful response
  public partialContent(body?: Body) {
    return this.send(206, body)
  }

  // Send an HTTP `207 Multi-Status` successful response
  public multiStatus(body?: Body) {
    return this.send(207, body)
  }

  // Send an HTTP `300 Multiple Choices` redirection response
  public multipleChoices(body?: Body) {
    return this.send(300, body)
  }

  // Send an HTTP `301 Moved Permanently` redirection response
  public movedPermanently(body?: Body) {
    return this.send(301, body)
  }

  // Send an HTTP `302 Moved Temporarily` redirection response
  public movedTemporarily(body?: Body) {
    return this.send(302, body)
  }

  // Send an HTTP `303 See Other` redirection response
  public seeOther(body?: Body) {
    return this.send(303, body)
  }

  // Send an HTTP `304 Not Modified` redirection response
  public notModified(body?: Body) {
    return this.send(304, body)
  }

  // Send an HTTP `305 Use Proxy` redirection response
  public useProxy(body?: Body) {
    return this.send(305, body)
  }

  // Send an HTTP `307 Temporary Redirect` redirection response
  public temporaryRedirect(body?: Body) {
    return this.send(307, body)
  }

  // Send an HTTP `308 Permanent Redirect` redirection response
  public permanentRedirect(body?: Body) {
    return this.send(308, body)
  }

  // Send an HTTP `400 Bad Request` client error response
  public badRequest(body?: Body) {
    return this.send(400, body)
  }

  // Send an HTTP `401 Unauthorized` client error response
  public unauthorized(body?: Body) {
    return this.send(401, body)
  }

  // Send an HTTP `402 Payment Required` client error response
  public paymentRequired(body?: Body) {
    return this.send(402, body)
  }

  // Send an HTTP `403 Forbidden` client error response
  public forbidden(body?: Body) {
    return this.send(403, body)
  }

  // Send an HTTP `404 Not Found` client error response
  public notFound(body?: Body) {
    return this.send(404, body)
  }

  // Send an HTTP `405 Method Not Allowed` client error response
  public methodNotAllowed(body?: Body) {
    return this.send(405, body)
  }

  // Send an HTTP `406 Not Acceptable` client error response
  public notAcceptable(body?: Body) {
    return this.send(406, body)
  }

  // Send an HTTP `407 Proxy Authentication Required` client error response
  public proxyAuthenticationRequired(body?: Body) {
    return this.send(407, body)
  }

  // Send an HTTP `408 Request Timeout` client error response
  public requestTimeout(body?: Body) {
    return this.send(408, body)
  }

  // Send an HTTP `409 Conflict` client error response
  public conflict(body?: Body) {
    return this.send(409, body)
  }

  // Send an HTTP `410 Gone` client error response
  public gone(body?: Body) {
    return this.send(410, body)
  }

  // Send an HTTP `411 Length Required` client error response
  public lengthRequired(body?: Body) {
    return this.send(411, body)
  }

  // Send an HTTP `412 Precondition Failed` client error response
  public preconditionFailed(body?: Body) {
    return this.send(412, body)
  }

  // Send an HTTP `413 Request Too Long` client error response
  public requestTooLong(body?: Body) {
    return this.send(413, body)
  }

  // Send an HTTP `414 Request URI Too Long` client error response
  public requestUriTooLong(body?: Body) {
    return this.send(414, body)
  }

  // Send an HTTP `415 Unsupported Media Type` client error response
  public unsupportedMediaType(body?: Body) {
    return this.send(415, body)
  }

  // Send an HTTP `416 Requested Range Not Satisfiable` client error response
  public requestedRangeNotSatisfiable(body?: Body) {
    return this.send(416, body)
  }

  // Send an HTTP `417 Expectation Failed` client error response
  public expectationFailed(body?: Body) {
    return this.send(417, body)
  }

  // Send an HTTP `418 I'm a teapot` client error response
  public imATeapot(body?: Body) {
    return this.send(418, body)
  }

  // Send an HTTP `419 Insufficient Space On Resource` client error response
  public insufficientSpaceOnResource(body?: Body) {
    return this.send(419, body)
  }

  // Send an HTTP `420 Method Failure` client error response
  public methodFailure(body?: Body) {
    return this.send(420, body)
  }

  // Send an HTTP `421 Misdirected Request` client error response
  public misdirectedRequest(body?: Body) {
    return this.send(421, body)
  }

  // Send an HTTP `422 Unprocessable Entity` client error response
  public unprocessableEntity(body?: Body) {
    return this.send(422, body)
  }

  // Send an HTTP `424 Failed Dependency` client error response
  public failedDependency(body?: Body) {
    return this.send(424, body)
  }

  // Send an HTTP `428 Precondition Required` client error response
  public preconditionRequired(body?: Body) {
    return this.send(428, body)
  }

  // Send an HTTP `429 Too Many Requests` client error response
  public tooManyRequests(body?: Body) {
    return this.send(429, body)
  }

  // Send an HTTP `431 Request Header Fields Too Large` client error response
  public requestHeaderFieldsTooLarge(body?: Body) {
    return this.send(431, body)
  }

  // Send an HTTP `451 Unavailable For Legal Reasons` client error response
  public unavailableForLegalReasons(body?: Body) {
    return this.send(451, body)
  }

  // Send an HTTP `500 Internal Server Error` server error response
  public internalServerError(body?: Body) {
    return this.send(500, body)
  }

  // Send an HTTP `501 Not Implemented` server error response
  public notImplemented(body?: Body) {
    return this.send(501, body)
  }

  // Send an HTTP `502 Bad Gateway` server error response
  public badGateway(body?: Body) {
    return this.send(502, body)
  }

  // Send an HTTP `503 Service Unavailable` server error response
  public serviceUnavailable(body?: Body) {
    return this.send(503, body)
  }

  // Send an HTTP `504 Gateway Timeout` server error response
  public gatewayTimeout(body?: Body) {
    return this.send(504, body)
  }

  // Send an HTTP `505 Http Version Not Supported` server error response
  public httpVersionNotSupported(body?: Body) {
    return this.send(505, body)
  }

  // Send an HTTP `507 Insufficient Storage` server error response
  public insufficientStorage(body?: Body) {
    return this.send(507, body)
  }

  // Send an HTTP `511 Network Authentication Required` server error response
  public networkAuthenticationRequired(body?: Body) {
    return this.send(511, body)
  }

}
