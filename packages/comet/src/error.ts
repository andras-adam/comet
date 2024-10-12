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
}) => MaybePromise<Reply | undefined>

export class CometErrorHandler {
  private static readonly tracer = trace.getTracer(name, version)

  static async handle(input: Omit<Parameters<ErrorHandler<any>>[0], 'error'>, error: unknown, options: ServerOptions<any, any, any>) {
    return CometErrorHandler.tracer.startActiveSpan('comet error handler', async span => {
      try {
        const wrappedError = error instanceof Error ? error : CometError.wrap(error)

        if (options.errorHandler) {
          span.setAttribute('handler', 'custom')

          const reply = await options.errorHandler({ ...input, error: wrappedError })

          /*
           * If the handler decides to return a reply, we forward it,
           * otherwise the error gets passed to the internal handler.
           */
          if (reply) return await Reply.toResponse(reply, options)
        }

        span.setAttribute('handler', 'internal')
        /*
         * If we get to this point, it means that:
         * - A) There is no custom error handler to take care of this error
         * - B) The custom error handler consumed the error but did not
         *      return a reply. The latter is a valid case when the handler
         *      might only be interested in specific types of errors or just
         *      logs the error but wants to leave it up to the internal handler
         *      to return a reply to the caller.
         */
        // return new CometErrorHandler({ ...input, error: cometError }).handleError()
        return CometErrorHandler.internalHandle({ ...input, error: wrappedError })
      } catch (error) {
        recordException('[Comet] Failed to handle error.')
        recordException(error)
        span.setAttribute('handler', 'backup')

        return new Response('An internal error has occurred.', { status: 500 })
      }
    })
  }

  private static async internalHandle(input: Parameters<ErrorHandler<any>>[0]): Promise<Response> {
    // record exception
    input.logger.error(input.error)

    // handle CometError
    if (input.error instanceof CometError) {
      switch (input.error.type) {
        case ErrorType.MethodNotAllowed:
          return new Response(null, { status: 405 })
        case ErrorType.NotFound:
          return new Response(null, { status: 404 })
        case ErrorType.SchemaValidation:
          return new Response(null, { status: 400 })
        // case ErrorType.Internal:
        // case ErrorType.Unknown:
        default:
          return new Response(null, { status: 500 })
      }
    }

    return new Response(null, { status: 500 })
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

  static wrap(error: unknown): CometError {
    return new CometError(ErrorType.Internal, error)
  }
}
