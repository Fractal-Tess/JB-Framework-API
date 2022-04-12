import { ScrapeFiction } from '@types'
import { log, Router, Status } from '@deps'
import { handleScrapeFiction } from '@handlers'
// import { saveFiction, getFiction } from '../handlers/fiction.ts'

const router = new Router()

router.prefix('/api/v1')

router.post('/fiction', async ctx => {
  const sf = await ctx.request.body({ type: 'json' }).value
  if (validate(sf)) {
    await handleScrapeFiction(sf)
    ctx.response.status = 200
  } else {
    ctx.throw(Status.InternalServerError, 'Error while handling scrape fiction')
  }
})

// .get('/fiction', async ctx => {
//   const query = ctx.request.url.searchParams.get('query') ?? ''
//   const limit = ctx.request.url.searchParams.get('limit') ?? 10
//   ctx.response.body = 'Request does not bundle a query URL search param'

//   const fiction = await getFiction(query, +limit)
//   if (!fiction) {
//     ctx.response.status = 404
//     return
//   }

//   ctx.response.body = fiction
//   ctx.response.status = 200
// })
// .get('/heartbeat', ctx => {
//   ctx.response.status = 200
//   ctx.response.body = Math.random() > 0.5 ? 'Heart' : 'Beating'
// })

export { router }

const validate = (f: Record<string, any>): f is ScrapeFiction => {
  // import { Schema } from 'https://deno.land/x/valivar/mod.ts'
  // TODO: Make a ScrapeFiction validator
  return true
}
