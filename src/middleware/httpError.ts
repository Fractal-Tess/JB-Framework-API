import { isHttpError, log, Middleware, Status } from '@deps'

const httpLogger = log.getLogger('httpLogger')

export const httpError: Middleware = async (ctx, next) => {
  try {
    await next()
  } catch (e) {
    const message = e.message
    const status = e.status || e.statusCode || Status.InternalServerError

    if (isHttpError(e)) {
      httpLogger.error(
        ` at pathname: => [${ctx.request.url.pathname}] by ip(s) ${ctx.request.ip}`,
        e.message
      )
      switch (e.status) {
        case Status.NotFound:
        case Status.Forbidden:
        case Status.BadRequest:
        case Status.Unauthorized:
        case Status.Conflict:
        default:
          ctx.response.status = status
          ctx.response.body = message
      }
    } else {
      log.error(e)
      ctx.response.status = Status.InternalServerError
      ctx.response.body = 'Something went wrong :('
      throw e
    }
  }
}
