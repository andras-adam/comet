import { Cookies } from './cookies'
import { cometLogger } from './logger'


export const statuses = {
  '100': 'continue',
  '101': 'switchingProtocols',
  '102': 'processing',
  '200': 'ok',
  '201': 'created',
  '202': 'accepted',
  '203': 'nonAuthoritativeInformation',
  '204': 'noContent',
  '205': 'resetContent',
  '206': 'partialContent',
  '207': 'multiStatus',
  '300': 'multipleChoices',
  '301': 'movedPermanently',
  '302': 'movedTemporarily',
  '303': 'seeOther',
  '304': 'notModified',
  '305': 'useProxy',
  '307': 'temporaryRedirect',
  '308': 'permanentRedirect',
  '400': 'badRequest',
  '401': 'unauthorized',
  '402': 'paymentRequired',
  '403': 'forbidden',
  '404': 'notFound',
  '405': 'methodNotAllowed',
  '406': 'notAcceptable',
  '407': 'proxyAuthenticationRequired',
  '408': 'requestTimeout',
  '409': 'conflict',
  '410': 'gone',
  '411': 'lengthRequired',
  '412': 'preconditionFailed',
  '413': 'requestTooLong',
  '414': 'requestUriTooLong',
  '415': 'unsupportedMediaType',
  '416': 'requestedRangeNotSatisfiable',
  '417': 'expectationFailed',
  '418': 'imATeapot',
  '419': 'insufficientSpaceOnResource',
  '420': 'methodFailure',
  '421': 'misdirectedRequest',
  '422': 'unprocessableEntity',
  '424': 'failedDependency',
  '428': 'preconditionRequired',
  '429': 'tooManyRequests',
  '431': 'requestHeaderFieldsTooLarge',
  '451': 'unavailableForLegalReasons',
  '500': 'internalServerError',
  '501': 'notImplemented',
  '502': 'badGateway',
  '503': 'serviceUnavailable',
  '504': 'gatewayTimeout',
  '505': 'httpVersionNotSupported',
  '507': 'insufficientStorage',
  '511': 'networkAuthenticationRequired'
} as const

export type SentReply<Status extends number, Body> = { status: Status; body: Body }

export class Reply {

  public sent?: Date
  public status = 200
  public body?: unknown
  public headers = new Headers()
  public cookies = new Cookies()

  // Send the response
  private send<Status extends number, Body>(status: Status, body: Body): SentReply<Status, Body> {
    if (this.sent) {
      cometLogger.warn('[Comet] Cannot send a reply after one has already been sent.')
      return { status, body }
    }
    this.sent = new Date()
    this.status = status
    this.body = body
    return { status, body }
  }

  // Send a custom HTTP response
  public custom<Status extends number>(status: Status): SentReply<Status, undefined>
  public custom<Status extends number, Body>(status: Status, body: Body): SentReply<Status, Body>
  public custom<Status extends number, Body>(status: Status, body?: Body) {
    return this.send(status, body)
  }

  // Send an HTTP `100 Continue` informational response
  public continue(): SentReply<100, undefined>
  public continue<Body>(body: Body): SentReply<100, Body>
  public continue<Body>(body?: Body) {
    return this.send(100, body)
  }

  // Send an HTTP `101 Switching Protocols` informational response
  public switchingProtocols(): SentReply<101, undefined>
  public switchingProtocols<Body>(body: Body): SentReply<101, Body>
  public switchingProtocols<Body>(body?: Body) {
    return this.send(101, body)
  }

  // Send an HTTP `102 Processing` informational response
  public processing(): SentReply<102, undefined>
  public processing<Body>(body: Body): SentReply<102, Body>
  public processing<Body>(body?: Body) {
    return this.send(102, body)
  }

  // Send an HTTP `200 OK` successful response
  public ok(): SentReply<200, undefined>
  public ok<Body>(body: Body): SentReply<200, Body>
  public ok<Body>(body?: Body) {
    return this.send(200, body)
  }

  // Send an HTTP `201 Created` successful response
  public created(): SentReply<201, undefined>
  public created<Body>(body: Body): SentReply<201, Body>
  public created<Body>(body?: Body) {
    return this.send(201, body)
  }

  // Send an HTTP `202 Accepted` successful response
  public accepted(): SentReply<202, undefined>
  public accepted<Body>(body: Body): SentReply<202, Body>
  public accepted<Body>(body?: Body) {
    return this.send(202, body)
  }

