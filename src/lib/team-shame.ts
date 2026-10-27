import { averageOf } from "@/lib/shame"

export const teamShameListLimit = 5

export type TeamShameEntry = {
  id: string
  slug: string
  title: string
  year: number
  average: number
  votes: number
}

export type TeamShameSummary = {
  average: number | null
  votes: number
  ratedEntries: number
  leagueAverage: number | null
  ranked: TeamShameEntry[]
}

type CatalogEntry = {
  id: string
  slug: string
  title: string
  year: number
}

export function teamShameSummary(
  entries: CatalogEntry[],
  rows: { entry_id: string; score: number }[],
  limit = teamShameListLimit,
): TeamShameSummary {
  const ids = new Set(entries.map((entry) => entry.id))
  const teamScores: number[] = []
  const leagueScores: number[] = []
  const byEntry = new Map<string, number[]>()

  for (const row of rows) {
    const score = Number(row.score)
    if (!Number.isFinite(score)) continue
    leagueScores.push(score)
    if (!ids.has(row.entry_id)) continue
    teamScores.push(score)
    const scores = byEntry.get(row.entry_id) ?? []
    scores.push(score)
    byEntry.set(row.entry_id, scores)
  }

  const catalog = new Map(entries.map((entry) => [entry.id, entry]))
  const ranked = [...byEntry.entries()]
    .flatMap(([id, scores]) => {
      const entry = catalog.get(id)
      const average = averageOf(scores)
      if (!entry || average === null) return []
      return [{ ...entry, average, votes: scores.length }]
    })
    .sort(
      (a, b) => b.average - a.average || b.votes - a.votes || a.title.localeCompare(b.title),
    )
    .slice(0, limit)

  return {
    average: averageOf(teamScores),
    votes: teamScores.length,
    ratedEntries: byEntry.size,
    leagueAverage: averageOf(leagueScores),
    ranked,
  }
}

export function catalogComparison(teamAverage: number, leagueAverage: number) {
  const gap = teamAverage - leagueAverage
  const league = leagueAverage.toFixed(1)
  if (Math.abs(gap) < 0.05) return `In line with the catalog average of ${league}.`
  const direction = gap > 0 ? "above" : "below"
  return `${Math.abs(gap).toFixed(1)} ${direction} the catalog average of ${league}.`
}
