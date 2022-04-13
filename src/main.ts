import { Application, log, oakCors } from '@deps'
import { config } from '@config'
import { initLog } from '@logger'

await initLog('overwrite')

const { router } = await import('./routes/router.ts')
const { timingMiddleware, httpError } = await import('./middleware/middlewares.ts')

const app = new Application()
app.addEventListener('error', evt => {
  log.error(`The server has encountered a runtime error:\n\t=> ${evt.error}`)
})

app.use(oakCors())
app.use(timingMiddleware)
app.use(httpError)

app.use(router.routes())
app.use(router.allowedMethods())

//TODO: Run scrappers on setInterval

app.addEventListener('listen', () => {
  log.info(`Running api server on ${config.SERVER_PORT}\n`)
})

const serverListen = app.listen({ port: +config.SERVER_PORT })

// const rs = await fetch('http://localhost:8888/api/v1/test')

await serverListen
