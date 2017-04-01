#!/usr/bin/env node

import 'babel-polyfill'
import processOptions from './options'
import processEnv from './env'
import initFileLogger from './file_logger'
import {initCache} from './cache'
import makeCachedAttachmentLoader from './loader'
import {makeAttachmentsHandler} from './attachments'
import makeCommandRunner from './command'
import {
  initVkBot,
  makeInboxUpdateHandler,
  makeEchoMessageHandler,
} from './vk_bot'

processOptions()
processEnv()

initFileLogger()
  .then(() => initCache())
  .then(cache => initVkBot(
    makeInboxUpdateHandler(
      makeEchoMessageHandler(
        makeCommandRunner(
          makeAttachmentsHandler(makeCachedAttachmentLoader(cache)),
        ),
      ),
    ),
  ))
