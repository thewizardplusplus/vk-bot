import util from 'util'
import logger from './logger'

export default function makeAttachmentsHandler() {
  return (vk_bot, response) => {
    logger.info(`response has been received: ${util.inspect(response)}`)

    return {
      message: response,
      attachments: [
        'photo-143852874_456239017',
        'photo-143852874_456239018',
        'photo-143852874_456239019',
      ],
    }
  }
}