  // Send an HTTP `203 Non-Authoritative Information` successful response
  public nonAuthoritativeInformation(): SentReply<203, undefined>
  public nonAuthoritativeInformation<Body>(body: Body): SentReply<203, Body>
  public nonAuthoritativeInformation<Body>(body?: Body) {
    return this.send(203, body)
  }

  // Send an HTTP `204 No Content` successful response
  public noContent(): SentReply<204, undefined>
  public noContent<Body>(body: Body): SentReply<204, Body>
  public noContent<Body>(body?: Body) {
    return this.send(204, body)
  }

  // Send an HTTP `205 Reset Content` successful response
  public resetContent(): SentReply<205, undefined>
  public resetContent<Body>(body: Body): SentReply<205, Body>
  public resetContent<Body>(body?: Body) {
    return this.send(205, body)
  }

  // Send an HTTP `206 Partial Content` successful response
  public partialContent(): SentReply<206, undefined>
  public partialContent<Body>(body: Body): SentReply<206, Body>
  public partialContent<Body>(body?: Body) {
    return this.send(206, body)
  }

  // Send an HTTP `207 Multi-Status` successful response
  public multiStatus(): SentReply<207, undefined>
  public multiStatus<Body>(body: Body): SentReply<207, Body>
  public multiStatus<Body>(body?: Body) {
    return this.send(207, body)
  }

  // Send an HTTP `300 Multiple Choices` redirection response
  public multipleChoices(): SentReply<300, undefined>
  public multipleChoices<Body>(body: Body): SentReply<300, Body>
  public multipleChoices<Body>(body?: Body) {
    return this.send(300, body)
  }

  // Send an HTTP `301 Moved Permanently` redirection response
  public movedPermanently(): SentReply<301, undefined>
  public movedPermanently<Body>(body: Body): SentReply<301, Body>
  public movedPermanently<Body>(body?: Body) {
    return this.send(301, body)
  }

  // Send an HTTP `302 Moved Temporarily` redirection response
  public movedTemporarily(): SentReply<302, undefined>
  public movedTemporarily<Body>(body: Body): SentReply<302, Body>
  public movedTemporarily<Body>(body?: Body) {
    return this.send(302, body)
  }

  // Send an HTTP `303 See Other` redirection response
  public seeOther(): SentReply<303, undefined>
  public seeOther<Body>(body: Body): SentReply<303, Body>
  public seeOther<Body>(body?: Body) {
    return this.send(303, body)
  }

  // Send an HTTP `304 Not Modified` redirection response
  public notModified(): SentReply<304, undefined>
  public notModified<Body>(body: Body): SentReply<304, Body>
  public notModified<Body>(body?: Body) {
    return this.send(304, body)
  }

  // Send an HTTP `305 Use Proxy` redirection response
  public useProxy(): SentReply<305, undefined>
  public useProxy<Body>(body: Body): SentReply<305, Body>
  public useProxy<Body>(body?: Body) {
    return this.send(305, body)
  }

  // Send an HTTP `307 Temporary Redirect` redirection response
  public temporaryRedirect(): SentReply<307, undefined>
  public temporaryRedirect<Body>(body: Body): SentReply<307, Body>
  public temporaryRedirect<Body>(body?: Body) {
    return this.send(307, body)
  }

  // Send an HTTP `308 Permanent Redirect` redirection response
  public permanentRedirect(): SentReply<308, undefined>
  public permanentRedirect<Body>(body: Body): SentReply<308, Body>
  public permanentRedirect<Body>(body?: Body) {
    return this.send(308, body)
  }

  // Send an HTTP `400 Bad Request` client error response
  public badRequest(): SentReply<400, undefined>
  public badRequest<Body>(body: Body): SentReply<400, Body>
  public badRequest<Body>(body?: Body) {
    return this.send(400, body)
  }

  // Send an HTTP `401 Unauthorized` client error response
  public unauthorized(): SentReply<401, undefined>
  public unauthorized<Body>(body: Body): SentReply<401, Body>
  public unauthorized<Body>(body?: Body) {
    return this.send(401, body)
  }

  // Send an HTTP `402 Payment Required` client error response
  public paymentRequired(): SentReply<402, undefined>
  public paymentRequired<Body>(body: Body): SentReply<402, Body>
  public paymentRequired<Body>(body?: Body) {
    return this.send(402, body)
  }

  // Send an HTTP `403 Forbidden` client error response
  public forbidden(): SentReply<403, undefined>
  public forbidden<Body>(body: Body): SentReply<403, Body>
  public forbidden<Body>(body?: Body) {
    return this.send(403, body)
  }

