/**
 * Logger Utility
 * Centralized logging with levels
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface Logger {
  debug: (message: string, data?: any) => void
  info: (message: string, data?: any) => void
  warn: (message: string, data?: any) => void
  error: (message: string, error?: any) => void
}

const createLogger = (module: string, minLevel: LogLevel = 'info'): Logger => {
  const levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  }

  const shouldLog = (level: LogLevel) => levels[level] >= levels[minLevel]

  return {
    debug: (message: string, data?: any) => {
      if (shouldLog('debug')) {
        console.log(`[${module}:DEBUG]`, message, data || '')
      }
    },
    info: (message: string, data?: any) => {
      if (shouldLog('info')) {
        console.log(`[${module}:INFO]`, message, data || '')
      }
    },
    warn: (message: string, data?: any) => {
      if (shouldLog('warn')) {
        console.warn(`[${module}:WARN]`, message, data || '')
      }
    },
    error: (message: string, error?: any) => {
      if (shouldLog('error')) {
        console.error(`[${module}:ERROR]`, message, error || '')
      }
    },
  }
}

export { createLogger }
export type { Logger }
