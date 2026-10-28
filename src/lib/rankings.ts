import { windowStart } from "@/lib/shame"

export const rankingListLimit = 8
export const highestShameMinimum = 5
export const trendingMinimum = 3
export const moverBaselineMinimum = 3
export const moverRecentMinimum = 2
export const divisiveMinimum = 8
export const divisiveSpreadMinimum = 1
export const divisiveBoardMinimum = 3

export type ShameRatingRow = {
  entry_id: string
  score: number
  created_at: string
}

export type RankedEntry = {
  id: string
  slug: string
  title: string
  year: number
  average: number
  votes: number
  delta?: number
  low?: number
  high?: number
}

type CatalogEntry = {
  id: string
  slug: string
  title: string
  year: number
}

function mean(scores: number[]) {
  return scores.reduce((sum, score) => sum + score, 0) / scores.length
}

function standardDeviation(scores: number[]) {
  const average = mean(scores)
  const variance =
    scores.reduce((sum, score) => sum + (score - average) ** 2, 0) / scores.length
  return Math.sqrt(variance)
}

function scoresByEntry(rows: ShameRatingRow[], include: (row: ShameRatingRow) => boolean) {
  const groups = new Map<string, number[]>()
  for (const row of rows) {
    if (!include(row)) continue
    const score = Number(row.score)
    if (!Number.isFinite(score)) continue
    const scores = groups.get(row.entry_id) ?? []
    scores.push(score)
    groups.set(row.entry_id, scores)
  }
  return groups
}

function catalogById(entries: CatalogEntry[]) {
  return new Map(entries.map((entry) => [entry.id, entry]))
}

function ranked(
  groups: Map<string, number[]>,
  entries: CatalogEntry[],
  minimum: number,
  extra?: (id: string) => { delta?: number } | null,
) {
  const catalog = catalogById(entries)
  return [...groups.entries()].flatMap(([id, scores]) => {
    const entry = catalog.get(id)
    if (!entry || scores.length < minimum) return []
    const addition = extra?.(id)
    if (addition === null) return []
    return [
      {
        id,
        slug: entry.slug,
        title: entry.title,
        year: entry.year,
        average: mean(scores),
        votes: scores.length,
        ...addition,
      },
    ]
  })
}

function byAverage(a: RankedEntry, b: RankedEntry) {
  return b.average - a.average || b.votes - a.votes || a.title.localeCompare(b.title)
}

export function rankHighestShame(rows: ShameRatingRow[], entries: CatalogEntry[]) {
  return ranked(scoresByEntry(rows, () => true), entries, highestShameMinimum)
    .sort(byAverage)
    .slice(0, rankingListLimit)
}

export function rankTrending(rows: ShameRatingRow[], entries: CatalogEntry[], now: Date) {
  const start = windowStart("7d", now)?.getTime() ?? 0
  return ranked(
    scoresByEntry(rows, (row) => new Date(row.created_at).getTime() >= start),
    entries,
    trendingMinimum,
  )
    .sort(byAverage)
    .slice(0, rankingListLimit)
}

export function rankMovers(rows: ShameRatingRow[], entries: CatalogEntry[], now: Date) {
  const start = windowStart("30d", now)?.getTime() ?? 0
  const older = scoresByEntry(rows, (row) => new Date(row.created_at).getTime() < start)
  const recent = scoresByEntry(rows, (row) => new Date(row.created_at).getTime() >= start)
  const current = scoresByEntry(rows, () => true)

  return ranked(current, entries, moverBaselineMinimum + moverRecentMinimum, (id) => {
    const before = older.get(id) ?? []
    const inside = recent.get(id) ?? []
    if (before.length < moverBaselineMinimum || inside.length < moverRecentMinimum) return null
    const delta = mean(current.get(id) ?? []) - mean(before)
    if (Math.abs(delta) < 0.05) return null
    return { delta }
  })
    .sort(
      (a, b) =>
        Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0) ||
        b.votes - a.votes ||
        a.title.localeCompare(b.title),
    )
    .slice(0, rankingListLimit)
}

export function rankDivisive(rows: ShameRatingRow[], entries: CatalogEntry[]) {
  const catalog = catalogById(entries)
  const qualified = [...scoresByEntry(rows, () => true).entries()].flatMap(([id, scores]) => {
    const entry = catalog.get(id)
    const spread = standardDeviation(scores)
    if (!entry || scores.length < divisiveMinimum || spread < divisiveSpreadMinimum) return []
    return [
      {
        id,
        slug: entry.slug,
        title: entry.title,
        year: entry.year,
        average: mean(scores),
        votes: scores.length,
        low: Math.min(...scores),
        high: Math.max(...scores),
        spread,
      },
    ]
  })

  if (qualified.length < divisiveBoardMinimum) return []

  return qualified
    .sort((a, b) => b.spread - a.spread || b.votes - a.votes || a.title.localeCompare(b.title))
    .slice(0, rankingListLimit)
    .map((entry) => ({
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      year: entry.year,
      average: entry.average,
      votes: entry.votes,
      low: entry.low,
      high: entry.high,
    }))
}
