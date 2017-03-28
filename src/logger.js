import winston from 'winston'

const logger = new winston.Logger({
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
export default logger
