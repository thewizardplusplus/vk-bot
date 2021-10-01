import { readEnvFilename, createDirectory } from './files'
import path from 'path'
import winston from 'winston'
import { logger } from './logger'

export function initFileLogger() {
  const log_filename = readEnvFilename('VK_BOT_LOG', 'logs/app.log')
  return createDirectory(path.dirname(log_filename)).then(() =>
    logger.add(winston.transports.File, {
      level: 'info',
      handleExceptions: true,
      json: false,
      filename: log_filename,
      maxsize: 1024 * 1024, // 1 MiB
      maxFiles: 5,
    }),
  )
}

export function switchColorfulLogs() {
  Object.keys(logger.transports).forEach(name => {
    logger.transports[name].colorize =
      process.env.VK_BOT_COLORFUL_LOG === 'TRUE'
  })
}
