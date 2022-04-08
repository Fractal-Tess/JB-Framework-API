import { log } from '@deps'

const fileFormatter = (log: log.LogRecord) => {
  let msg =
    `[${log.datetime.toDateString()}]:` + `[${log.levelName}]` + ` - ${log.msg}`

  if (log.args.length != 0) {
    console.log('log.args:' + log.args)
    msg += ' [Additional args] => '
    log.args.forEach((arg, index) => {
      msg += ` arg${index}: ${arg},`
    })
    msg = msg.slice(0, -1)
  }
  return msg.trim()
}
const consoleFormatter = (log: log.LogRecord) => {
  let msg = `${log.levelName} ${log.msg}`

  if (log.args.length != 0) {
    console.log('log.args:' + log.args)
    msg += ' [Additional args] => '
    log.args.forEach((arg, index) => {
      msg += ` arg${index}: ${arg},`
    })
    msg = msg.slice(0, -1)
  }
  if (log.level >= 30) {
    msg = '\n' + msg + '\n'
  }
  return msg.trim()
}

// Flush flushable handlers

export const InitLoggers = async (
  logMode: 'overwrite' | 'append' = 'append',
  flushInterval = 1,
  maxBackupCount = 10
) => {
  const mode = logMode === 'overwrite' ? 'w' : 'a'

  const handlers = {
    logFileHandler: new log.handlers.RotatingFileHandler('INFO', {
      formatter: fileFormatter,
      mode,
      maxBackupCount,
      maxBytes: 1_048_576, // 10mb
      filename: 'logs/generic/generic.log'
    }),

    logHttpHandler: new log.handlers.RotatingFileHandler('INFO', {
      formatter: fileFormatter,
      mode,
      maxBackupCount,
      maxBytes: 1_048_576, // 10mb
      filename: 'logs/http/http.log'
    }),

    logPerformanceHandler: new log.handlers.RotatingFileHandler('INFO', {
      formatter: fileFormatter,
      mode,
      maxBackupCount,
      maxBytes: 1_048_576, // 10mb
      filename: 'logs/performance/performance.log'
    }),

    logConsoleHandler: new log.handlers.ConsoleHandler('DEBUG', {
      formatter: consoleFormatter
    })
  }
  // Flushing interval
  setInterval(() => {
    handlers.logFileHandler.flush()
    handlers.logPerformanceHandler.flush()
    handlers.logHttpHandler.flush()
  }, flushInterval * 1000)

  await log.setup({
    handlers,
    loggers: {
      default: {
        level: 'DEBUG',
        handlers: ['logFileHandler', 'logConsoleHandler']
      },
      performanceLogger: {
        level: 'INFO',
        handlers: ['logPerformanceHandler']
      },
      httpLogger: {
        level: 'INFO',
        handlers: ['logHttpHandler']
      }
    }
  })
}
