import os from 'os'
import path from 'path'
import mkdirp from 'mkdirp'
import util from 'util'
import logger from './logger'

class Test {
  // f = 23
}

function readCacheFilename() {
  return process.env.VK_BOT_CACHE
    || path.join(os.homedir(), '.vk-bot', 'attachments.json')
}

function createCacheDirectory(path) {
  return new Promise((resolve, reject) => mkdirp(path, (error, made) => {
      error === null ? resolve(made) : reject(error)
    }))
    .then(made => {
      if (made !== null) {
        logger.info(`cache directory ${util.inspect(path)} has been created`)
      }
    })
    .catch(error => {
      logger.error(
        `unable to create cache directory ${util.inspect(path)}: `
          + util.inspect(error),
      )

      process.exit(1)
    })
}

export function initCache() {
  const cache_filename = readCacheFilename()
  return createCacheDirectory(path.dirname(cache_filename))
}

export function makeCachedAttachmentLoader() {
  return (vk_bot, path) => {
    return vk_bot.uploadPhoto(path)
  }
}
