import {name} from '../package.json'
import yargs from 'yargs'

const USAGE =
`Usage:
  ${name} --version
  ${name} --help
  ${name} [--config PATH | -c PATH]`
const EPILOG =
`Environment variables:
  VK_BOT_TOKEN          VK API access token                            [string]
  VK_BOT_GROUP          ID or screen name of the group                 [string]
  VK_BOT_COMMAND        Messages process command                       [string]
  VK_BOT_CACHE          File where to persist cached attachments       [string]
                        (default: ~/.vk-bot/attachments.json)
  VK_BOT_INEXACT_CACHE  Search attachments in a cache only by its      [boolean]
                        basenames (allowed: TRUE)
  VK_BOT_LOG            File where to persist a log (default:          [string]
                        ~/.vk-bot/logs/app.log)
  VK_BOT_COLORFUL_LOG   Colorize log messages (allowed: TRUE)          [boolean]
  VK_BOT_PRELIMINARILY  Preliminary response about a receiving of      [string]
                        a message for a processing (default: Hello!
                        Your message is being processed. Please,
                        wait.)
  VK_BOT_REQUIRE_JOIN   Require join to the group before start         [boolean]
                        a conversation (allowed: TRUE)
  VK_BOT_JOIN_REQUEST   Request of a join to the group (default:       [string]
                        Hello! To talk to me, please, join my group.)
  VK_BOT_ERROR          Special response on an error in a message      [string]
                        processing (default: I'm sorry, but error has
                        occurred on a processing of your message.
                        Please, try again.)
  VK_BOT_ONLY_LAST      Respond only to a last message from several    [boolean]
                        messages received simultaneously (allowed:
                        TRUE)

Copyright (C) 2017-2018 thewizardplusplus`
export default function processOptions() {
  return yargs
    .locale('en')
    .showHelpOnFail(false)
    .strict()
    .usage(USAGE)
    .version()
    .help()
    .option('config', {
      alias: 'c',
      type: 'string',
      describe: 'Path to a .env config (default: ./.env)',
    })
    .epilog(EPILOG)
    .argv
}
