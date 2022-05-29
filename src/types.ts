import { Event } from './event'
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

export type EventHandler<TEnv = Env, TBody = Body> =
  (event: Event<TEnv, TBody>) => Promise<Event | Reply> | Event | Reply

export interface CorsOptions {
  credentials: boolean
  exposedHeaders: string[] | string
  headers: string[] | string
  maxAge: number
  methods: string[] | string
  origins: string[] | string
}

export interface CookiesOptions {
  decode: ((arg: string) => Promise<string> | string) | null
  encode: ((arg: string) => Promise<string> | string) | null
  limit: number
}

export interface ServerConfiguration {
  cookies: CookiesOptions
  cors: CorsOptions
  name: string
}

export interface UseCometOptions<TEnv = Env, TBody = Body> {
  after?: EventHandler<TEnv, TBody>[]
  before?: EventHandler<TEnv, TBody>[]
  cookies?: Partial<CookiesOptions>
  cors?: Partial<CorsOptions>
  method?: Method | keyof typeof Method | Lowercase<keyof typeof Method>
  pathname: string
  server?: string
}

export interface CometOptions {
  cookies?: Partial<CookiesOptions>
  cors?: Partial<CorsOptions>
  name?: string
}
