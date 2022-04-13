import { Router } from '@deps'
import { handleGetChapter, handleGetFiction, handlePostFiction } from '@handlers'

const router = new Router()

router.prefix('/api/v1')

router
  .get('/heartbeat', ctx => {
    ctx.response.body = 'API UP!'
    ctx.response.status = 200
  })
  .post('/fiction', async ctx => {
    await handlePostFiction(ctx)
  })

  .get('/fiction', async ctx => {
    await handleGetFiction(ctx)
  })
  .get('/fiction/:title/:chapter(\\d+)', async ctx => {
    await handleGetChapter(ctx)
  })

export { router }