  // Send an HTTP `404 Not Found` client error response
  public notFound(): SentReply<404, undefined>
  public notFound<Body>(body: Body): SentReply<404, Body>
  public notFound<Body>(body?: Body) {
    return this.send(404, body)
  }

  // Send an HTTP `405 Method Not Allowed` client error response
  public methodNotAllowed(): SentReply<405, undefined>
  public methodNotAllowed<Body>(body: Body): SentReply<405, Body>
  public methodNotAllowed<Body>(body?: Body) {
    return this.send(405, body)
  }

  // Send an HTTP `406 Not Acceptable` client error response
  public notAcceptable(): SentReply<406, undefined>
  public notAcceptable<Body>(body: Body): SentReply<406, Body>
  public notAcceptable<Body>(body?: Body) {
    return this.send(406, body)
  }

  // Send an HTTP `407 Proxy Authentication Required` client error response
  public proxyAuthenticationRequired(): SentReply<407, undefined>
  public proxyAuthenticationRequired<Body>(body: Body): SentReply<407, Body>
  public proxyAuthenticationRequired<Body>(body?: Body) {
    return this.send(407, body)
  }

  // Send an HTTP `408 Request Timeout` client error response
  public requestTimeout(): SentReply<408, undefined>
  public requestTimeout<Body>(body: Body): SentReply<408, Body>
  public requestTimeout<Body>(body?: Body) {
    return this.send(408, body)
  }

  // Send an HTTP `409 Conflict` client error response
  public conflict(): SentReply<409, undefined>
  public conflict<Body>(body: Body): SentReply<409, Body>
  public conflict<Body>(body?: Body) {
    return this.send(409, body)
  }

  // Send an HTTP `410 Gone` client error response
  public gone(): SentReply<410, undefined>
  public gone<Body>(body: Body): SentReply<410, Body>
  public gone<Body>(body?: Body) {
    return this.send(410, body)
  }

  // Send an HTTP `411 Length Required` client error response
  public lengthRequired(): SentReply<411, undefined>
  public lengthRequired<Body>(body: Body): SentReply<411, Body>
  public lengthRequired<Body>(body?: Body) {
    return this.send(411, body)
  }

  // Send an HTTP `412 Precondition Failed` client error response
  public preconditionFailed(): SentReply<412, undefined>
  public preconditionFailed<Body>(body: Body): SentReply<412, Body>
  public preconditionFailed<Body>(body?: Body) {
    return this.send(412, body)
  }

  // Send an HTTP `413 Request Too Long` client error response
  public requestTooLong(): SentReply<413, undefined>
  public requestTooLong<Body>(body: Body): SentReply<413, Body>
  public requestTooLong<Body>(body?: Body) {
    return this.send(413, body)
  }

  // Send an HTTP `414 Request URI Too Long` client error response
  public requestUriTooLong(): SentReply<414, undefined>
  public requestUriTooLong<Body>(body: Body): SentReply<414, Body>
  public requestUriTooLong<Body>(body?: Body) {
    return this.send(414, body)
  }

  // Send an HTTP `415 Unsupported Media Type` client error response
  public unsupportedMediaType(): SentReply<415, undefined>
  public unsupportedMediaType<Body>(body: Body): SentReply<415, Body>
  public unsupportedMediaType<Body>(body?: Body) {
    return this.send(415, body)
  }

  // Send an HTTP `416 Requested Range Not Satisfiable` client error response
  public requestedRangeNotSatisfiable(): SentReply<416, undefined>
  public requestedRangeNotSatisfiable<Body>(body: Body): SentReply<416, Body>
  public requestedRangeNotSatisfiable<Body>(body?: Body) {
    return this.send(416, body)
  }

  // Send an HTTP `417 Expectation Failed` client error response
  public expectationFailed(): SentReply<417, undefined>
  public expectationFailed<Body>(body: Body): SentReply<417, Body>
  public expectationFailed<Body>(body?: Body) {
    return this.send(417, body)
  }

  // Send an HTTP `418 I'm a teapot` client error response
  public imATeapot(): SentReply<418, undefined>
  public imATeapot<Body>(body: Body): SentReply<418, Body>
  public imATeapot<Body>(body?: Body) {
    return this.send(418, body)
  }

  // Send an HTTP `419 Insufficient Space On Resource` client error response
  public insufficientSpaceOnResource(): SentReply<419, undefined>
  public insufficientSpaceOnResource<Body>(body: Body): SentReply<419, Body>
  public insufficientSpaceOnResource<Body>(body?: Body) {
    return this.send(419, body)
  }

