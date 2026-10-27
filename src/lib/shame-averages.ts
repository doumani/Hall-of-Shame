import { createClient } from "@supabase/supabase-js"
import { tallyShameScores } from "@/lib/shame"

const pageSize = 1000

function shameClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return null
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  })
}

export async function loadAllTimeShameAverages() {
  const client = shameClient()
  if (!client) return new Map<string, number>()

  const rows: { entry_id: string; score: number }[] = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from("shame_ratings")
      .select("entry_id, score")
      .range(from, from + pageSize - 1)

    if (error) {
      console.error(
        "Catalog: failed to load shame averages",
        error.message,
        error.code,
        error.details,
      )
      break
    }

    rows.push(...(data ?? []))
    if (!data || data.length < pageSize) break
  }

  const averages = new Map<string, number>()
  for (const [id, tally] of tallyShameScores(rows)) {
    averages.set(id, tally.sum / tally.count)
  }
  return averages
}

export async function loadEntryShame(entryId: string) {
  const client = shameClient()
  if (!client) return null

  const scores: number[] = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from("shame_ratings")
      .select("score")
      .eq("entry_id", entryId)
      .range(from, from + pageSize - 1)

    if (error) {
      console.error(
        "Share card: failed to load shame ratings",
        error.message,
        error.code,
        error.details,
      )
      break
    }

    for (const row of data ?? []) {
      const score = Number(row.score)
      if (Number.isFinite(score)) scores.push(score)
    }
    if (!data || data.length < pageSize) break
  }

  if (scores.length === 0) return null
  const sum = scores.reduce((total, score) => total + score, 0)
  return { average: sum / scores.length, votes: scores.length }
}

export async function loadShameRatings() {
  const client = shameClient()
  if (!client) return []

  const rows: { entry_id: string; score: number; created_at: string }[] = []
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await client
      .from("shame_ratings")
      .select("entry_id, score, created_at")
      .range(from, from + pageSize - 1)

    if (error) {
      console.error(
        "Rankings: failed to load shame ratings",
        error.message,
        error.code,
        error.details,
      )
      break
    }

    rows.push(...(data ?? []))
    if (!data || data.length < pageSize) break
  }

  return rows
}
