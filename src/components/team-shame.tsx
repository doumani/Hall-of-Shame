import Link from "next/link"
import { io } from "next/cache"
import { BaseballIcon } from "@/components/baseball-icon"
import { formatCount } from "@/lib/format"
import { loadShameRatings } from "@/lib/shame-averages"
import { catalogComparison, teamShameSummary, type TeamShameEntry } from "@/lib/team-shame"
import type { Entry } from "@/lib/types"

export async function TeamShame({ entries }: { entries: Entry[] }) {
  await io()
  const summary = teamShameSummary(entries, await loadShameRatings())

  return (
    <section className="border-b border-border" aria-labelledby="team-shame-heading">
      <div className="mx-auto max-w-6xl px-5 py-10 md:py-12">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 border-b border-navy pb-4">
          <h2
            id="team-shame-heading"
            className="flex items-center gap-3 font-serif text-3xl tracking-tight text-navy"
          >
            <span aria-hidden="true" className="h-px w-6 bg-cardinal" />
            Shame meter
          </h2>
          {summary.average === null ? (
            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
              No scores yet. The entries below are still unrated.
            </p>
          ) : (
            <p className="flex items-center gap-2 text-navy">
              <BaseballIcon filled className="size-4 text-cardinal" />
              <span className="font-serif text-4xl leading-none tabular-nums">
                {summary.average.toFixed(1)}
              </span>
              <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Average
              </span>
            </p>
          )}
        </div>

        {summary.average !== null ? (
          <>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              {formatCount(summary.votes, "vote")} on {formatCount(summary.ratedEntries, "entry")}.
              {summary.leagueAverage !== null
                ? ` ${catalogComparison(summary.average, summary.leagueAverage)}`
                : ""}
            </p>
            <RankedEntries entries={summary.ranked} />
          </>
        ) : null}
      </div>
    </section>
  )
}

function RankedEntries({ entries }: { entries: TeamShameEntry[] }) {
  return (
    <ol className="mt-6">
      <li className="grid grid-cols-[2rem_3.25rem_minmax(0,1fr)_3.25rem] items-baseline gap-x-3 px-1 py-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase sm:grid-cols-[2rem_3.25rem_minmax(0,1fr)_4rem_5.5rem]">
        <span className="sr-only">Place</span>
        <span className="col-start-2">Year</span>
        <span>Entry</span>
        <span className="text-right">Average</span>
        <span className="hidden text-right sm:block">Votes</span>
      </li>
      {entries.map((entry, index) => (
        <li key={entry.id} className="border-t border-border">
          <Link
            href={`/entries/${entry.slug}`}
            className="grid grid-cols-[2rem_3.25rem_minmax(0,1fr)_3.25rem] items-baseline gap-x-3 px-1 py-3 hover:bg-paper sm:grid-cols-[2rem_3.25rem_minmax(0,1fr)_4rem_5.5rem]"
          >
            <span className="text-xs text-muted-foreground tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-sm font-semibold text-cardinal tabular-nums">{entry.year}</span>
            <span className="truncate font-serif text-xl leading-tight tracking-tight sm:overflow-visible sm:whitespace-normal">
              {entry.title}
            </span>
            <span className="text-right text-sm tabular-nums">{entry.average.toFixed(1)}</span>
            <span className="col-span-full text-right text-[11px] text-muted-foreground tabular-nums sm:col-span-1 sm:text-sm">
              {formatCount(entry.votes, "vote")}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}

export function TeamShameFallback() {
  return (
    <section className="border-b border-border" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-5 py-10 md:py-12">
        <div className="h-8 w-48 bg-muted/70" />
      </div>
    </section>
  )
}
