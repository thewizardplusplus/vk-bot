import {name} from '../package.json'
import yargs from 'yargs'

const USAGE =
`Usage:
  ${name} --version
  ${name} --help`
const EPILOG =
`Environment variables:
  VK_BOT_TOKEN     VK API access token                                 [string]
  VK_BOT_COMMAND   Messages process command                            [string]
  VK_BOT_CACHE     File where to persist cached attachments            [string]
                   (default: ~/.vk-bot/attachments.json)

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
