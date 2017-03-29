#!/usr/bin/env node

import 'babel-polyfill'
import processOptions from './options'
import processEnv from './env'
import util from 'util'
import logger from './logger'
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
      makeCommandRunner((vk_bot, response) => {
        logger.info(`response has been received: ${util.inspect(response)}`)

        return {
          message: response,
        }
      }),
    ),
  ),
)
