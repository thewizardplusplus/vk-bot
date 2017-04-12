import {exec} from 'child-process-promise'
import {logger, inspect} from './logger'

function runCommand(message, log_prefix = '') {
  const command_promise = exec(process.env.VK_BOT_COMMAND)
    .then(result => {
      if (result.stderr !== '') {
        logger.error(
          `${log_prefix}command ${inspect(process.env.VK_BOT_COMMAND)} `
            + `returns error: ${inspect(result.stderr)}`,
        )
      }

      return result.stdout
    })
  command_promise.childProcess.stdin.write(message)
  command_promise.childProcess.stdin.end()

  logger.info(
    `${log_prefix}command ${inspect(process.env.VK_BOT_COMMAND)} has been run`,
  )
  return command_promise
}

export default function makeCommandRunner(response_handler) {
  return (vk_bot, message) => {
    return runCommand(JSON.stringify(message))
      .then(response => response_handler(vk_bot, response))
  }
}
