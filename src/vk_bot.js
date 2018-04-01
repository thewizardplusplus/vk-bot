import {Bot} from 'node-vk-bot'
import VkApi from 'node-vkapi'
import {logger, inspect} from './logger'
import colors from 'colors/safe'
import fs from 'fs'

const LONG_POLL_DELAY = 0
const DEFAULT_API_DELAY = 50
export function initVkBot(update_handler) {
  const vk_bot = new Bot({
    token: process.env.VK_BOT_TOKEN,
    api: {
      v: 5.63,
      lang: 'ru',
    },
  })
  const vk_api_client = new VkApi({
    accessToken: vk_bot.options.token,
    apiVersion: vk_bot.options.api.v.toString(),
    baseDelay: parseInt(process.env.VK_BOT_API_DELAY, 10) || DEFAULT_API_DELAY,
  })
  vk_bot.api = (method, parameters) => vk_api_client.call(method, {
    lang: vk_bot.options.api.lang,
    ...parameters,
  })
  vk_bot.uploadPhoto = (path, peer_id) =>
    vk_api_client.upload('photo_pm', fs.createReadStream(path), {
      lang: vk_bot.options.api.lang,
      peer_id,
    })
  vk_bot.on('update', update => {
    update_handler(vk_bot, update)
  })
  vk_bot.on('poll-error', error => {
    logError(error, 'Long Poll ')
  })
  vk_bot.start(LONG_POLL_DELAY)

  logger.info('VK bot has been initialized')
}

function makeLogPrefix(message) {
  let message_id = `#${message.peer_id}.${message.id}`
  if (process.env.VK_BOT_COLORFUL_LOG === 'TRUE') {
    message_id = colors.blue(message_id)
  }

  return `${message_id} - `
}

const OUTBOX_MESSAGE_FLAG = 2
export function makeInboxUpdateHandler(message_handler) {
  return (vk_bot, update) => {
    const message = {
      id: update[1],
      peer_id: update[3],
      timestamp: new Date(update[4] * 1000),
      subject: update[5],
      text: update[6],
    }
    const log_prefix = makeLogPrefix(message)
    logger.info(`${log_prefix}update has been received: ${inspect(update)}`)

    const update_flags = update[2]
    if (update_flags & OUTBOX_MESSAGE_FLAG) {
      return
    }

    message_handler(vk_bot, message, log_prefix)
  }
}

function logError(error, log_prefix = '') {
  logger.error(`${log_prefix}error has occurred: ${inspect(error)}`)
}

function sendResponse(vk_bot, peer_id, response, log_prefix = '') {
  return vk_bot
    .send(response.message, peer_id, {
      attachment: typeof response.attachments !== 'undefined'
        ? response.attachments.join(',')
        : undefined,
    })
    .then(() => logger.info(
      `${log_prefix}response has been sent: ${inspect(response)}`,
    ))
}

function sendFilteredResponse(
  vk_bot,
  message,
  message_filter,
  response,
  log_prefix = '',
) {
  if (typeof message_filter !== 'undefined' && !message_filter(message)) {
    logger.warn(`${log_prefix}response has been filtered: ${inspect(response)}`)
    return Promise.resolve()
  }

  return sendResponse(vk_bot, message.peer_id, response, log_prefix)
}

export function makeErrorHandler(message_handler, message_filter) {
  return (vk_bot, message, log_prefix = '') => {
    return message_handler(vk_bot, message, log_prefix)
      .catch(error => {
        logError(error, log_prefix)

        return sendFilteredResponse(vk_bot, message, message_filter, {
          message: process.env.VK_BOT_ERROR
            || "I'm sorry, but error has occurred "
              + 'on a processing of your message. '
              + 'Please, try again.',
        }, log_prefix)
          .catch(error => logError(error, log_prefix))
      })
  }
}

function checkMembership(vk_bot, peer_id, log_prefix = '') {
  return vk_bot
    .api('groups.isMember', {
      group_id: process.env.VK_BOT_GROUP,
      user_id: peer_id,
      extended: 1,
    })
    .then(({member}) => {
      logger.info(
        `${log_prefix}user ${inspect(peer_id)} `
          + `${member ? 'is' : "isn't"} joined`,
      )

      return member
    })
}

export function makeJoinRequester(message_handler, message_filter) {
  return (vk_bot, message, log_prefix = '') => {
    return checkMembership(vk_bot, message.peer_id, log_prefix)
      .then(is_member => {
        if (is_member) {
          return message_handler(vk_bot, message, log_prefix)
        }

        logger.info(
          `${log_prefix}message has been received: ${inspect(message)}`,
        )
        return sendFilteredResponse(vk_bot, message, message_filter, {
          message: process.env.VK_BOT_JOIN_REQUEST
            || 'Hello! To talk to me, please, join my group.',
        }, log_prefix)
      })
  }
}

function addJoinPleaResponse(response) {
  const join_plea_response = process.env.VK_BOT_JOIN_PLEA
    || "You aren't in my group, would you like to join it?"
  return [response, join_plea_response]
    .map(part => part.trim())
    .join('\n\n')
}

export function makeJoinPleader(response_handler, message_filter) {
  return (vk_bot, response, peer_id, log_prefix = '') => {
    return response_handler(vk_bot, response, peer_id, log_prefix)
      .then(response => {
        return checkMembership(vk_bot, peer_id, log_prefix)
          .then(is_member => ({
            ...response,
            message: !is_member
              ? addJoinPleaResponse(response.message)
              : response.message,
          }))
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
  return (vk_bot, message, log_prefix = '') => {
    logger.info(`${log_prefix}message has been received: ${inspect(message)}`)

    const preliminary_response = readPreliminaryResponse()
    const response_promise = preliminary_response !== ''
      ? sendFilteredResponse(vk_bot, message, message_filter, {
        message: preliminary_response,
      }, log_prefix)
      : Promise.resolve()
    return response_promise
      .then(() => message_handler(vk_bot, message, log_prefix))
      .then(response => sendFilteredResponse(
        vk_bot,
        message,
        message_filter,
        response,
        log_prefix,
      ))
  }
}
