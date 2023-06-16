import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { Route } from './router'

/* eslint-disable no-warning-comments */
/* eslint-disable @typescript-eslint/member-ordering */

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


function objectSchemaToParameters(schema?: z.SomeZodObject): Record<string, Record<string, unknown>> | undefined {
  if (!schema) return undefined
  return Object.fromEntries(Object.keys(schema.keyof().enum).map(key => [ key, zodToJsonSchema(schema.shape[key]) ]))
}

export function routeToOpenApiOperation(route?: Route): OpenApi['paths']['/']['get'] | undefined {
  if (!route) {
    return
  }

  const path = objectSchemaToParameters(route.schemas.params)
  const query = objectSchemaToParameters(route.schemas.query)

  const pathParams = path ? Object.entries(path).map(el => ({ in: 'path' as const, name: el[0], required: true, schema: el[1] })) : []
  const queryParams = query ? Object.entries(query).map(el => ({ in: 'query' as const, name: el[0], required: true, schema: el[1] })) : []
  const body = route.schemas.body ? zodToJsonSchema(route.schemas.body) : undefined
  const responses = route.replies
    ? Object.fromEntries(Object.entries(route.replies).map(reply =>
      [ Number.parseInt(reply[0]), zodToJsonSchema(reply[1]) ]))
    : undefined

  return {
    parameters: [ ...pathParams, ...queryParams ],
    requestBody: body,
    responses
  }
}
