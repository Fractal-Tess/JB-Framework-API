import { getAbbreviation } from '@utils'
import { fictionDB } from '@db'
import { log, Status, Context, z } from '@deps'
import { FullFictionChapter, ScrapeFiction, ScrapeFictionChapter } from '@types'

export const handlePostFiction = async (ctx: Context): Promise<void> => {
  let sf: ScrapeFiction
  try {
    sf = (await ctx.request.body({ type: 'json' }).value) as ScrapeFiction
  } catch (_) {
    ctx.throw(Status.InternalServerError, `Error while json parsing input`)
  }
  const result = validate(sf)
  if (!result.success) {
    ctx.throw(Status.BadRequest, `ScrapeFiction was in wrong format\n => ${result.error}`)
  }

  log.debug(`[POST] - fiction: ${sf.title.slice(0, 15)}`)

  const abbreviation = getAbbreviation(sf.title)
  sf.title = sf.title.toLocaleLowerCase()

  const f = await fictionDB.findOne({ title: sf.title })

  if (f) {
    // It's already in the database - update it!
    await fictionDB.updateOne(
      { _id: f._id },
      {
        $set: {
          // Here we update the desired values
          ...sf,
          chapters: updateChapters(sf.chapters, f.chapters)
        }
      }
    )
  } else {
    //  The fiction was not found in the database, create a new one
    fictionDB.insertOne({
      ...sf,

      abbreviation,

      subscribers: 0,
      views: 0,
      ratting: 0,

      chapters: sf.chapters.map(nc => updateChapter(nc)),
      newestContent: new Date()
    })
  }

  ctx.response.status = 200
}

const updateChapters = (
  ncs: ScrapeFictionChapter[],
  ocs: FullFictionChapter[]
): FullFictionChapter[] => {
  return ncs.map(nc => {
    const oc = ocs.find(oc => oc.chapterNumber === nc.chapterNumber)
    return updateChapter(nc, oc)
  })
}

const updateChapter = (
  nc: ScrapeFictionChapter,
  oc: FullFictionChapter | undefined = undefined
): FullFictionChapter => {
  if (!oc)
    return {
      ...nc,
      views: 0,
      likes: 0,
      lastScrapped: new Date()
    }
  return {
    ...oc,
    ...nc,
    content: nc.content || oc.content || null,
    lastScrapped: new Date()
  }
}

const validate = (sf: ScrapeFiction) => {
  const zod = z.object({
    title: z.string(),
    author: z.string().nullable(),
    chapterCount: z.number(),
    ageRating: z.enum(['everyone', 'teen', 'mature']).nullable(),
    status: z.enum(['completed', 'hiatus', 'ongoing', 'stub', 'dropped']).nullable(),
    genres: z.array(z.string()).nullable(),
    description: z.union([z.array(z.string()), z.string()]).nullable(),
    warning: z.array(z.string()).nullable(),
    banner: z.union([z.string(), z.array(z.number()).nonempty()]).nullable(),
    cover: z.union([z.string(), z.array(z.number()).nonempty()]).nullable(),
    chapters: z.array(
      z.object({
        chapterTitle: z.string().nullable(),
        chapterNumber: z.number(),
        content: z.union([z.string(), z.array(z.string())]).nullable(),
        uploadDate: z
          .preprocess(arg => {
            if (typeof arg === 'string' || arg instanceof Date) return new Date(arg)
          }, z.date())
          .nullable(),
        scrapeURL: z.string()
      })
    ),
    indexURL: z.string(),
    platform: z.enum(['RoyalRoad', 'ReadLightNovel'])
  })

  return zod.safeParse(sf)
}
