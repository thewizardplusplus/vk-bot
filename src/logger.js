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

const LINE_BREAK = /[\n\r]+/g
const WHITESPACES = /\s+/g
export function inspect(object) {
  let representation = util.inspect(object, {
    breakLength: Infinity,
    colors: process.env.VK_BOT_COLORFUL_LOG === 'TRUE',
  })
  // if the representation contains line breaks,
  // likely it's an error representation
  if (representation.search(LINE_BREAK) !== -1) {
    representation = representation.replace(WHITESPACES, ' ')
  }

  return representation
}
