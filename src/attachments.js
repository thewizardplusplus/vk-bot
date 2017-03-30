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

export default function makeAttachmentsHandler(attachment_loader) {
  return (vk_bot, response) => {
    logger.info(`response has been received: ${util.inspect(response)}`)

    const {cleaned_response, attachments} = extractAttachments(response)
    return Promise
      .all(attachments.map(attachment => attachment_loader(vk_bot, attachment)))
      .then(attachments => {
        logger.info(
          `attachments have been loaded: ${util.inspect(attachments)}`,
        )

        return {
          message: cleaned_response,
          attachments: attachments.map(attachment => {
            return `photo${attachment.owner_id}_${attachment.id}`
          }),
        }
      })
  }
}
