import fs from "fs"
import path from "path"
import rawEntries from "@/data/entries.json"
import { getCategory, getEra, eras } from "@/lib/taxonomy"
import type { CategoryId, Entry, EntryFilters, EraId, SortId } from "@/lib/types"
import { categoryIds, eraIds, sortIds } from "@/lib/types"

function isCategory(value: string | undefined): value is CategoryId {
  return categoryIds.includes(value as CategoryId)
}

function isEra(value: string | undefined): value is EraId {
  return eraIds.includes(value as EraId)
}

function isSort(value: string | undefined): value is SortId {
  return sortIds.includes(value as SortId)
}

function assertCatalog(entries: Entry[]) {
  const ids = new Set(entries.map((entry) => entry.id))

  for (const entry of entries) {
    if (entry.id !== entry.slug) {
      throw new Error(`Entry ${entry.id} must use the same id and slug.`)
    }
    if (!entry.date.startsWith(String(entry.year))) {
      throw new Error(`Entry ${entry.id} date does not match its year.`)
    }
    const era = eras.find((item) => item.id === entry.era)
    if (!era || entry.year < era.start || entry.year > era.end) {
      throw new Error(`Entry ${entry.id} is outside the ${entry.era} era.`)
    }
    if (entry.categories.length === 0) {
      throw new Error(`Entry ${entry.id} needs at least one category.`)
    }
    for (const category of entry.categories) {
      if (!isCategory(category)) {
        throw new Error(`Entry ${entry.id} has unknown category ${category}.`)
      }
    }
    for (const relatedId of entry.related) {
      if (!ids.has(relatedId)) {
        throw new Error(`Entry ${entry.id} relates to missing id ${relatedId}.`)
      }
    }
  }
}

export const entries = (rawEntries as Entry[]).map((entry) => ({
  ...entry,
  images: entry.images.filter((image) => {
    if (!image.url.startsWith("/")) return true
    return fs.existsSync(path.join(process.cwd(), "public", image.url))
  }),
}))

assertCatalog(entries)

const byId = new Map(entries.map((entry) => [entry.id, entry]))

export function getAllEntries() {
  return entries
}

export function getEntryBySlug(slug: string) {
  return entries.find((entry) => entry.slug === slug)
}

export function getEntryById(id: string) {
  return byId.get(id)
}

export function getFeaturedEntries() {
  return entries
    .filter((entry) => entry.featured)
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function getRelatedEntries(entry: Entry) {
  return entry.related
    .map((id) => byId.get(id))
    .filter((related): related is Entry => Boolean(related))
}

export interface RosterGroup {
  id: string
  name: string
  entries: Entry[]
}

function groupBy(
  pick: (entry: Entry) => { id: string; name: string }[],
): RosterGroup[] {
  const groups = new Map<string, RosterGroup>()

  for (const entry of entries) {
    for (const ref of pick(entry)) {
      const existing = groups.get(ref.id)
      if (existing) {
        existing.entries.push(entry)
      } else {
        groups.set(ref.id, { id: ref.id, name: ref.name, entries: [entry] })
      }
    }
  }

  return [...groups.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function getPlayers() {
  return groupBy((entry) => entry.players)
}

export function getTeams() {
  return groupBy((entry) => entry.teams)
}

function settle(group: RosterGroup | undefined) {
  if (!group) return undefined
  const entries = [...new Map(group.entries.map((entry) => [entry.id, entry])).values()].sort(
    (a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title),
  )
  return { ...group, entries }
}

export function getPlayer(id: string) {
  return settle(getPlayers().find((player) => player.id === id))
}

export function getTeam(id: string) {
  return settle(getTeams().find((team) => team.id === id))
}

export function getCategoryCounts() {
  return categoriesWithCounts()
}

function categoriesWithCounts() {
  return categoryIds.map((id) => ({
    ...getCategory(id)!,
    count: entries.filter((entry) => entry.categories.includes(id)).length,
  }))
}

export function getEraCounts() {
  return eraIds.map((id) => ({
    ...getEra(id)!,
    count: entries.filter((entry) => entry.era === id).length,
  }))
}

function haystack(entry: Entry) {
  const categoryLabels = entry.categories
    .map((id) => getCategory(id)?.label ?? id)
    .join(" ")
  const eraLabel = getEra(entry.era)?.label ?? entry.era

  return [
    entry.title,
    entry.summary,
    entry.story,
    entry.tags.join(" "),
    entry.players.map((player) => player.name).join(" "),
    entry.teams.map((team) => team.name).join(" "),
    categoryLabels,
    eraLabel,
    String(entry.year),
  ]
    .join(" ")
    .toLowerCase()
}

export function parseFilters(params: {
  q?: string | string[]
  category?: string | string[]
  era?: string | string[]
  sort?: string | string[]
}): EntryFilters {
  const first = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value

  const category = first(params.category)
  const era = first(params.era)
  const sort = first(params.sort)
  const q = first(params.q)?.trim()

  return {
    q: q ? q : undefined,
    category: isCategory(category) ? category : undefined,
    era: isEra(era) ? era : undefined,
    sort: isSort(sort) ? sort : "newest",
  }
}

export function filterEntries(filters: EntryFilters) {
  const query = filters.q?.toLowerCase()

  const matched = entries.filter((entry) => {
    if (filters.category && !entry.categories.includes(filters.category)) {
      return false
    }
    if (filters.era && entry.era !== filters.era) return false
    if (query && !haystack(entry).includes(query)) return false
    return true
  })

  return matched.sort((a, b) => {
    if (filters.sort === "title") return a.title.localeCompare(b.title)
    if (filters.sort === "oldest") {
      return a.date.localeCompare(b.date) || a.title.localeCompare(b.title)
    }
    return b.date.localeCompare(a.date) || a.title.localeCompare(b.title)
  })
}

export const homepageLeadSlug = "merkles-boner"

export const homepageGridSlugs = [
  "sale-of-babe-ruth",
  "eddie-gaedel",
  "buckner-game-six",
  "denkinger-safe-call",
  "lonnie-smith-game-seven",
  "galarraga-imperfect-game",
]
