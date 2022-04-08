import { config as loadConfig, log } from '@deps'

interface ConfigSchema {
  DB_USER: string
  DB_PASS: string
  DB_NAME: string
  DB_PORT: string
  DB_HOST: string
  SERVER_PORT: string
}
log.info('Reading .env file')
const config = loadConfig() as unknown as ConfigSchema

export { config }
