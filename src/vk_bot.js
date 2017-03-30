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

export function makeEchoMessageHandler(message_handler) {
  return (vk_bot, message) => {
    logger.info(`message has been received: ${util.inspect(message)}`)

    message_handler(vk_bot, message)
      .then(response => vk_bot.send(response.message, message.peer_id, {
        attachment: typeof response.attachments !== 'undefined'
          ? response.attachments.join(',')
          : undefined,
      }))
      .catch(error => {
        logger.info(`error has occurred: ${util.inspect(error)}`)
      })
  }
}
