import { Event } from './event'
import { Reply } from './reply'
import { CorsOptions } from './cors'
import { CookiesOptions } from './cookies'
import { LoggerMethods, LogLevel } from './logger'
import type { Schema } from '@danifoldi/spartan-schema'
import { EMPTY_SCHEMA } from './utils'


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
export type EmptySchema = typeof EMPTY_SCHEMA

export type EventHandler<TEnv = Env, TSchema extends Schema = EmptySchema> =
  (event: Event<TEnv, TSchema>) => Promise<Event | Reply> | Event | Reply

export interface Configuration {
  cookies?: CookiesOptions
  cors?: CorsOptions
  logger?: LoggerMethods
  loglevel?: keyof typeof LogLevel
  prefix?: string
  server: string
}
