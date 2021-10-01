import Loki from 'lokijs'
import { logger, inspect } from './logger'
import path from 'path'
import { readEnvFilename, createDirectory } from './files'

export class Cache {
  file
  db
  collection

  constructor(filename) {
    this.file = filename
    this.db = new Loki(filename)
  }

  load() {
    return new Promise((resolve, reject) =>
      this.db.loadDatabase({}, error => {
        error === null ? resolve() : reject(error)
      }),
    )
      .then(() => {
        logger.info(`cache file ${inspect(this.file)} has been loaded`)

        this.collection = this._getCollection()
        return this
      })
      .catch(error => {
        logger.error(
          `unable to load cache file ${inspect(this.file)}: ${inspect(error)}`,
        )

        process.exit(1)
      })
  }

  save(log_prefix = '') {
    return new Promise((resolve, reject) =>
      this.db.saveDatabase(error => {
        error === null ? resolve() : reject(error)
      }),
    )
      .then(() => {
        logger.info(
          `${log_prefix}cache file ${inspect(this.file)} has been saved`,
        )
      })
      .catch(error => {
        logger.error(
          `${log_prefix}unable to save cache file ${inspect(this.file)}: ` +
            inspect(error),
        )
      })
  }

  get(attachment_path, exactly) {
    const { dir, base } = path.parse(attachment_path)
    let query = {
      'file.name': base,
    }
    if (exactly) {
      query = {
        $and: [
          query,
          {
            'file.path': dir,
          },
        ],
      }
    }

    return this.collection.findOne(query)
  }

  add(attachment_id, attachment_path) {
    const { dir, base } = path.parse(attachment_path)
    return this.collection.insert({
      attachment: attachment_id,
      file: {
        path: dir,
        name: base,
      },
    })
  }

  addAndSave(attachment_id, attachment_path, log_prefix = '') {
    const attachment = this.add(attachment_id, attachment_path)
    return this.save(log_prefix).then(() => attachment)
  }

  debug(log_prefix = '') {
    logger.debug(`${log_prefix}cache: ${inspect(this.collection.find({}))}`)
  }

  _getCollection() {
    let collection = this.db.getCollection('attachments')
    if (collection === null) {
      collection = this.db.addCollection('attachments')
    }

    return collection
  }
}

export function initCache() {
  const cache_filename = readEnvFilename('VK_BOT_CACHE', 'attachments.json')
  return createDirectory(path.dirname(cache_filename)).then(() =>
    new Cache(cache_filename).load(),
  )
}
