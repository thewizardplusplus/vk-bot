import {Bot} from 'node-vk-bot'
import logger from './logger'

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
