import {logger, inspect} from './logger'

export class MessageRegister {
  messages = new Map()

  get size() {
    return this.messages.size
  }

  isLastOrUnknown(message_id) {
    return !this.messages.has(message_id)
      || message_id === this._getLastMessageId()
  }

  addAsUnprocessed(message_id) {
    this.messages.set(message_id, false)
  }

  markAsProcessed(message_id) {
    this.messages.set(message_id, true)
  }

  cleaned() {
    const cleaned_messages = new MessageRegister()
    const last_message_id = this._getLastMessageId()
    for (let [message_id, processed] of this.messages) {
      if (message_id === last_message_id || !processed) {
        cleaned_messages.messages.set(message_id, processed)
      }
    }

    return cleaned_messages
  }

  debug() {
    logger.debug(`message register: ${inspect(this.messages)}`)
  }

  _getLastMessageId() {
    return Math.max(...this.messages.keys())
  }
}

export class UserRegister {
  users = new Map()

  isLastOrUnknown(user_id, message_id) {
    const messages = this.users.get(user_id)
    return typeof messages === 'undefined'
      || messages.isLastOrUnknown(message_id)
  }

  add(user_id, message_id) {
    let messages = this.users.get(user_id)
    if (typeof messages === 'undefined') {
      messages = new MessageRegister()
      this.users.set(user_id, messages)
    }

    messages.addAsUnprocessed(message_id)
  }

  remove(user_id, message_id) {
    const messages = this.users.get(user_id)
    if (typeof messages !== 'undefined') {
      messages.markAsProcessed(message_id)
      this._clean(user_id, messages)
    }
  }

  debug() {
    logger.debug(`user register: ${inspect(this.users)}`)
  }

  _clean(user_id, messages) {
    const cleaned_messages = messages.cleaned()
    if (cleaned_messages.size > 1) {
      this.users.set(user_id, cleaned_messages)
    } else {
      this.users.delete(user_id)
    }
  }
}

export function makeRegisteringMessageHandler(message_handler) {
  return (vk_bot, message) => {
    logger.debug('start a message processing')

    return message_handler(vk_bot, message)
      .then(() => logger.debug('end a message processing'))
  }
}

export function filterMessageByRegister(message) {
  return true
}
