import { calendarDateISO } from "@/lib/on-this-day"
import type { Entry, EntryImage } from "@/lib/types"

const dayMs = 86_400_000

/** Prefer a labeled portrait. Any other photograph on the entry still counts. */
export function heroImage(entry: Entry): EntryImage | null {
  return entry.images.find((image) => /portrait/i.test(image.caption)) ?? entry.images[0] ?? null
}

function byCatalogOrder(a: Entry, b: Entry) {
  return a.date.localeCompare(b.date) || a.title.localeCompare(b.title)
}

/**
 * One featured entry with a photograph, for an Eastern calendar date.
 * The same date always returns the same entry. Entries without a photo are skipped.
 */
export function heroOfTheDay(entries: Entry[], date: Date) {
  const shelf = entries.filter((entry) => entry.featured && heroImage(entry))
  if (shelf.length === 0) return null
  const ordered = [...shelf].sort(byCatalogOrder)
  const [year, month, day] = calendarDateISO(date).split("-").map(Number)
  const dayNumber = Math.floor(Date.UTC(year, month - 1, day) / dayMs)
  const index = ((dayNumber % ordered.length) + ordered.length) % ordered.length
  return ordered[index]
}
