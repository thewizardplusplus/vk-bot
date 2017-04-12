import {Bot} from 'node-vk-bot'
import VkApi from 'node-vkapi'
import {logger, inspect} from './logger'
import colors from 'colors/safe'

export function initVkBot(update_handler) {
  const vk_bot = new Bot({
    token: process.env.VK_BOT_TOKEN,
    api: {
      v: 5.63,
      lang: 'ru',
    },
  })
  const vk_api_client = new VkApi({
    token: vk_bot.options.token,
    version: vk_bot.options.api.v.toString(),
  })
  vk_bot.api = (method, parameters) => vk_api_client.call(method, {
    lang: vk_bot.options.api.lang,
    ...parameters,
  })
  vk_bot.on('update', update => {
    update_handler(vk_bot, update)
  })
  vk_bot.start()

  logger.info('VK bot has been initialized')
}

function makeLogPrefix(message) {
  const message_id = `#${message.peer_id}.${message.id}`
  return `${colors.blue(message_id)} - `
}

const OUTBOX_MESSAGE_FLAG = 2
export function makeInboxUpdateHandler(message_handler) {
  return (vk_bot, update) => {
    logger.info(`update has been received: ${inspect(update)}`)

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

function logError(error) {
  logger.error(`error has occurred: ${inspect(error)}`)
}

function sendResponse(vk_bot, peer_id, response) {
  return vk_bot
    .send(response.message, peer_id, {
      attachment: typeof response.attachments !== 'undefined'
        ? response.attachments.join(',')
        : undefined,
    })
    .then(() => logger.info(`response has been sent: ${inspect(response)}`))
}

function sendFilteredResponse(vk_bot, message, message_filter, response) {
  if (typeof message_filter !== 'undefined' && !message_filter(message)) {
    logger.warn(`response has been filtered: ${inspect(response)}`)
    return Promise.resolve()
  }

  return sendResponse(vk_bot, message.peer_id, response)
}

export function makeErrorHandler(message_handler, message_filter) {
  return (vk_bot, message) => {
    return message_handler(vk_bot, message)
      .catch(error => {
        logError(error)

        return sendFilteredResponse(vk_bot, message, message_filter, {
          message: process.env.VK_BOT_ERROR
            || "I'm sorry, but error has occurred "
              + 'on a processing of your message. '
              + 'Please, try again.',
        })
          .catch(logError)
      })
  }
}

export function makeJoinRequester(message_handler, message_filter) {
  return (vk_bot, message) => {
    return vk_bot
      .api('groups.isMember', {
        group_id: process.env.VK_BOT_GROUP,
        user_id: message.peer_id,
        extended: 1,
      })
      .then(({member}) => {
        logger.info(
          `user ${inspect(message.peer_id)} ${member ? 'is' : "isn't"} joined`,
        )
        if (member) {
          return message_handler(vk_bot, message)
        }

        logger.info(`message has been received: ${inspect(message)}`)
        return sendFilteredResponse(vk_bot, message, message_filter, {
          message: process.env.VK_BOT_JOIN_REQUEST
            || 'Hello! To talk to me, please, join my group.',
        })
      })
  }
}

function readPreliminaryResponse() {
  // empty value is significant
  return typeof process.env.VK_BOT_PRELIMINARILY !== 'undefined'
    ? process.env.VK_BOT_PRELIMINARILY
    : 'Hello! Your message is being processed. Please, wait.'
}

export function makeEchoMessageHandler(message_handler, message_filter) {
  return (vk_bot, message) => {
    logger.info(`message has been received: ${inspect(message)}`)

    const preliminary_response = readPreliminaryResponse()
    const response_promise = preliminary_response !== ''
      ? sendFilteredResponse(vk_bot, message, message_filter, {
        message: preliminary_response,
      })
      : Promise.resolve()
    return response_promise
      .then(() => message_handler(vk_bot, message))
      .then(response => sendFilteredResponse(
        vk_bot,
        message,
        message_filter,
        response,
      ))
  }
}
