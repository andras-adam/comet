import { trace } from '@opentelemetry/api'
import { SeverityNumber, logs } from '@opentelemetry/api-logs'
import { name, version } from '../package.json'


const otelLogger = logs.getLogger(name, version)
type Severity = 'trace' | 'debug' | 'info' | 'log' | 'warn' | 'error'
type Log = (...args: unknown[]) => void

export type Logger = Record<Severity, Log>

function convert(...data: unknown[]): string {
  return data.map(entry => {
    if (typeof entry === 'string') return entry
    if (entry === undefined) return 'undefined'
    return JSON.stringify(entry, null, 2)
  }).join(', ')
}

export const logger: Logger = {
  trace: (...body: unknown[]) => otelLogger.emit({ severityNumber: SeverityNumber.TRACE, body: convert(body) }),
  debug: (...body: unknown[]) => otelLogger.emit({ severityNumber: SeverityNumber.DEBUG, body: convert(body) }),
  info: (...body: unknown[]) => otelLogger.emit({ severityNumber: SeverityNumber.INFO, body: convert(body) }),
  log: (...body: unknown[]) => otelLogger.emit({ severityNumber: SeverityNumber.INFO, body: convert(body) }),
  warn: (...body: unknown[]) => otelLogger.emit({ severityNumber: SeverityNumber.WARN, body: convert(body) }),
  error: (...body: unknown[]) => otelLogger.emit({ severityNumber: SeverityNumber.ERROR, body: convert(body) })
}

export function recordException(exception: unknown) {
  console.error('[Comet] Recorded exception', exception)

  if (exception instanceof Error || typeof exception === 'string') {
    trace.getActiveSpan()?.recordException(exception)
  } else if (typeof exception === 'object' && exception !== null && 'toString' in exception) {
    trace.getActiveSpan()?.recordException(exception.toString())
  }
}
