#!/usr/bin/env node

import 'babel-polyfill'
import processEnv from './env'
import {
  initVkBot,
  makeInboxUpdateHandler,
  makeEchoMessageHandler,
} from './vk_bot'

processEnv()
initVkBot(makeInboxUpdateHandler(makeEchoMessageHandler((vk_bot, message) => {
  return Promise.resolve({
    message: message.text,
  })
})))
