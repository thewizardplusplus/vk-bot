import {logger, inspect} from './logger'
import {makeAttachmentId} from './attachments'

export function makeAttachmentLoader() {
  return (vk_bot, path, peer_id, log_prefix = '') => {
    return vk_bot
      .uploadPhoto(path, peer_id)
      .then(([{owner_id, id}]) => {
        logger.info(`${log_prefix}attachment ${inspect(path)} has been loaded`)
        return makeAttachmentId(owner_id, id)
      })
  }
}

export default function makeCachedAttachmentLoader(cache) {
  return (vk_bot, path, peer_id, log_prefix = '') => {
    const attachment = cache.get(
      path,
      process.env.VK_BOT_INEXACT_CACHE === 'TRUE',
    )
    if (attachment !== null) {
      logger.info(
        `${log_prefix}attachment ${inspect(path)} has been found in the cache`,
      )

      return attachment.attachment
    }

    return vk_bot
      .uploadPhoto(path, peer_id)
      .then(([{owner_id, id}]) => {
        logger.info(`${log_prefix}attachment ${inspect(path)} has been loaded`)

        const attachment_id = makeAttachmentId(owner_id, id)
        return cache.addAndSave(attachment_id, path, log_prefix)
      })
      .then(({attachment}) => {
        logger.info(
          `${log_prefix}attachment ${inspect(path)} `
            + `has been added to the cache`,
        )

        return attachment
      })
  }
}
