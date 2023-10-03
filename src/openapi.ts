import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { Route } from './router'
import { Status } from './reply'


// Based on https://spec.openapis.org/oas/latest.html#version-3-1-0

// TODO possibly type url as template type
// TODO possibly type expressions as defined in https://spec.openapis.org/oas/latest.html#runtime-expressions

type Server = {
  url: string
  description?: string
  variables?: Record<string, {
    enum?: string[]
    default: string
    description?: string
  }>
}

type PathItem = {
  $ref?: string
  summary?: string
  description?: string
  tags?: string[]
  get?: Operation
  put?: Operation
  post?: Operation
  delete?: Operation
  options?: Operation
  head?: Operation
  patch?: Operation
  trace?: Operation
  servers?: Server
  parameters?: Array<Parameter | Reference>
}

type Parameter = {
  name: string
  description?: string
  deprecated?: boolean
  /**
   * @deprecated
   */
  allowEmptyValue?: boolean
  // TODO style ?
} & ({
  in: 'path'
  required: true
} | {
  in: 'query' | 'header' | 'cookie'
  required?: boolean
})

type Reference = {
  $ref: string
  summary?: string
  description?: string
}

type Example = {
  summary?: string
  description?: string
} & ({
  value?: unknown
} | {
  externalValue?: string
})

type Schema = {
  discriminator?: {
    propertyName: string
    mapping?: Record<string, string>
  }
  xml: {
    name?: string
    namespace?: string
    prefix?: string
    attribute?: boolean
    wrapped?: boolean
  }
  externalDocs: ExternalDocumentation
  /**
   * @deprecated
   */
  example: unknown
}

type Header = Omit<Parameter, 'name' | 'in'>

type Link = ({
  operationRef?: string
} & {
  operationId?: string
}) | {
  parameters?: Record<string, unknown>
  requestBody?: unknown
  description?: string
  server?: Server
}

type SecurityScheme = {
  description?: string
} & ({
  type: 'apiKey'
  name: string
  in: 'query' | 'header' | 'cookie'
} | ({
  type: 'http'
} & ({
  scheme: 'basic' | 'digest' | 'hoba' | 'mutual' | 'negotiate' | 'oauth' | 'scram-sha-1' | 'scram-sha-256' | 'vapid' | string
} | {
  scheme: 'bearer'
  bearerFormat?: string
})) | {
  type: 'mutualTLS'
} | {
  type: 'oauth2'
  flows: {
    [flow in 'implicit' | 'password' | 'clientCredentials' | 'authorizationCode']?: {
      refreshUrl: string
      scopes: Record<string, string>
  } & (flow extends 'implicit' | 'authorizationCode' ? {
      authorizationUrl: string
  } : Record<string, never>) & (flow extends 'password' | 'clientCredentials' | 'authorizationCode' ? {
      tokenUrl: string
  } : Record<string, never>)
  }
} | {
  type: 'openIdConnect'
  openIdConnectUrl: string
})

type Callback = Record<string, PathItem | Reference>

type MediaType = {
  schema?: Schema
  encoding?: Record<string, {
    contentType?: string
    headers?: Record<string, Header | Reference>
    style?: string
    explode?: boolean
    allowReserved?: boolean
  }>
}

type ExternalDocumentation = {
  description?: string
  url: string
}

type RequestBody = {
  description?: string
  content: Record<string, MediaType>
  required?: boolean
}

type Responses = {
  [code in 'default' | number]?: Response | Reference
}

type SecurityRequirement = {
  [name: string]: string[]
}

type Operation = {
  tags?: string[]
  summary?: string
  description?: string
  externalDocs?: ExternalDocumentation
  operationId?: string
  parameters?: Array<Parameter | Reference>
  requestBody?: RequestBody | Reference
  responses?: Responses
  callbacks?: Record<string, Callback | Reference>
  deprecated?: boolean
  security?: SecurityRequirement[]
  servers?: Server[]
}


export interface OpenApi {
  openapi: '3.1.0'
  info: {
    title: string
    summary?: string
    description?: string
    termsOfService?: string
    contact?: {
      name?: string
      url?: string
      email?: string
    }
    license?: { name: string } & ({
      identifier?: string
    } | {
      url?: string
    })
    version: string
  }
  jsonSchemaDialect?: string
  servers?: Array<Server>
  paths: Record<`/${string}`, PathItem>
  webhooks?: Record<string, PathItem | Reference>
  components?: {
    schemas?: Record<string, Schema>
    responses?: Record<string, {
      description: string
      headers: Record<string, Header | Reference>
      content: Record<string, MediaType>
      links: Record<string, Link | Reference>
    } | Reference>
    parameters?: Record<string, Parameter | Reference>
    examples?: Record<string, Example | Reference>
    requestBodies?: Record<string, RequestBody | Reference>
    headers?: Record<string, Header | Reference>
    securitySchemes?: Record<string, SecurityScheme | Reference>
    links?: Record<string, Link | Reference>
    callbacks?: Record<string, Callback | Reference>
    pathItems?: Record<string, PathItem | Reference>
  }
  security?: SecurityRequirement[]
  tags?: Array<{
    name: string
    description?: string
    externalDocs?: ExternalDocumentation
  }>
  externalDocs?: ExternalDocumentation
}

