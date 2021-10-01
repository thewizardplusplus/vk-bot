import { logger, inspect } from './logger'

export class MessageRegister {
  messages = new Map()

  get size() {
    return this.messages.size
  }

  isLastOrUnknown(message_id) {
    return (
      !this.messages.has(message_id) || message_id === this._getLastMessageId()
    )
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

  debug(log_prefix = '') {
    logger.debug(`${log_prefix}message register: ${inspect(this.messages)}`)
  }

  _getLastMessageId() {
    return Math.max(...this.messages.keys())
  }
}

export class UserRegister {
  users = new Map()

  isLastOrUnknown(user_id, message_id) {
    const messages = this.users.get(user_id)
    return (
      typeof messages === 'undefined' || messages.isLastOrUnknown(message_id)
    )
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

  debug(log_prefix = '') {
    logger.debug(`${log_prefix}user register: ${inspect(this.users)}`)
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

const register = new UserRegister()
export function makeRegisteringMessageHandler(message_handler) {
  return (vk_bot, message, log_prefix = '') => {
    register.add(message.peer_id, message.id)

    return message_handler(vk_bot, message, log_prefix).then(() =>
      register.remove(message.peer_id, message.id),
    )
  }
}

export function filterMessageByRegister(message) {
  return register.isLastOrUnknown(message.peer_id, message.id)
}
