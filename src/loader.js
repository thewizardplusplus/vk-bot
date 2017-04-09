import {logger, inspect} from './logger'
import {makeAttachmentId} from './attachments'

export default function makeCachedAttachmentLoader(cache) {
  return (vk_bot, path) => {
    const attachment = cache.get(
      path,
      process.env.VK_BOT_INEXACT_CACHE === 'TRUE',
    )
    if (attachment !== null) {
      logger.info(`attachment ${inspect(path)} has been found in the cache`)
      return attachment.attachment
    }

    return vk_bot
      .uploadPhoto(path)
      .then(({owner_id, id}) => {
        logger.info(`attachment ${inspect(path)} has been loaded`)

        const attachment_id = makeAttachmentId(owner_id, id)
        return cache.addAndSave(attachment_id, path)
      })
      .then(({attachment}) => {
        logger.info(`attachment ${inspect(path)} has been added to the cache`)
        return attachment
      })
  }
}
