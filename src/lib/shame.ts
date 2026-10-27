import { getSupabase } from "@/lib/supabase"

export const VOTER_KEY = "hos-voter-key"
export const SEED_VOTER_KEY = "seed"

export const shameWindows = [
  { id: "7d", label: "7 days" },
  { id: "30d", label: "30 days" },
  { id: "90d", label: "90 days" },
  { id: "ytd", label: "YTD" },
  { id: "all", label: "All time" },
] as const

export type ShameWindowId = (typeof shameWindows)[number]["id"]

export type ShameVote = {
  entry_id: string
  score: number
  created_at: string
  voter_key: string
}

export function getVoterKey() {
  const existing = window.localStorage.getItem(VOTER_KEY)
  if (existing) return existing
  const key = window.crypto.randomUUID()
  window.localStorage.setItem(VOTER_KEY, key)
  return key
}

export function averageOf(scores: number[]) {
  if (scores.length === 0) return null
  return scores.reduce((sum, score) => sum + score, 0) / scores.length
}

export function windowStart(id: ShameWindowId, now = new Date()) {
  if (id === "all") return null
  if (id === "ytd") return new Date(now.getFullYear(), 0, 1)
  const days = id === "7d" ? 7 : id === "30d" ? 30 : 90
  const start = new Date(now)
  start.setDate(start.getDate() - days)
  return start
}

export function votesInWindow(votes: ShameVote[], id: ShameWindowId, now = new Date()) {
  const start = windowStart(id, now)
  const filtered = start
    ? votes.filter((vote) => new Date(vote.created_at).getTime() >= start.getTime())
    : votes
  return [...filtered].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  )
}

type AverageRow = { sum: number; count: number }

let averagesCache: Promise<Map<string, AverageRow>> | null = null
const listeners = new Set<() => void>()

export function subscribeShame(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function invalidateShame() {
  averagesCache = null
  listeners.forEach((listener) => listener())
}

export function loadAverages() {
  if (!averagesCache) {
    averagesCache = fetchAverages().catch((error) => {
      averagesCache = null
      throw error
    })
  }
  return averagesCache
}

async function fetchAverages() {
  const supabase = getSupabase()
  const map = new Map<string, AverageRow>()
  if (!supabase) return map

  const { data, error } = await supabase.from("shame_ratings").select("entry_id, score")
  if (error || !data) return map

  for (const row of data) {
    const score = Number(row.score)
    if (!Number.isFinite(score)) continue
    const current = map.get(row.entry_id) ?? { sum: 0, count: 0 }
    current.sum += score
    current.count += 1
    map.set(row.entry_id, current)
  }
  return map
}
