import { isHttpError, log, Middleware, Status } from '@deps'

const logger = log.getLogger('httpLogger')

export const httpError: Middleware = async (ctx, next) => {
  try {
    await next()
  } catch (err) {
    const message = err.message
    const status = err.status || err.statusCode || Status.InternalServerError

    /**
     * considering all unhandled errors as internal server error,
     * do not want to share internal server errors to
     * end user in non "development" mode
     */

    if (isHttpError(err)) {
      logger.error(
        { ...err },
        ` at pathname: => [${ctx.request.url.pathname}] by ip(s) ${ctx.request.ip}`
      )
      switch (err.status) {
        case Status.NotFound:
        case Status.Forbidden:
        case Status.BadRequest:
        case Status.Unauthorized:
        case Status.Conflict:
          break
        default:
          ctx.response.status = status
          ctx.response.body = message
      }
    } else {
      logger.error(err)
      ctx.response.status = Status.InternalServerError
      ctx.response.body = 'Something went wrong :('
      throw err
    }
  }
}
