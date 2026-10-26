/**
 * Catalog types. Shaped so a later Supabase migration can split this into
 * tables without renaming the public fields: entries, people, teams,
 * entry_people, entry_teams, and a categories lookup.
 *
 * `id` is a stable slug, identical to `slug`, so related-entry references
 * survive a move to a database primary key.
 */

export const categoryIds = [
  "baserunning",
  "fielding",
  "pitching",
  "hitting-mental",
  "umpire",
  "managerial",
  "front-office",
  "promotions",
  "fan-crowd",
  "rules",
  "personalities",
] as const

export const eraIds = [
  "dead-ball",
  "live-ball",
  "postwar",
  "expansion",
  "free-agency",
  "wild-card",
  "modern",
] as const

export const sortIds = ["newest", "oldest", "title"] as const

export type CategoryId = (typeof categoryIds)[number]
export type EraId = (typeof eraIds)[number]
export type SortId = (typeof sortIds)[number]

export interface PersonRef {
  id: string
  name: string
}

export interface TeamRef {
  id: string
  name: string
}

export interface EntryImage {
  url: string
  caption: string
  credit: string
}

export interface EntryVideo {
  url: string
  title: string
  credit?: string
}

export interface Entry {
  id: string
  slug: string
  title: string
  date: string
  year: number
  era: EraId
  categories: CategoryId[]
  teams: TeamRef[]
  players: PersonRef[]
  summary: string
  story: string
  images: EntryImage[]
  videos: EntryVideo[]
  tags: string[]
  related: string[]
  featured: boolean
}

export interface EntryFilters {
  q?: string
  category?: CategoryId
  era?: EraId
  sort: SortId
}
