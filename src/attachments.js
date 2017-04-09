import util from 'util'
import {logger} from './logger'
import path from 'path'

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

export function makeAttachmentId(owner_id, attachment_id) {
  return `photo${owner_id}_${attachment_id}`
}

export function makeAttachmentsHandler(attachment_loader) {
  return (vk_bot, response) => {
    logger.info(`response has been received: ${util.inspect(response)}`)

    const {cleaned_response, attachments} = extractAttachments(response)
    return Promise
      .all(attachments.map(attachment => attachment_loader(
        vk_bot,
        path.resolve(attachment),
      )))
      .then(attachments => {
        logger.info(
          `attachments have been loaded: ${util.inspect(attachments)}`,
        )

        return {
          message: cleaned_response,
          attachments,
        }
      })
  }
}
