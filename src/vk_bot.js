import {Bot} from 'node-vk-bot'
import logger from './logger'
import util from 'util'

export function initVkBot(update_handler) {
  const vk_bot = new Bot({
    token: process.env.VK_BOT_TOKEN,
    api: {
      v: 5.63,
      lang: 'ru',
    },
  })
  vk_bot.on('update', update => {
    update_handler(vk_bot, update)
  })
  vk_bot.start()

  logger.info('VK bot has been initialized')
}

const OUTBOX_MESSAGE_FLAG = 2
export function makeInboxUpdateHandler(message_handler) {
  return (vk_bot, update) => {
    logger.info(`update has been received: ${util.inspect(update)}`)

    const update_flags = update[2]
    if (update_flags & OUTBOX_MESSAGE_FLAG) {
      return
    }

    message_handler(vk_bot, {
      id: update[1],
      peer_id: update[3],
      timestamp: new Date(update[4] * 1000),
      subject: update[5],
      text: update[6],
    })
  }
}

function readPreliminaryResponse() {
  // empty value is significant
  return typeof process.env.VK_BOT_PRELIMINARILY !== 'undefined'
    ? process.env.VK_BOT_PRELIMINARILY
    : 'Hello! Your message is being processed. Please, wait.'
}

function sendResponse(vk_bot, peer_id, response) {
  return vk_bot
    .send(response.message, peer_id, {
      attachment: typeof response.attachments !== 'undefined'
        ? response.attachments.join(',')
        : undefined,
    })
    .then(() => {
      logger.info(`response has been sent: ${util.inspect(response)}`)
    })
}

function logError(error) {
  logger.error(`error has occurred: ${util.inspect(error)}`)
}

export function makeEchoMessageHandler(message_handler) {
  return (vk_bot, message) => {
    logger.info(`message has been received: ${util.inspect(message)}`)

    const preliminary_response = readPreliminaryResponse()
    const response_promise = preliminary_response !== ''
      ? sendResponse(vk_bot, message.peer_id, {
        message: preliminary_response,
      })
      : Promise.resolve()
    response_promise
      .then(() => message_handler(vk_bot, message))
      .then(response => sendResponse(vk_bot, message.peer_id, response))
      .catch(error => {
        logError(error)

        sendResponse(vk_bot, message.peer_id, {
          message: process.env.VK_BOT_ERROR
            || "I'm sorry, but error has occurred "
              + 'on a processing of your message. '
              + 'Please, try again.',
        })
          .catch(logError)
      })
  }
}

export function makeJoinRequester(message_handler) {
  return (vk_bot, message) => {
    return vk_bot
      .api('groups.isMember', {
        group_id: process.env.VK_BOT_GROUP,
        user_id: message.peer_id,
        extended: 1,
      })
      .then(({member}) => {
        logger.info(`user ${message.peer_id} ${member ? 'is' : "isn't"} joined`)
        if (member) {
          return message_handler(vk_bot, message)
        }

        logger.info(`message has been received: ${util.inspect(message)}`)
        return sendResponse(vk_bot, message.peer_id, {
          message: process.env.VK_BOT_JOIN_REQUEST
            || 'Hello! To talk to me, please, join my group.',
        })
      })
  }
}
