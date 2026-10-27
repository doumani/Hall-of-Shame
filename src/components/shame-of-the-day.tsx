import Link from "next/link"
import { io } from "next/cache"
import { BaseballIcon } from "@/components/baseball-icon"
import { getAllEntries } from "@/lib/entries"
import { calendarDateISO, formatMonthDay } from "@/lib/on-this-day"
import { loadEntryShame } from "@/lib/shame-averages"
import { shameOfTheDay } from "@/lib/shame-of-the-day"
import { getCategory } from "@/lib/taxonomy"

function formatCalendarDate(date: Date) {
  const [year, month, day] = calendarDateISO(date).split("-").map(Number)
  return `${formatMonthDay(month, day)}, ${year}`
}

export async function ShameOfTheDay() {
  await io()
  const today = new Date()
  const entry = shameOfTheDay(getAllEntries(), today)
  if (!entry) return null

  const shame = await loadEntryShame(entry.id)
  const category = getCategory(entry.categories[0])

  return (
    <section className="border-b border-border bg-paper" aria-labelledby="shame-of-the-day-heading">
      <div className="mx-auto max-w-6xl px-5 py-8 md:py-10">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2
            id="shame-of-the-day-heading"
            className="flex items-center gap-3 font-serif text-2xl tracking-tight text-navy md:text-3xl"
          >
            <span aria-hidden="true" className="h-px w-6 bg-cardinal" />
            Shame of the Day
          </h2>
          <p className="text-sm tracking-wide text-muted-foreground">{formatCalendarDate(today)}</p>
        </div>
        <Link
          href={`/entries/${entry.slug}`}
          className="group mt-5 block max-w-3xl rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cardinal"
        >
          <p className="text-[11px] font-semibold tracking-[0.16em] text-cardinal uppercase">
            {entry.year}
            {category ? ` · ${category.label}` : ""}
          </p>
          <h3 className="mt-2 font-serif text-3xl leading-tight tracking-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 md:text-4xl">
            {entry.title}
          </h3>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{entry.summary}</p>
          {shame ? (
            <p className="mt-4 flex items-center gap-1.5 text-sm text-navy">
              <BaseballIcon filled className="size-3.5 text-cardinal" />
              <span className="tabular-nums">{shame.average.toFixed(1)}</span>
              <span className="text-muted-foreground">shame</span>
            </p>
          ) : null}
        </Link>
      </div>
    </section>
  )
}

export function ShameOfTheDayFallback() {
  return (
    <section className="border-b border-border bg-paper" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-5 py-8 md:py-10">
        <div className="h-8 w-56 bg-muted/70" />
      </div>
    </section>
  )
}
