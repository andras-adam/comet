export enum LogLevel {
  All = -1,
  Debug = 0,
  Log = 1,
  Info = 1,
  Warn = 2,
  Error = 3,
  None = 99
}

enum Severity {
  Debug = 'debug',
  Log = 'log',
  Info = 'info',
  Warn = 'warn',
  Error = 'error'
}

function severityToLogLevel(severity: Severity): LogLevel {
  switch (severity) {
    case Severity.Debug: return LogLevel.Debug
    case Severity.Log: return LogLevel.Log
    case Severity.Info: return LogLevel.Info
    case Severity.Warn: return LogLevel.Warn
    case Severity.Error: return LogLevel.Error
  }
}

type LoggerType = Record<Severity, (...args: unknown[]) => unknown>

export interface LoggerOptions {
  logger?: LoggerType
  logLevel?: LogLevel
}

export class Logger {

  private readonly logger: LoggerType
  private readonly logLevel: LogLevel

  constructor(options?: LoggerOptions) {
    this.logger = options?.logger ?? console
    this.logLevel = options?.logLevel ?? LogLevel.All
  }

  private _log(severity: Severity, args: unknown[]) {
    if (severityToLogLevel(severity) >= this.logLevel) this.logger[severity](...args)
  }

  public debug = (...args: unknown[]) => this._log(Severity.Debug, args)
  public log = (...args: unknown[]) => this._log(Severity.Log, args)
  public info = (...args: unknown[]) => this._log(Severity.Info, args)
  public warn = (...args: unknown[]) => this._log(Severity.Warn, args)
  public error = (...args: unknown[]) => this._log(Severity.Error, args)

}
