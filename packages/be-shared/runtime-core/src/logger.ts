import { serviceLocator } from '@calcom-alt/service-locator'

/**
 * Standardized runtime logger interface.
 *
 * Defines structured logging levels and contextual logger support via `child()`.
 * Compatible with logger backends like tslog, winston, or pino.
 */
export interface Logger {
  /** Logs a TRACE-level message. Used for highly detailed debugging info. */
  trace(message: string, ...meta: unknown[]): void
  /** Logs a DEBUG-level message. Useful for debugging during development. */
  debug(message: string, ...meta: unknown[]): void
  /** Logs an INFO-level message. General runtime events or health checks. */
  info(message: string, ...meta: unknown[]): void
  /** Logs a WARN-level message. Non-critical issues that should be noted. */
  warn(message: string, ...meta: unknown[]): void
  /** Logs an ERROR-level message. Indicates failed operations or recoverable faults. */
  error(message: string, ...meta: unknown[]): void
  /** Logs a FATAL-level message. Critical errors that may lead to shut down. */
  fatal(message: string, ...meta: unknown[]): void

  /**
   * Returns a new logger instance with added context.
   * Context will be included in all subsequent log entries.
   */
  child(context: Record<string, unknown>): Logger
}

export let [getLogger, setLogger] = serviceLocator.for<Logger>()
