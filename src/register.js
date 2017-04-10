import {logger} from './logger'

export function makeRegisteringMessageHandler(message_handler) {
  return (vk_bot, message) => {
    logger.debug('start a message processing')

    return message_handler(vk_bot, message)
      .then(() => logger.debug('end a message processing'))
  }
}
