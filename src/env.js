import dotenv from 'dotenv'
import {logger, inspect} from './logger'

function updateEnv(config_path) {
  const result = dotenv.config({
    path: config_path,
  })
  if (typeof result.error !== 'undefined') {
    logger.warn(`unable to load the .env file: ${inspect(result.error)}`)
  }
}

const REQUIRED_VARIABLES = [
  'VK_BOT_TOKEN',
  'VK_BOT_GROUP',
  'VK_BOT_COMMAND',
]
function validateEnv() {
  const missed_variables = REQUIRED_VARIABLES.filter(variable => {
    return typeof process.env[variable] === 'undefined'
      || process.env[variable].length === 0
  })
  if (missed_variables.length !== 0) {
    logger.error(
      `following environment variables are required: `
        + missed_variables.join(', '),
    )

    process.exit(1)
  }
}

export default function processEnv(config_path) {
  updateEnv(config_path)
  validateEnv()
}
