#!/usr/bin/env node

import 'babel-polyfill'
import processOptions from './options'
import processEnv from './env'
import {initFileLogger, switchColorfulLogs} from './logger_ex'
import {initCache} from './cache'
import makeCachedAttachmentLoader from './loader'
import {makeAttachmentsHandler} from './attachments'
import makeCommandRunner from './command'
import {
  initVkBot,
  makeInboxUpdateHandler,
  makeErrorHandler,
  makeJoinRequester,
  makeJoinPleader,
  makeEchoMessageHandler,
} from './vk_bot'
import {
  makeRegisteringMessageHandler,
  filterMessageByRegister,
} from './register'

const options = processOptions()
processEnv(options.config)

initFileLogger()
  .then(() => {
    switchColorfulLogs()
    return initCache()
  })
  .then(cache => {
    const only_last = process.env.VK_BOT_ONLY_LAST === 'TRUE'
    const message_filter = only_last ? filterMessageByRegister : undefined
    let response_handler = makeAttachmentsHandler(
      makeCachedAttachmentLoader(cache),
    )
    if (process.env.VK_BOT_PLEAD_JOIN === 'TRUE') {
      response_handler = makeJoinPleader(response_handler, message_filter)
    }

    let message_handler = makeEchoMessageHandler(
      makeCommandRunner(response_handler),
      message_filter,
    )
    if (process.env.VK_BOT_REQUIRE_JOIN === 'TRUE') {
      message_handler = makeJoinRequester(message_handler, message_filter)
    }

    message_handler = makeErrorHandler(message_handler, message_filter)
    if (only_last) {
      message_handler = makeRegisteringMessageHandler(message_handler)
    }

    initVkBot(makeInboxUpdateHandler(message_handler))
  })
