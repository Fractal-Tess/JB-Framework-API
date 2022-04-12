import { Bson } from 'https://deno.land/x/mongo@v0.28.0/mod.ts'

type Asset = string | Uint8Array | null

// Scrapper imported
export interface ScrapeFiction {
  title: string
  author: string | null
  chapterCount: number
  ageRating: 'everyone' | 'teen' | 'mature' | null
  status: 'completed' | 'hiatus' | 'ongoing' | 'stub' | 'dropped' | null
  genres: string[] | null
  description: string | string[] | null

  warning: string[] | null

  banner: Asset
  cover: Asset

  lastPublicUpdate: Date
  lastHiddenUpdate: Date

  chapters: ScrapeFictionChapter[]
  indexURL: string
  platform: 'RoyalRoad' | 'ReadLightNovel'
}

export interface ScrapeFictionChapter {
  chapterTitle: string | null
  chapterNumber: number
  content: string[] | string | null
  uploadDate: Date | null
  scrapeURL: string
}

// Database stored
export interface FullFiction extends ScrapeFiction {
  _id?: Bson.ObjectId

  abbreviation: string | null

  subscribers: number
  views: number
  ratting: number

  chapters: FullFictionChapter[]

  newestContent: Date

  fictionURL: string
  platform: 'RoyalRoad' | 'ReadLightNovel'
}

export interface FullFictionChapter extends ScrapeFictionChapter {
  chapterTitle: string | null
  chapterNumber: number
  content: string[] | string | null
  original_views: number
  original_likes: number
  likes: number
  views: number
  lastScrapped: Date
  uploadDate: Date | null
  scrapeURL: string
}
