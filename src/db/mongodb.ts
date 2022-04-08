import { log, MongoClient } from '@deps'
import { Fiction } from '@types'

const client = new MongoClient()

log.info('Connecting to Mongodb')
await client.connect('mongodb://fractal:mpass@localhost:27017')
log.info('Connected to Mongodb')

export const fictionDB = client
  .database('JB-Framework-data')
  .collection<Fiction>('Fictions')
