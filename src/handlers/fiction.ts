import { log, Status } from '@deps'
import { Fiction } from '@types'
import { fictionDB } from '../db/mongodb.ts'

export const createFiction = async (fiction: Fiction): Promise<Status> => {
  try {
    const dbResult = await fictionDB.findOne({ title: fiction.title })
    if (!dbResult) {
      fiction.chapters = fiction.chapters.map(chapter => {
        return {
          ...chapter,
          lastScrapped: new Date(chapter.lastScrapped)
        }
      })
      fiction.lastHiddenUpdate = new Date(fiction.lastHiddenUpdate)
      fiction.lastPublicUpdate = new Date(fiction.lastPublicUpdate)

      log.info(`Inserting new fiction ${fiction.title}`)
      await fictionDB.insertOne(fiction)
      return Status.OK
    } else {
      log.info(`Updating fiction ${fiction.title}`)
      await fictionDB.updateOne(
        { _id: dbResult._id },
        {
          $set: {
            //  New
            ...fiction,

            //  Keep
            _id: dbResult._id,
            jb_subscribers: dbResult.jb_subscribers,
            jb_views: dbResult.jb_views,
            jb_ratting: dbResult.jb_ratting,
            lastHiddenUpdate: new Date(),
            lastPublicUpdate:
              dbResult.chapterCount !== fiction.chapterCount
                ? new Date()
                : dbResult.lastPublicUpdate,

            chapters: fiction.chapters.map(chapter => {
              return {
                // Keep
                ...(dbResult.chapters.find(
                  f => f.chapterNumber === chapter.chapterNumber
                ) ?? chapter),

                // New
                chapterTitle: chapter.chapterTitle,
                original_views: chapter.original_views,
                original_likes: chapter.original_likes,
                lastScrapped: chapter.lastScrapped,
                uploadDate: chapter.uploadDate,
                scrapeUrl: chapter.scrapeUrl
              }
            })
          }
        }
      )
      return Status.OK
    }
  } catch (error) {
    log.error(error)
    return Status.InternalServerError
  }
}

export const getFiction = async (
  query: string,
  limit: number
): Promise<Fiction[] | null> => {
  if (query !== '') {
    const fictions = await fictionDB
      .find({
        $or: [
          { title: query },
          { abbreviation: query },
          { title: { $regex: new RegExp(query) } },
          { abbreviation: { $regex: new RegExp(query) } }
        ]
      })
      .sort({ original_views: 1 })
      .limit(limit)
      .toArray()
    return fictions ?? null
  }
  const fictions = await fictionDB
    .find({})
    .sort({ lastPublicUpdate: 1 })
    .limit(10)
    .toArray()
  return fictions ?? null
}