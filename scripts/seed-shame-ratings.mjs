import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"

function loadEnv(file) {
  const text = readFileSync(file, "utf8")
  for (const line of text.split(/\r?\n/)) {
    const match = line.match(/^([^#=]+)=(.*)$/)
    if (!match) continue
    const value = match[2].trim().replace(/^["']|["']$/g, "")
    process.env[match[1].trim()] ??= value
  }
}

loadEnv(new URL("../.env.local", import.meta.url))

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
if (!url || !key) {
  console.error("Missing Supabase environment variables")
  process.exit(1)
}

const entries = JSON.parse(readFileSync(new URL("../src/data/entries.json", import.meta.url), "utf8"))
const seed = JSON.parse(readFileSync(new URL("../src/data/shame-seed.json", import.meta.url), "utf8"))
const known = new Set(entries.map((entry) => entry.slug))
const rows = seed
  .filter((row) => known.has(row.entry_slug))
  .map((row) => ({
    entry_id: row.entry_slug,
    score: row.score,
    voter_key: "seed",
    reason: row.short_reason,
  }))
const skipped = seed.filter((row) => !known.has(row.entry_slug)).map((row) => row.entry_slug)

const supabase = createClient(url, key)
const { count, error } = await supabase
  .from("shame_ratings")
  .select("id", { count: "exact", head: true })

if (error) {
  console.error(error.message)
  process.exit(1)
}

if ((count ?? 0) > 0) {
  console.log(`Table already has ${count} rows. Seed skipped.`)
  console.log(`Would have inserted ${rows.length} and skipped ${skipped.length}.`)
  process.exit(0)
}

const { error: insertError } = await supabase.from("shame_ratings").insert(rows)
if (insertError) {
  console.error(insertError.message)
  process.exit(1)
}

console.log(`Inserted ${rows.length} seed ratings.`)
console.log(`Skipped ${skipped.length}: ${skipped.join(", ")}`)
