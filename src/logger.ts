/* eslint-disable @typescript-eslint/no-explicit-any */

let _logger: LoggerMethods
const log: LogMessage[] = []
let _logLevel: keyof typeof LogLevel = 'debug'

interface LogMessage {
  message: any[]
  severity: Severity
}

function logLine(severity: Severity, message: any[]) {
  if (_logger) {
    _logger[severity](...message)
  } else {
    log.push({ message, severity })
  }
}

export const LogLevel = {
  all: -1,
  debug: 0,
  error: 3,
  info: 1,
  log: 1,
  none: 99,
  warn: 2
}

export type Severity = Exclude<keyof typeof LogLevel, 'all' | 'none'>

export type LoggerMethods = {
  [fun in Severity]: (...message: any[]) => void
}

export function setLogger(logger?: LoggerMethods, logLevel: keyof typeof LogLevel = 'debug') {
  if (!logger) {
    console.error('[Comet] Tried to set cometLogger to undefined')
    return
  }
  _logLevel = logLevel
  _logger = logger

  let line
  while (line = log.shift(), line !== undefined) {
    if (LogLevel[line.severity] >= LogLevel[_logLevel]) {
      _logger[line.severity](...line.message)
    }
  }
}

export const cometLogger: LoggerMethods = {
  debug: (...message: any[]) => logLine('debug', message),
  error: (...message: any[]) => logLine('error', message),
  info: (...message: any[]) => logLine('info',  message),
  log: (...message: any[]) => logLine('log',   message),
  warn: (...message: any[]) => logLine('warn',  message)
}
