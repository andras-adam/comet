/* eslint-disable @typescript-eslint/no-explicit-any */

let _logger: LoggerMethods
const log: LogMessage[] = []

interface LogMessage {
  message: any[]
  severity: LogLevel
}

function logLine(severity: LogLevel, message: any[]) {
  console.log('ASD', severity, message)
  if (_logger) {
    _logger[severity](...message)
  } else {
    log.push({ message, severity })
  }
}

export type LogLevel = 'debug' | 'error' | 'info' | 'log' | 'warn'

export interface LoggerMethods {
  debug(...value: any[]): void
  error(...value: any[]): void
  info (...value: any[]): void
  log  (...value: any[]): void
  warn (...value: any[]): void
}

export function setLogger(logger?: LoggerMethods) {
  if (!logger) {
    console.error('Tried to set logger to undefined')
    return
  }
  _logger = logger

  let line
  while (line = log.shift(), line !== undefined) {
    _logger[line.severity](...line.message)
  }
}

export const cometLogger: LoggerMethods = {
  debug: (...message: any[]) => logLine('debug', message),
  error: (...message: any[]) => logLine('error', message),
  info: (...message: any[]) => logLine('info',  message),
  log: (...message: any[]) => logLine('log',   message),
  warn: (...message: any[]) => logLine('warn',  message)
}