export type OpenApiOptions = Omit<OpenApi, 'openapi' | 'paths' | 'webhooks' | 'components' | 'security'>


function objectSchemaToParameters(schema?: z.ZodType): Array<[string, Record<string, unknown>, boolean]> | undefined {
  if (!schema) return undefined
  try {
    const objectSchema = schema as z.SomeZodObject
    return Object.keys(objectSchema.keyof().enum)
      .map(key => [ key, zodToJsonSchema(objectSchema.shape[key].isOptional() ? (objectSchema.shape[key] as z.ZodOptional<z.ZodAny>).unwrap() : objectSchema.shape[key], { target: 'openApi3' }), objectSchema.shape[key].isOptional() ])
  } catch {
    return undefined
  }
}

const replies: Record<Status, number> = {
  [Status.Continue]: 100,
  [Status.SwitchingProtocols]: 101,
  [Status.Processing]: 102,
  [Status.Ok]: 200,
  [Status.Created]: 201,
  [Status.Accepted]: 202,
  [Status.NonAuthoritativeInformation]: 203,
  [Status.NoContent]: 204,
  [Status.ResetContent]: 205,
  [Status.PartialContent]: 206,
  [Status.MultiStatus]: 207,
  [Status.MultipleChoices]: 300,
  [Status.MovedPermanently]: 301,
  [Status.MovedTemporarily]: 302,
  [Status.SeeOther]: 303,
  [Status.NotModified]: 304,
  [Status.UseProxy]: 305,
  [Status.TemporaryRedirect]: 307,
  [Status.PermanentRedirect]: 308,
  [Status.BadRequest]: 400,
  [Status.Unauthorized]: 401,
  [Status.PaymentRequired]: 402,
  [Status.Forbidden]: 403,
  [Status.NotFound]: 404,
  [Status.MethodNotAllowed]: 405,
  [Status.NotAcceptable]: 406,
  [Status.ProxyAuthenticationRequired]: 407,
  [Status.RequestTimeout]: 408,
  [Status.Conflict]: 409,
  [Status.Gone]: 410,
  [Status.LengthRequired]: 411,
  [Status.PreconditionFailed]: 412,
  [Status.RequestTooLong]: 413,
  [Status.RequestUriTooLong]: 414,
  [Status.UnsupportedMediaType]: 415,
  [Status.RequestedRangeNotSatisfiable]: 416,
  [Status.ExpectationFailed]: 417,
  [Status.ImATeapot]: 418,
  [Status.InsufficientSpaceOnResource]: 419,
  [Status.MethodFailure]: 420,
  [Status.MisdirectedRequest]: 421,
  [Status.UnprocessableEntity]: 422,
  [Status.FailedDependency]: 424,
  [Status.PreconditionRequired]: 428,
  [Status.TooManyRequests]: 429,
  [Status.RequestHeaderFieldsTooLarge]: 431,
  [Status.UnavailableForLegalReasons]: 451,
  [Status.InternalServerError]: 500,
  [Status.NotImplemented]: 501,
  [Status.BadGateway]: 502,
  [Status.ServiceUnavailable]: 503,
  [Status.GatewayTimeout]: 504,
  [Status.HttpVersionNotSupported]: 505,
  [Status.InsufficientStorage]: 507,
  [Status.NetworkAuthenticationRequired]: 511
}

export function routeToOpenApiOperation(route: Route): Operation {
  const path = objectSchemaToParameters(route.schemas.params)
  const query = objectSchemaToParameters(route.schemas.query)

  const pathParams = path ? path
    .map(el => ({ in: 'path' as const, name: el[0], required: true, schema: el[1] })) satisfies Array<{ required: true }> : []
  const queryParams = query ? query
    .map(el => ({ in: 'query' as const, name: el[0], required: !el[2], schema: el[1], compatibilityDate: route.compatibilityDate })) : []
  const parameters = [ ...pathParams, ...queryParams ].length > 0 ? [ ...pathParams, ...queryParams ] : undefined

  const body = route.schemas.body ? { content: zodToJsonSchema(route.schemas.body, { target: 'openApi3' }) } : undefined
  const responses = route.replies
    ? Object.fromEntries(Object.entries(route.replies).map(reply =>
      [ replies[reply[0] as Status], zodToJsonSchema(reply[1], { target: 'openApi3' }) ]))
    : undefined

  return {
    parameters,
    requestBody: body,
    responses
  } as Operation
}
