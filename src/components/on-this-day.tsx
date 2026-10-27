import Link from "next/link"
import { io } from "next/cache"
import { getAllEntries } from "@/lib/entries"
import { calendarMonthDay, entriesOnThisDay, formatMonthDay } from "@/lib/on-this-day"
import { cn } from "@/lib/utils"

export async function OnThisDay() {
  await io()
  const today = new Date()
  const { month, day } = calendarMonthDay(today)
  const matches = entriesOnThisDay(getAllEntries(), today)

  return (
    <section className="border-b border-border" aria-labelledby="on-this-day-heading">
      <div className="mx-auto max-w-6xl px-5 py-7 md:py-8">
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2
            id="on-this-day-heading"
            className="flex items-center gap-3 font-serif text-2xl tracking-tight text-navy md:text-3xl"
          >
            <span aria-hidden="true" className="h-px w-6 bg-cardinal" />
            On this day
          </h2>
          <p className="text-sm tracking-wide text-muted-foreground">
            {formatMonthDay(month, day)}
          </p>
        </div>

        {matches.length === 0 ? (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
            No shame on this day in the record.{" "}
            <Link
              href="/submit"
              className="text-cardinal underline-offset-4 hover:underline"
            >
              Suggest an entry
            </Link>
            .
          </p>
        ) : (
          <ul
            className={cn(
              "mt-4 grid gap-x-8 gap-y-5",
              matches.length > 1 && "sm:grid-cols-2",
              matches.length > 2 && "lg:grid-cols-3",
            )}
          >
            {matches.map((entry) => (
              <li key={entry.id}>
                <Link
                  href={`/entries/${entry.slug}`}
                  className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cardinal"
                >
                  <p className="text-[11px] font-semibold tracking-[0.16em] text-cardinal tabular-nums">
                    {entry.year}
                  </p>
                  <p className="mt-1 font-serif text-xl leading-tight tracking-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
                    {entry.title}
                  </p>
                  <p className="mt-1.5 line-clamp-1 text-sm leading-relaxed text-muted-foreground">
                    {entry.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export function OnThisDayFallback() {
  return (
    <section className="border-b border-border" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-5 py-7 md:py-8">
        <div className="h-8 w-44 bg-muted/70" />
      </div>
    </section>
  )
}
