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

export type ValidMethod = Method | keyof typeof Method | Lowercase<keyof typeof Method>

export type IHeaders = Record<any, any>
export type IQuery = Record<any, any>
export type IParams = Record<any, any>

export interface Reply {
  status: number
  headers?: IHeaders
}

export interface Event {
  method: Method
  pathname: string
  headers: IHeaders
  query: IQuery
  params: IParams
}

export interface HandlerEvent extends Event {
  reply: ReplyManager<Event>
}

export interface PreMiddlewareEvent extends Event {
  next: () => this
  reply: ReplyManager<Event>
}

export interface PostMiddlewareEvent extends Event {
  next: () => this
  replyData: Reply | null
}

export type Handler = (event: HandlerEvent) => Promise<Event> | Event

export type PreMiddleware = (event: PreMiddlewareEvent) => Promise<Event> | Event

export type PostMiddleware = (event: PostMiddlewareEvent) => Promise<Event> | Event
