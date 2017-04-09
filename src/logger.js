import winston from 'winston'

export const logger = new winston.Logger({
  transports: [
    new winston.transports.Console({
      level: 'debug',
      handleExceptions: true,
      humanReadableUnhandledException: true,
      timestamp: true,
      colorize: true,
    }),
  ],
  exitOnError: false,
})
