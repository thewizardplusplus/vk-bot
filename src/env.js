import dotenv from 'dotenv'
import util from 'util'
import logger from './logger'

function updateEnv() {
  const result = dotenv.config()
  if (typeof result.error !== 'undefined') {
    logger.warn(`unable to load the .env file: ${util.inspect(result.error)}`)
  }
}

function testEnv(result_name, variables, incorrects_filter) {
  const incorrect_variables = variables.filter(incorrects_filter)
  if (incorrect_variables.length !== 0) {
    logger.error(
      `following environment variables are ${result_name}: `
        + incorrect_variables.join(', '),
    )

    process.exit(1)
  }
}

const REQUIRED_VARIABLES = [
  'VK_BOT_TOKEN',
  'VK_BOT_GROUP',
  'VK_BOT_COMMAND',
]
function checkRequiredEnv() {
  testEnv('required', REQUIRED_VARIABLES, variable => {
    return typeof process.env[variable] === 'undefined'
  })
}

const VARIABLES_PATTERNS = {
  VK_BOT_TOKEN: /.+/,
  VK_BOT_GROUP: /.+/,
  VK_BOT_COMMAND: /.+/,
}
function validateEnv() {
  testEnv('incorrect', Object.keys(process.env), variable => {
    return typeof VARIABLES_PATTERNS[variable] !== 'undefined'
      && !VARIABLES_PATTERNS[variable].test(process.env[variable])
  })
}

export default function processEnv() {
  updateEnv()

  checkRequiredEnv()
  validateEnv()
}
