/* eslint-disable max-len */

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
  status: number;
  body: IBody;
  headers: IHeaders;
}

export interface BaseEvent {
  method: Method;
  path: string;
  data: IData;
  body: IBody;
  headers: IHeaders;
  query: IQuery;
  params: IParams;
  // isComplete: boolean;
}

export interface HandlerEvent extends BaseEvent {
  reply: {
    ok: (body?: IBody, headers?: IHeaders) => CompletedEvent;
    badRequest: (body?: IBody, headers?: IHeaders) => CompletedEvent;
    unauthorized: (body?: IBody, headers?: IHeaders) => CompletedEvent;
  };
}

export interface MiddlewareEvent extends HandlerEvent {
  next: () => this;
}

export interface CompletedEvent extends BaseEvent {
  isComplete: true;
}

export type PreMiddleware = (event: MiddlewareEvent) => Promise<MiddlewareEvent | CompletedEvent> | MiddlewareEvent | CompletedEvent;

export type PostMiddleware = (event: CompletedEvent) => unknown;

export type Handler = (event: HandlerEvent) => CompletedEvent;
