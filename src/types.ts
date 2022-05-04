import { ReplyManager } from './reply'


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

export type ValidMethod = Method | keyof typeof Method | Lowercase<keyof typeof Method>

export type IQuery = Record<string, string>
export type IParams = Record<string, string>
export type IBody = any

export interface Reply {
  body?: IBody
  headers: Headers
  status: number
}

export interface BaseEvent<TBody = IBody> {
  body: TBody
  ctx: ExecutionContext
  env: Environment
  headers: Headers
  method: Method
  params: IParams
  pathname: string
  query: IQuery
  request: Request
  state?: DurableObjectState
}

export interface HandlerEvent<TBody = IBody> extends BaseEvent<TBody> {
  reply: ReplyManager
}

export interface PreMiddlewareEvent<TBody = IBody> extends BaseEvent<TBody> {
  next: () => BaseEvent<TBody>
  reply: ReplyManager
}

export interface PostMiddlewareEvent<TBody = IBody> extends BaseEvent<TBody> {
  next: () => BaseEvent<TBody>
  replyData: Reply | null
}

export type Handler<TBody = IBody> = (event: HandlerEvent<TBody>) =>
  Promise<BaseEvent<TBody>> | BaseEvent<TBody>

export type PreMiddleware<TBody = IBody> = (event: PreMiddlewareEvent<TBody>) =>
  Promise<BaseEvent<TBody>> | BaseEvent<TBody>

export type PostMiddleware<TBody = IBody> = (event: PostMiddlewareEvent<TBody>) =>
  Promise<BaseEvent<TBody>> | BaseEvent<TBody>

export interface UseCometOptions<TBody = IBody> {
  after?: PostMiddleware<TBody>[]
  before?: PreMiddleware<TBody>[]
  method: ValidMethod
  pathname: string
}
