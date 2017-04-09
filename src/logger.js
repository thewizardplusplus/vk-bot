import winston from 'winston'
import util from 'util'

export const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      timestamp: true,
    }),
  ],
  exitOnError: false,
})

export function inspect(object) {
  return util.inspect(object, {
    breakLength: Infinity,
  })
}
