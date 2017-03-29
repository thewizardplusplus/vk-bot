#!/usr/bin/env node

import 'babel-polyfill'
import processEnv from './env'
import util from 'util'
import logger from './logger'
import {initVkBot, makeInboxUpdateHandler} from './vk_bot'

processEnv()
initVkBot(makeInboxUpdateHandler((vk_bot, message) => {
  logger.info(`message has been received: ${util.inspect(message)}`)
}))
