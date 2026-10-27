import { createClient } from "@supabase/supabase-js"
import { tallyShameScores } from "@/lib/shame"

const pageSize = 1000

export async function loadAllTimeShameAverages() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return new Map<string, number>()

  const client = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
    },
  })

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
