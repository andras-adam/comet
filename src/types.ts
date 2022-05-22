import { Reply } from './reply'


export enum Method {
  ALL = 'ALL',
  GET = 'GET',
  HEAD = 'HEAD',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  CONNECT = 'CONNECT',
  OPTIONS = 'OPTIONS',
  TRACE = 'TRACE',
  PATCH = 'PATCH',
}

export const ALL = Method.ALL
export const GET = Method.GET
export const HEAD = Method.HEAD
export const POST = Method.POST
export const PUT = Method.PUT
export const DELETE = Method.DELETE
export const CONNECT = Method.CONNECT
export const OPTIONS = Method.OPTIONS
export const TRACE = Method.TRACE
export const PATCH = Method.PATCH

export type Query = Record<string, string>
export type Params = Record<string, string>
export type Body = any
export type Env = any

export interface BaseEvent<TEnv = Env, TBody = Body> {
  body: TBody
  ctx: ExecutionContext
  env: TEnv
  headers: Headers
  method: Method
  params: Params
  pathname: string
  query: Query
  request: Request
  state?: DurableObjectState
}

export interface HandlerEvent<TEnv = Env, TBody = Body> extends BaseEvent<TEnv, TBody> {
  reply: Reply
}

export interface PreMiddlewareEvent<TEnv = Env, TBody = Body> extends BaseEvent<TEnv, TBody> {
  next: () => BaseEvent
  reply: Reply
}

export interface PostMiddlewareEvent<TEnv = Env, TBody = Body> extends BaseEvent<TEnv, TBody> {
  next: () => BaseEvent
  reply: Reply
}

export type Handler<TEnv = Env, TBody = Body> =
  (event: HandlerEvent<TEnv, TBody>) => Promise<BaseEvent> | BaseEvent

export type PreMiddleware<TEnv = Env, TBody = Body> =
  (event: PreMiddlewareEvent<TEnv, TBody>) => Promise<BaseEvent> | BaseEvent

export type PostMiddleware<TEnv = Env, TBody = Body> =
  (event: PostMiddlewareEvent<TEnv, TBody>) => Promise<BaseEvent> | BaseEvent

export interface CorsOptions {
  credentials: boolean
  exposedHeaders: string[] | string
  headers: string[] | string
  maxAge: number
  methods: string[] | string
  origins: string[] | string
}

export interface ServerConfiguration {
  cors: CorsOptions
  name: string
}

export interface UseCometOptions<TEnv = Env, TBody = Body> {
  after?: PostMiddleware<TEnv, TBody>[]
  before?: PreMiddleware<TEnv, TBody>[]
  cors?: Partial<CorsOptions>
  method?: Method | keyof typeof Method | Lowercase<keyof typeof Method>
  pathname: string
  server?: string
}

export interface CometOptions {
  cors?: Partial<CorsOptions>
  name?: string
}
