import os from 'os'
import path from 'path'

export function readEnvFilename(variable, default_relative_path) {
  return process.env[variable]
    || path.join(os.homedir(), '.vk-bot', ...default_relative_path.split('/'))
}
