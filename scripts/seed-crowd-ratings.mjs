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

const minimum = 10
const targets = [
  { id: "merkles-boner", scores: [5, 4, 5, 5, 4, 5, 4, 5, 4, 5] },
  { id: "galarraga-imperfect-game", scores: [5, 5, 4, 5, 4, 5, 5, 4, 5, 4] },
  { id: "bartman-game", scores: [5, 5, 4, 5, 5, 4, 5, 4, 5, 5] },
  { id: "disco-demolition-night", scores: [4, 4, 3, 5, 4, 4, 3, 4, 4, 5] },
  { id: "cash-pulls-snell", scores: [4, 5, 4, 4, 5, 3, 4, 5, 4, 4] },
]

const supabase = createClient(url, key)
const ids = targets.map((target) => target.id)
const { data, error } = await supabase
  .from("shame_ratings")
  .select("entry_id, voter_key, score")
  .in("entry_id", ids)

if (error) {
  console.error(error.message, error.code, error.details)
  process.exit(1)
}

const rows = data ?? []
const inserts = []

for (const target of targets) {
  const existing = rows.filter((row) => row.entry_id === target.id)
  const used = new Set(existing.map((row) => row.voter_key))
  console.log(
    `${target.id}: ${existing.length} ratings` +
      (existing.length ? ` (avg ${(existing.reduce((sum, row) => sum + Number(row.score), 0) / existing.length).toFixed(2)})` : ""),
  )
  if (existing.length >= minimum) {
    console.log(`  already at ${minimum}+, skipped`)
    continue
  }

  let keyNumber = 2
  for (const score of target.scores) {
    if (existing.length + inserts.filter((row) => row.entry_id === target.id).length >= minimum) break
    let voterKey = `seed-${keyNumber}`
    while (used.has(voterKey)) {
      keyNumber += 1
      voterKey = `seed-${keyNumber}`
    }
    used.add(voterKey)
    keyNumber += 1
    inserts.push({
      entry_id: target.id,
      score,
      voter_key: voterKey,
      reason: null,
    })
  }
}

if (inserts.length === 0) {
  console.log("Nothing to insert.")
  process.exit(0)
}

const { error: insertError } = await supabase.from("shame_ratings").insert(inserts)
if (insertError) {
  console.error(insertError.message, insertError.code, insertError.details)
  process.exit(1)
}

console.log(`Inserted ${inserts.length} ratings.`)
for (const target of targets) {
  const added = inserts.filter((row) => row.entry_id === target.id)
  if (added.length === 0) continue
  console.log(
    `  ${target.id}: +${added.length} (${added.map((row) => `${row.voter_key}=${row.score}`).join(", ")})`,
  )
}
