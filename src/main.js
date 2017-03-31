#!/usr/bin/env node

import 'babel-polyfill'
import processOptions from './options'
import processEnv from './env'
import {makeCachedAttachmentLoader} from './cache'
import makeAttachmentsHandler from './attachments'
import makeCommandRunner from './command'
import {
  initVkBot,
  makeInboxUpdateHandler,
  makeEchoMessageHandler,
} from './vk_bot'

processOptions()
processEnv()
initVkBot(
  makeInboxUpdateHandler(
    makeEchoMessageHandler(
      makeCommandRunner(makeAttachmentsHandler(makeCachedAttachmentLoader())),
    ),
  ),
)