  // Send an HTTP `420 Method Failure` client error response
  public methodFailure(): SentReply<420, undefined>
  public methodFailure<Body>(body: Body): SentReply<420, Body>
  public methodFailure<Body>(body?: Body) {
    return this.send(420, body)
  }

  // Send an HTTP `421 Misdirected Request` client error response
  public misdirectedRequest(): SentReply<421, undefined>
  public misdirectedRequest<Body>(body: Body): SentReply<421, Body>
  public misdirectedRequest<Body>(body?: Body) {
    return this.send(421, body)
  }

  // Send an HTTP `422 Unprocessable Entity` client error response
  public unprocessableEntity(): SentReply<422, undefined>
  public unprocessableEntity<Body>(body: Body): SentReply<422, Body>
  public unprocessableEntity<Body>(body?: Body) {
    return this.send(422, body)
  }

  // Send an HTTP `424 Failed Dependency` client error response
  public failedDependency(): SentReply<424, undefined>
  public failedDependency<Body>(body: Body): SentReply<424, Body>
  public failedDependency<Body>(body?: Body) {
    return this.send(424, body)
  }

  // Send an HTTP `428 Precondition Required` client error response
  public preconditionRequired(): SentReply<428, undefined>
  public preconditionRequired<Body>(body: Body): SentReply<428, Body>
  public preconditionRequired<Body>(body?: Body) {
    return this.send(428, body)
  }

  // Send an HTTP `429 Too Many Requests` client error response
  public tooManyRequests(): SentReply<429, undefined>
  public tooManyRequests<Body>(body: Body): SentReply<429, Body>
  public tooManyRequests<Body>(body?: Body) {
    return this.send(429, body)
  }

  // Send an HTTP `431 Request Header Fields Too Large` client error response
  public requestHeaderFieldsTooLarge(): SentReply<431, undefined>
  public requestHeaderFieldsTooLarge<Body>(body: Body): SentReply<431, Body>
  public requestHeaderFieldsTooLarge<Body>(body?: Body) {
    return this.send(431, body)
  }

  // Send an HTTP `451 Unavailable For Legal Reasons` client error response
  public unavailableForLegalReasons(): SentReply<451, undefined>
  public unavailableForLegalReasons<Body>(body: Body): SentReply<451, Body>
  public unavailableForLegalReasons<Body>(body?: Body) {
    return this.send(451, body)
  }

  // Send an HTTP `500 Internal Server Error` server error response
  public internalServerError(): SentReply<500, undefined>
  public internalServerError<Body>(body: Body): SentReply<500, Body>
  public internalServerError<Body>(body?: Body) {
    return this.send(500, body)
  }

  // Send an HTTP `501 Not Implemented` server error response
  public notImplemented(): SentReply<501, undefined>
  public notImplemented<Body>(body: Body): SentReply<501, Body>
  public notImplemented<Body>(body?: Body) {
    return this.send(501, body)
  }

  // Send an HTTP `502 Bad Gateway` server error response
  public badGateway(): SentReply<502, undefined>
  public badGateway<Body>(body: Body): SentReply<502, Body>
  public badGateway<Body>(body?: Body) {
    return this.send(502, body)
  }

  // Send an HTTP `503 Service Unavailable` server error response
  public serviceUnavailable(): SentReply<503, undefined>
  public serviceUnavailable<Body>(body: Body): SentReply<503, Body>
  public serviceUnavailable<Body>(body?: Body) {
    return this.send(503, body)
  }

  // Send an HTTP `504 Gateway Timeout` server error response
  public gatewayTimeout(): SentReply<504, undefined>
  public gatewayTimeout<Body>(body: Body): SentReply<504, Body>
  public gatewayTimeout<Body>(body?: Body) {
    return this.send(504, body)
  }

  // Send an HTTP `505 Http Version Not Supported` server error response
  public httpVersionNotSupported(): SentReply<505, undefined>
  public httpVersionNotSupported<Body>(body: Body): SentReply<505, Body>
  public httpVersionNotSupported<Body>(body?: Body) {
    return this.send(505, body)
  }

  // Send an HTTP `507 Insufficient Storage` server error response
  public insufficientStorage(): SentReply<507, undefined>
  public insufficientStorage<Body>(body: Body): SentReply<507, Body>
  public insufficientStorage<Body>(body?: Body) {
    return this.send(507, body)
  }

  // Send an HTTP `511 Network Authentication Required` server error response
  public networkAuthenticationRequired(): SentReply<511, undefined>
  public networkAuthenticationRequired<Body>(body: Body): SentReply<511, Body>
  public networkAuthenticationRequired<Body>(body?: Body) {
    return this.send(511, body)
  }

}
