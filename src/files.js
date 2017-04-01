import os from 'os'
import path from 'path'
import mkdirp from 'mkdirp'
import util from 'util'
import logger from './logger'

export function readEnvFilename(variable, default_relative_path) {
  return process.env[variable]
    || path.join(os.homedir(), '.vk-bot', ...default_relative_path.split('/'))
}

export function createDirectory(path) {
  return new Promise((resolve, reject) => mkdirp(path, (error, made) => {
      error === null ? resolve(made) : reject(error)
    }))
    .then(made => {
      if (made !== null) {
        logger.info(`directory ${util.inspect(path)} has been created`)
      }
    })
    .catch(error => {
      logger.error(
        `unable to create directory ${util.inspect(path)}: `
          + util.inspect(error),
      )

      process.exit(1)
    })
}
