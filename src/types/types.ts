export enum Method {
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
}

export interface Event extends BaseEvent {
  next: <NextEventType extends Event>() => NextEventType;
  reply: {
    ok: (body?: IBody, headers?: IHeaders) => CompletedEvent;
    badRequest: (body?: IBody, headers?: IHeaders) => CompletedEvent;
    unauthorized: (body?: IBody, headers?: IHeaders) => CompletedEvent;
  };
}

export interface CompletedEvent extends BaseEvent {
  isComplete: true;
}
