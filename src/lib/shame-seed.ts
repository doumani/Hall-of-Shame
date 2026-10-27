"use server"

import shameSeed from "@/data/shame-seed.json"
import { SEED_VOTER_KEY } from "@/lib/shame"
import { getSupabase } from "@/lib/supabase"

let pending: Promise<void> | null = null

export async function ensureShameSeed(slugs: string[]) {
  if (!pending) {
    pending = seedIfEmpty(slugs).catch((error) => {
      pending = null
      throw error
    })
  }
  await pending
}

async function seedIfEmpty(slugs: string[]) {
  const supabase = getSupabase()
  if (!supabase) return

  const { count, error } = await supabase
    .from("shame_ratings")
    .select("id", { count: "exact", head: true })

  if (error || (count ?? 0) > 0) return

  const known = new Set(slugs)
  const rows = shameSeed
    .filter((row) => known.has(row.entry_slug))
    .map((row) => ({
      entry_id: row.entry_slug,
      score: row.score,
      voter_key: SEED_VOTER_KEY,
      reason: row.short_reason,
    }))

  if (rows.length === 0) return

  const { error: insertError } = await supabase.from("shame_ratings").insert(rows)
  if (insertError && insertError.code !== "23505") throw insertError
}
