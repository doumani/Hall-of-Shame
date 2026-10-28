import fs from "fs"
import path from "path"
import rawEntries from "@/data/entries.json"
import { categories, eras, getCategory, getEra } from "@/lib/taxonomy"
import type { CategoryId, Entry, EntryFilters, EraId, SortId, VoteSampleId } from "@/lib/types"
import { categoryIds, consequenceIds, eraIds, leverageIds, sortIds, voteSampleIds } from "@/lib/types"

export const needsVotesBelow = 3

function isCategory(value: string | undefined): value is CategoryId {
  return categoryIds.includes(value as CategoryId)
}

function isEra(value: string | undefined): value is EraId {
  return eraIds.includes(value as EraId)
}

function isSort(value: string | undefined): value is SortId {
  return sortIds.includes(value as SortId)
}

function isVoteSample(value: string | undefined): value is VoteSampleId {
  return voteSampleIds.includes(value as VoteSampleId)
}

function isLeverage(value: string): boolean {
  return leverageIds.includes(value as (typeof leverageIds)[number])
}

function isConsequence(value: string): boolean {
  return consequenceIds.includes(value as (typeof consequenceIds)[number])
}

function filterToken(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function resolveListedId<T extends { id: string; label: string }>(
  value: string | undefined,
  items: T[],
): T["id"] | undefined {
  if (!value) return undefined
  const direct = items.find((item) => item.id === value)
  if (direct) return direct.id
  const token = filterToken(value)
  return items.find(
    (item) => filterToken(item.id) === token || filterToken(item.label) === token,
  )?.id
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
    if (entry.damage) {
      const { leverage, consequence, stakes } = entry.damage
      if (!leverage && !consequence && !stakes?.trim()) {
        throw new Error(`Entry ${entry.id} has an empty damage report.`)
      }
      if (leverage && !isLeverage(leverage)) {
        throw new Error(`Entry ${entry.id} has unknown leverage ${leverage}.`)
      }
      if (consequence && !isConsequence(consequence)) {
        throw new Error(`Entry ${entry.id} has unknown consequence ${consequence}.`)
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

const relatedLimit = 4

function foldName(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
}

function titleMentions(title: string, name: string) {
  const surname = name.split(/\s+/).at(-1) ?? ""
  if (foldName(surname).length < 4) return false
  const tokens = title.split(/[^A-Za-z0-9\u00C0-\u024F'’]+/)
  const target = foldName(surname)
  return tokens.some((token) => foldName(token) === target)
}

function subjectIds(entry: Entry) {
  const mentioned = entry.players.filter((player) => titleMentions(entry.title, player.name))
  const subjects = mentioned.length > 0 ? mentioned : entry.players.slice(0, 1)
  return new Set(subjects.map((player) => player.id))
}

function sharedIds(left: { id: string }[], right: { id: string }[]) {
  const ids = new Set(right.map((item) => item.id))
  return left.reduce((count, item) => count + (ids.has(item.id) ? 1 : 0), 0)
}

/**
 * Up to four other entries, ranked by shared subject, category, team, and era.
 * Curated links win ties. Nearer years fill the list when little else overlaps.
 */
export function getRelatedEntries(entry: Entry) {
  const subjects = subjectIds(entry)

  return entries
    .filter((candidate) => candidate.id !== entry.id)
    .map((candidate) => {
      const candidatePlayers = new Set(candidate.players.map((player) => player.id))
      let subjectPlayers = 0
      let otherPlayers = 0
      for (const player of entry.players) {
        if (!candidatePlayers.has(player.id)) continue
        if (subjects.has(player.id)) subjectPlayers += 1
        else otherPlayers += 1
      }

      const teams = sharedIds(entry.teams, candidate.teams)
      const categories = entry.categories.filter((id) =>
        candidate.categories.includes(id),
      ).length
      const sameEra = candidate.era === entry.era ? 1 : 0
      const curated = entry.related.includes(candidate.id) ? 1 : 0
      const sharesPrimary = candidate.categories.includes(entry.categories[0]) ? 1 : 0
      const score =
        subjectPlayers * 12 +
        otherPlayers * 3 +
        categories * 8 +
        teams * 4 +
        sameEra * 2 +
        curated * 3 +
        sharesPrimary * 3

      return {
        candidate,
        score,
        categories,
        subjectPlayers,
        teams,
        curated,
        yearGap: Math.abs(candidate.year - entry.year),
      }
    })
    .sort(
      (a, b) =>
        b.score - a.score ||
        b.categories - a.categories ||
        b.subjectPlayers - a.subjectPlayers ||
        b.teams - a.teams ||
        b.curated - a.curated ||
        a.yearGap - b.yearGap ||
        a.candidate.title.localeCompare(b.candidate.title),
    )
    .slice(0, relatedLimit)
    .map((item) => item.candidate)
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

/** Extra words for a club whose usual name or abbreviation is not already in the team name. */
const teamSearchTerms: Record<string, readonly string[]> = {
  "arizona-diamondbacks": ["dbacks", "d-backs"],
  "boston-red-sox": ["bosox", "red sox"],
  "california-angels": ["halos"],
  "chicago-cubs": ["cubs"],
  "chicago-white-sox": ["chisox", "white sox"],
  "cleveland-guardians": ["tribe"],
  "cleveland-indians": ["tribe"],
  "los-angeles-angels-of-anaheim": ["halos"],
  "new-york-yankees": ["yankees", "yanks", "nyy"],
  "pittsburgh-pirates": ["bucs"],
  "st-louis-cardinals": ["cards"],
  "washington-nationals": ["nats"],
}

/** Words a reader types for a category when the label says it differently. */
const categorySearchTerms: Partial<Record<CategoryId, readonly string[]>> = {
  baserunning: ["baserunning", "base running", "baserunner"],
  umpire: ["umpire", "umpires"],
  "front-office": ["trade", "trades"],
  personalities: ["off field"],
}

function searchText(value: string) {
  return foldName(value)
    .replace(/['’,]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function haystack(entry: Entry) {
  const categoryLabels = entry.categories
    .map((id) => {
      const category = getCategory(id)
      const extra = categorySearchTerms[id] ?? []
      return [category?.label ?? id, id, ...extra].join(" ")
    })
    .join(" ")
  const eraLabel = getEra(entry.era)?.label ?? entry.era
  const teamNames = entry.teams
    .map((team) => [team.name, ...(teamSearchTerms[team.id] ?? [])].join(" "))
    .join(" ")

  return searchText(
    [
      entry.title,
      entry.summary,
      entry.story,
      entry.tags.join(" "),
      entry.players.map((player) => player.name).join(" "),
      teamNames,
      categoryLabels,
      eraLabel,
      String(entry.year),
    ].join(" "),
  )
}

export function parseFilters(params: {
  q?: string | string[]
  category?: string | string[]
  era?: string | string[]
  sort?: string | string[]
  votes?: string | string[]
}): EntryFilters {
  const first = (value?: string | string[]) =>
    Array.isArray(value) ? value[0] : value

  const category = resolveListedId(first(params.category), categories)
  const era = resolveListedId(first(params.era), eras)
  const sort = first(params.sort)
  const votes = first(params.votes)
  const q = first(params.q)?.trim()

  return {
    q: q ? q : undefined,
    category: isCategory(category) ? category : undefined,
    era: isEra(era) ? era : undefined,
    sort: isSort(sort) ? sort : "newest",
    votes: isVoteSample(votes) ? votes : undefined,
  }
}

function byRecency(a: Entry, b: Entry) {
  return b.date.localeCompare(a.date) || a.title.localeCompare(b.title)
}

function byShame(a: Entry, b: Entry, averages: ReadonlyMap<string, number> | undefined) {
  const aScore = averages?.get(a.id)
  const bScore = averages?.get(b.id)
  const aRated = aScore !== undefined
  const bRated = bScore !== undefined
  if (aRated && bRated && aScore !== bScore) return bScore - aScore
  if (aRated !== bRated) return aRated ? -1 : 1
  return byRecency(a, b)
}

export function filterEntries(
  filters: EntryFilters,
  shameAverages?: ReadonlyMap<string, number>,
  voteCounts?: ReadonlyMap<string, number>,
) {
  const query = filters.q ? searchText(filters.q) : ""

  const matched = entries.filter((entry) => {
    if (filters.category && !entry.categories.includes(filters.category)) {
      return false
    }
    if (filters.era && entry.era !== filters.era) return false
    if (filters.votes === "low" && (voteCounts?.get(entry.id) ?? 0) >= needsVotesBelow) {
      return false
    }
    if (query && !haystack(entry).includes(query)) return false
    return true
  })

  return matched.sort((a, b) => {
    if (filters.sort === "title") return a.title.localeCompare(b.title)
    if (filters.sort === "oldest") {
      return a.date.localeCompare(b.date) || a.title.localeCompare(b.title)
    }
    if (filters.sort === "shame") return byShame(a, b, shameAverages)
    return byRecency(a, b)
  })
}

export const homepageGridSlugs = [
  "sale-of-babe-ruth",
  "eddie-gaedel",
  "buckner-game-six",
  "denkinger-safe-call",
  "lonnie-smith-game-seven",
  "galarraga-imperfect-game",
]
