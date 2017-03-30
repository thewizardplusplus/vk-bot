import util from 'util'
import logger from './logger'

const ATTACHMENT_PATTERN = /\${file:\/\/([^{}]+)}/g
function extractAttachments(response) {
  const attachments = []
  const cleaned_response = ATTACHMENT_PATTERN[Symbol.replace](
    response,
    (attachment, path) => {
      attachments.push(path)
      return ''
    },
  )

  return {
    cleaned_response,
    attachments,
  }
}

export default function makeAttachmentsHandler() {
  return (vk_bot, response) => {
    logger.info(`response has been received: ${util.inspect(response)}`)

    const {cleaned_response, attachments} = extractAttachments(response)
    logger.debug(`extracted attachments: ${util.inspect(attachments)}`)

    return {
      message: cleaned_response,
      attachments: [
        'photo-143852874_456239017',
        'photo-143852874_456239018',
        'photo-143852874_456239019',
      ],
    }
  }
}
