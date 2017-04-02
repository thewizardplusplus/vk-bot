import dotenv from 'dotenv'
import util from 'util'
import logger from './logger'

function updateEnv() {
  const result = dotenv.config()
  if (typeof result.error !== 'undefined') {
    logger.warn(`unable to load the .env file: ${util.inspect(result.error)}`)
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

export default function processEnv() {
  updateEnv()
  validateEnv()
}
