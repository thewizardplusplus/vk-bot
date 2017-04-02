import {name} from '../package.json'
import yargs from 'yargs'

const USAGE =
`Usage:
  ${name} --version
  ${name} --help`
const EPILOG =
`Environment variables:
  VK_BOT_TOKEN          VK API access token                            [string]
  VK_BOT_COMMAND        Messages process command                       [string]
  VK_BOT_CACHE          File where to persist cached attachments       [string]
                        (default: ~/.vk-bot/attachments.json)
  VK_BOT_INEXACT_CACHE  Search attachments in a cache only by its      [boolean]
                        basenames (allowed: TRUE)
  VK_BOT_LOG            File where to persist a log (default:          [string]
                        ~/.vk-bot/logs/app.log)
  VK_BOT_PRELIMINARILY  Preliminary response about a receiving of      [string]
                        a message for a processing (default: Hello!
                        Your message is being processed. Please,
                        wait.)
  VK_BOT_REQUIRE_JOIN   Require join to the group before start         [boolean]
                        a conversation (allowed: TRUE)

Copyright (C) 2017 thewizardplusplus`
export default function processOptions() {
  yargs
    .locale('en')
    .showHelpOnFail(false)
    .strict()
    .usage(USAGE)
    .version()
    .help()
    .epilog(EPILOG)
    .argv
}
