import { Fiction } from '@types'
import { log, Router } from '@deps'
import { createFiction, getFiction } from '../handlers/fiction.ts'

const router = new Router()

router.prefix('/api/v1')

router
  .post('/fiction', async ctx => {
    try {
      const fiction = (await ctx.request.body({ type: 'json' })
        .value) as Fiction
      ctx.response.status = await createFiction(fiction)
    } catch (e) {
      log.error(`Error on posting /fiction`, e)
    }
  })
  .get('/fiction', async ctx => {
    const query = ctx.request.url.searchParams.get('query') ?? ''
    const limit = ctx.request.url.searchParams.get('limit') ?? 10
    ctx.response.body = 'Request does not bundle a query URL search param'

    const fiction = await getFiction(query, +limit)
    if (!fiction) {
      ctx.response.status = 404
      return
    }

    ctx.response.body = fiction
    ctx.response.status = 200
  })
  .get('/heartbeat', ctx => {
    ctx.response.status = 200
    ctx.response.body = Math.random() > 0.5 ? 'Heart' : 'Beating'
  })

export { router }
