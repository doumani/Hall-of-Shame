import { calendarDateISO } from "@/lib/on-this-day"
import type { Entry } from "@/lib/types"

const dayMs = 86_400_000

function byCatalogOrder(a: Entry, b: Entry) {
  return a.date.localeCompare(b.date) || a.title.localeCompare(b.title)
}

/** One catalog entry for an Eastern calendar date. The same date always returns the same entry. */
export function shameOfTheDay(entries: Entry[], date: Date) {
  if (entries.length === 0) return null
  const ordered = [...entries].sort(byCatalogOrder)
  const [year, month, day] = calendarDateISO(date).split("-").map(Number)
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / dayMs)
  const index = ((dayNumber % ordered.length) + ordered.length) % ordered.length
  return ordered[index]
}
