import { log, Middleware } from '@deps'

const logger = log.getLogger('performanceLogger')

export const timingMiddleware: Middleware = async (ctx, next) => {
  const start = Date.now()
  await next()
  const ms = Date.now() - start
  ctx.response.headers.set('X-Response-Time', `${ms}ms`)
  const msg = `${ctx.request.ip} => ${ctx.request.url.href} | Took ${ms}ms`
  logger.info(msg)
}
