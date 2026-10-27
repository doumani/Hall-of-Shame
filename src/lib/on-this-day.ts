import type { Entry } from "@/lib/types"

const onThisDayLimit = 3

/** Baseball's day turns over on the Eastern calendar, not UTC. */
const recordTimeZone = "America/New_York"

export function calendarMonthDay(date: Date, timeZone = recordTimeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const month = Number(parts.find((part) => part.type === "month")?.value)
  const day = Number(parts.find((part) => part.type === "day")?.value)
  return { month, day }
}

export function calendarDateISO(date: Date, timeZone = recordTimeZone) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date)
  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  const day = parts.find((part) => part.type === "day")?.value
  return `${year}-${month}-${day}`
}

export function formatMonthDay(month: number, day: number) {
  return new Date(Date.UTC(2000, month - 1, day)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

function monthAndDay(iso: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return null
  return { month: Number(match[2]), day: Number(match[3]) }
}

export function entriesOnThisDay(entries: Entry[], date: Date) {
  const today = calendarMonthDay(date)
  return entries
    .filter((entry) => {
      const key = monthAndDay(entry.date)
      return key?.month === today.month && key?.day === today.day
    })
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-onThisDayLimit)
}
