import Loki from 'lokijs'
import util from 'util'
import logger from './logger'
import path from 'path'
import {readEnvFilename, createDirectory} from './files'

export class Cache {
  file
  db
  collection

  constructor(filename) {
    this.file = filename
    this.db = new Loki(filename)
  }

  load() {
    return new Promise((resolve, reject) => this.db.loadDatabase({}, error => {
        error === null ? resolve() : reject(error)
      }))
      .then(() => {
        logger.info(`cache file ${util.inspect(this.file)} has been loaded`)

        this.collection = this._getCollection()
        return this
      })
      .catch(error => {
        logger.error(
          `unable to load cache file ${util.inspect(this.file)}: `
            + util.inspect(error),
        )

        process.exit(1)
      })
  }

  save() {
    return new Promise((resolve, reject) => this.db.saveDatabase(error => {
        error === null ? resolve() : reject(error)
      }))
      .then(() => {
        logger.info(`cache file ${util.inspect(this.file)} has been saved`)
      })
      .catch(error => {
        logger.error(
          `unable to save cache file ${util.inspect(this.file)}: `
            + util.inspect(error),
        )
      })
  }

  get(attachment_path, exactly) {
    const {dir, base} = path.parse(attachment_path)
    let query = {
      'file.name': base,
    }
    if (exactly) {
      query = {
        $and: [query, {
          'file.path': dir,
        }],
      }
    }

    return this.collection.findOne(query)
  }

  add(attachment_id, attachment_path) {
    const {dir, base} = path.parse(attachment_path)
    return this.collection.insert({
      attachment: attachment_id,
      file: {
        path: dir,
        name: base,
      },
    })
  }

  addAndSave(attachment_id, attachment_path) {
    const attachment = this.add(attachment_id, attachment_path)
    return this
      .save()
      .then(() => attachment)
  }

  debug() {
    logger.debug(`cache: ${util.inspect(this.collection.find({}))}`)
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
  return createDirectory(path.dirname(cache_filename))
    .then(() => new Cache(cache_filename).load())
}
