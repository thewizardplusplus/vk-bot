#!/usr/bin/env node

import 'babel-polyfill'
import processEnv from './env'
import util from 'util'
import logger from './logger'
import {initVkBot} from './vk_bot'

processEnv()
initVkBot((vk_bot, update) => {
  logger.info(`update has been received: ${util.inspect(update)}`)
})
