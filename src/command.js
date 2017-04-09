import {exec} from 'child-process-promise'
import util from 'util'
import {logger} from './logger'

function runCommand(message) {
  const command_promise = exec(process.env.VK_BOT_COMMAND)
    .then(result => {
      if (result.stderr !== '') {
        logger.error(
          `command ${util.inspect(process.env.VK_BOT_COMMAND)} returns error: `
            + util.inspect(result.stderr),
        )
      }

      return result.stdout
    })
  command_promise.childProcess.stdin.write(message)
  command_promise.childProcess.stdin.end()

  logger.info(
    `command ${util.inspect(process.env.VK_BOT_COMMAND)} has been run`,
  )
  return command_promise
}

export default function makeCommandRunner(response_handler) {
  return (vk_bot, message) => {
    return runCommand(JSON.stringify(message))
      .then(response => response_handler(vk_bot, response))
  }
}
