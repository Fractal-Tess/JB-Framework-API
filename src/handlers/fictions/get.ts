// deno-lint-ignore-file require-await
import { Context, log, RouterContext, Status } from '@deps'
import { fictionDB } from '@db'
import { FictionContentScrape, FullFiction } from '@types'

import { getQuery } from 'https://deno.land/x/oak@v10.4.0/helpers.ts'

// TODO: Handle 0 limit (scans full DB!)
export const handleGetFiction = async (ctx: Context): Promise<void> => {
  const { title, limit } = getQuery(ctx)
  let response: FullFiction | FullFiction[] | null = null

  if (title && limit) {
    response = await fictionDB
      .find({ title: { $regex: new RegExp(title, 'i') } })
      .limit(+limit)
      .sort({ views: 1 })
      .toArray()
  } else if (title) {
    response =
      (await fictionDB.findAndModify(
        { title: title },
        { update: { $inc: { views: 1 } } }
      )) || null
  } else {
    response = await fictionDB
      .find({})
      .limit(limit ? +limit : 20)
      .sort({ newestContent: 1 })
      .toArray()
  }
  if (!response) {
    return
  }
  ctx.response.body = response
}

export const handleGetChapter = async (
  ctx: RouterContext<'/fiction/:title/:chapter(\\d+)', Record<string, any>>
): Promise<void> => {
  let { title, chapter } = ctx.params as { title: string; chapter: string | number }
  chapter = +chapter - 1
  title = title.toLocaleLowerCase()

  const f = await fictionDB.findOne({ title: title })
  if (!f) {
    //   Such fiction does not exist
    ctx.response.status = 404
    return
  }

  if (chapter > f.chapters.length - 1 || chapter < 0) {
    ctx.throw(Status.BadRequest, `Desired chapter is out of bounds :${chapter}`)
  }

  let c = f.chapters[chapter]

  if (!c.content) {
    let sfc

    const url = new URL('http://localhost:7992/api/v1/scrapper/fiction/chapter')
    url.search = new URLSearchParams({
      platform: f.platform,
      scrapeURL: c.scrapeURL
    }).toString()

    try {
      const res = await fetch(url.toString())
      if (res.status !== 200) {
        ctx.response.status = 500
        return
      }
      sfc = (await res.json()) as FictionContentScrape
    } catch (e) {
      log.error(e)
      ctx.throw(Status.InternalServerError, `Unable to scrape content for this chapter`)
    }
    c = { ...c, ...sfc }
    const z = await fictionDB.updateOne(
      { _id: f._id, 'chapters.chapterNumber': c.chapterNumber },
      { $set: { 'chapters.$': c } }
    )
    console.log(z)
  }

  ctx.response.body = c
  ctx.response.status = 200
}
