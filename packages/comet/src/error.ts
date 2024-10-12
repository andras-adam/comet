import { trace } from '@opentelemetry/api'
import { name, version } from '../package.json'
import { Reply, type ReplyFrom, Status } from './reply'
import { type Logger, recordException } from './logger'
import type { ZodType } from 'zod'
import type { Data } from './data'
import type { MaybePromise } from './types'
import type { ExtensionsFrom, MiddlewareContext, MiddlewareList } from './middleware'
import type { ServerOptions } from './server'


export type ErrorHandler<
  Requires extends MiddlewareList,
  Replies extends Partial<Record<Status, ZodType>> | undefined = undefined
> = (input: {
  event: Data & { reply: ReplyFrom<Replies>; error: Error } & MiddlewareContext & Partial<ExtensionsFrom<Requires>>
  env: Environment
  logger: Logger
  error: Error
}) => MaybePromise<Reply>

export class CometErrorHandler {
  private static readonly tracer = trace.getTracer(name, version)
  static async handle(input: Omit<Parameters<ErrorHandler<any>>[0], 'error'>, error: unknown, options: ServerOptions<any, any, any>) {
    return CometErrorHandler.tracer.startActiveSpan('comet error handler', async span => {
      try {
        const cometError = error instanceof Error ? error : new CometError(ErrorType.Internal, error)

        if (options.errorHandler) {
          span.setAttribute('handler', 'custom')

          const reply = await options.errorHandler({ ...input, error: cometError })

          return await Reply.toResponse(reply, options)
        }

        span.setAttribute('handler', 'internal')


        return new CometErrorHandler({ ...input, error: cometError }).handleError()

      } catch (error) {
        recordException('[Comet] Failed to handle error.')
        recordException(error)
        span.setAttribute('handler', 'backup')

        return new Response('An internal error has occurred.', { status: 500 })
      }
    })
  }

  constructor(private readonly input: Parameters<ErrorHandler<any>>[0]) {}

  private async handleError(): Promise<Response> {
    // record exception
    this.input.logger.error(this.input.error)

    // handle CometError
    if (this.input.error instanceof CometError) {
      switch (this.input.error.type) {
        case ErrorType.MethodNotAllowed:
          return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), {
            status: 405,
            headers: { 'content-type': 'application/json' }
          })
        case ErrorType.NotFound:
          return new Response(JSON.stringify({ success: false, error: 'Not found' }), {
            status: 404,
            headers: { 'content-type': 'application/json' }
          })
        case ErrorType.SchemaValidation:
          return new Response(JSON.stringify({ success: false, errors: this.input.error.details }), {
            status: 400,
            headers: { 'content-type': 'application/json' }
          })
        // case ErrorType.Internal:
        // case ErrorType.Unknown:
        default:
          return new Response(JSON.stringify({ success: false, error: 'An internal error has occurred' }), {
            status: 500,
            headers: { 'content-type': 'application/json' }
          })
      }
    }

    return new Response('An internal error has occurred.', { status: 500 })
  }
}

export enum ErrorType {
  MethodNotAllowed,
  NotFound,
  SchemaValidation,
  InvalidCompatibilityDate,
  Internal,
  Unknown
}

export class CometError extends Error {

  constructor(public readonly type: ErrorType, public readonly details?: unknown) {
    super(type.toString())
  }
}
