import { isHttpError, log, Middleware, Status } from '@deps'

const httpLogger = log.getLogger('httpLogger')

export const httpError: Middleware = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    const message = err.message
    const status = err.status || err.statusCode || Status.InternalServerError

    if (isHttpError(err)) {
      httpLogger.error(
        ` at pathname: => [${ctx.request.url.pathname}] by ip(s) ${ctx.request.ip}`,
        err
      )
      switch (err.status) {
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
      log.error(err)
      ctx.response.status = Status.InternalServerError
      ctx.response.body = 'Something went wrong :('
      throw err
    }
  }
}
