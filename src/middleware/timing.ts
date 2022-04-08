import { log, Middleware } from '@deps'

const logger = log.getLogger('performanceLogger')

export const timingMiddleware: Middleware = async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.response.headers.set('X-Response-Time', `${ms}ms`)
  logger.info(`=> ${ctx.request.url.href} | Took ${ms}ms`)
}
