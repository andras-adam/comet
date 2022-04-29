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

export type ValidMethod = Method | keyof typeof Method | Lowercase<keyof typeof Method>;

export type IData = Record<any, any>;
export type IBody = Record<any, any>;
export type IHeaders = Record<any, any>;
export type IQuery = Record<any, any>;
export type IParams = Record<any, any>;

export interface Reply {
  status: number
  body?: IBody
  headers?: IHeaders
}

export interface BaseEvent {
  method: Method
  pathname: string
  // data: IData
  // body: IBody
  headers: IHeaders
  query: IQuery
  params: IParams
}

export interface HandlerEvent extends BaseEvent {
  reply: ReplyManager
}

export interface MiddlewareEvent extends HandlerEvent {
  next: () => this
}

export interface CompletedEvent extends BaseEvent {
  hasReplied: boolean
}

export type PreMiddleware = (event: MiddlewareEvent) => (
  Promise<MiddlewareEvent | CompletedEvent> | MiddlewareEvent | CompletedEvent
)

export type PostMiddleware = (event: CompletedEvent) => Promise<unknown> | unknown;

export type Handler = (event: HandlerEvent) => Promise<CompletedEvent> | CompletedEvent;
