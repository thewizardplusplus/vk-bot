#!/usr/bin/env node

import 'babel-polyfill'
import processEnv from './env'
import logger from './logger'

processEnv()
logger.info('Hello, world!')
