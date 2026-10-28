import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { io } from "next/cache"
import { getAllEntries } from "@/lib/entries"
import {
  divisiveMinimum,
  highestShameMinimum,
  moverBaselineMinimum,
  moverRecentMinimum,
  rankDivisive,
  rankHighestShame,
  rankMovers,
  rankTrending,
  trendingMinimum,
  type RankedEntry,
} from "@/lib/rankings"
import { loadShameRatings } from "@/lib/shame-averages"

export const metadata: Metadata = {
  title: "Rankings",
  description:
    "Shame-meter standings: the highest averages, the last seven days, the biggest moves over thirty days, and the widest splits.",
}

export default function RankingsPage() {
  return (
    <div>
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-cream/75 uppercase">
            <span className="h-px w-8 bg-cardinal" />
            The shame meter
          </p>
          <h1 className="display mt-4 max-w-3xl text-5xl leading-[0.95] text-cream md:text-7xl">
            Rankings
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/80 md:text-lg">
            Standings from anonymous scores. They move as new ballots come in.
          </p>
        </div>
      </header>
      <Suspense fallback={<RankingsFallback />}>
        <Rankings />
      </Suspense>
    </div>
  )
}

async function Rankings() {
  await io()
  const now = new Date()
  const rows = await loadShameRatings()
  const entries = getAllEntries()

  return (
    <div className="mx-auto grid max-w-6xl gap-14 px-5 py-12 md:py-16">
      <Board
        id="highest-shame"
        title="Highest shame"
        note={`All-time average. An entry needs at least ${highestShameMinimum} votes.`}
        rows={rankHighestShame(rows, entries)}
        empty={`No entry has ${highestShameMinimum} votes yet.`}
      />
      <Board
        id="trending"
        title="Trending"
        note={`Highest average from votes cast in the last 7 days. At least ${trendingMinimum} votes in that window.`}
        rows={rankTrending(rows, entries, now)}
        empty={`No entry has ${trendingMinimum} votes in the last 7 days.`}
        averageLabel="7-day avg"
      />
      <Board
        id="movers"
        title="Biggest movers"
        note={`Largest change from the average before the last 30 days to the average now. Needs ${moverBaselineMinimum} earlier votes and ${moverRecentMinimum} inside the window.`}
        rows={rankMovers(rows, entries, now)}
        empty="Nothing has moved yet. A change needs votes from before the last 30 days, and votes inside that window."
        showDelta
      />
      <Board
        id="most-divisive"
        title="Most divisive"
        note={`Widest split in the scores. An entry needs at least ${divisiveMinimum} votes, and the ballots have to disagree.`}
        rows={rankDivisive(rows, entries)}
        empty={`Not enough disagreement yet. The list appears once three entries have at least ${divisiveMinimum} votes and a real split in the scores.`}
        showSpread
      />
    </div>
  )
}

function Board({
  id,
  title,
  note,
  rows,
  empty,
  averageLabel = "Average",
  showDelta = false,
  showSpread = false,
}: {
  id: string
  title: string
  note: string
  rows: RankedEntry[]
  empty: string
  averageLabel?: string
  showDelta?: boolean
  showSpread?: boolean
}) {
  const columns = showDelta || showSpread
    ? "grid-cols-[2rem_3.25rem_minmax(0,1fr)_3.25rem_3.25rem] sm:grid-cols-[2rem_3.25rem_minmax(0,1fr)_3.5rem_4rem_5.5rem]"
    : "grid-cols-[2rem_3.25rem_minmax(0,1fr)_3.25rem] sm:grid-cols-[2rem_3.25rem_minmax(0,1fr)_4rem_5.5rem]"

  return (
    <section aria-labelledby={id}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-b border-navy pb-3">
        <h2 id={id} className="flex items-center gap-3 font-serif text-3xl tracking-tight text-navy">
          <span aria-hidden="true" className="h-px w-6 bg-cardinal" />
          {title}
        </h2>
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{note}</p>
      </div>
      {rows.length === 0 ? (
        <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground">{empty}</p>
      ) : (
        <ol className="mt-2">
          <li className={`grid items-baseline gap-x-3 px-1 py-2 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase ${columns}`}>
            <span className="sr-only">Place</span>
            <span className="col-start-2">Year</span>
            <span>Entry</span>
            {showDelta ? <span className="text-right">Change</span> : null}
            {showSpread ? <span className="text-right">Spread</span> : null}
            <span className="text-right">{averageLabel}</span>
            <span className="hidden text-right sm:block">Votes</span>
          </li>
          {rows.map((entry, index) => (
            <li key={entry.id} className="border-t border-border">
              <Link
                href={`/entries/${entry.slug}`}
                className={`grid items-baseline gap-x-3 px-1 py-3 hover:bg-paper ${columns}`}
              >
                <span className="text-xs text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold text-cardinal tabular-nums">{entry.year}</span>
                <span className="truncate font-serif text-xl leading-tight tracking-tight sm:overflow-visible sm:whitespace-normal">
                  {entry.title}
                </span>
                {showDelta && entry.delta !== undefined ? (
                  <span className="text-right text-sm text-cardinal tabular-nums">{formatDelta(entry.delta)}</span>
                ) : null}
                {showSpread && entry.low !== undefined && entry.high !== undefined ? (
                  <span className="text-right text-sm text-cardinal tabular-nums">
                    {entry.low}–{entry.high}
                  </span>
                ) : null}
                <span className="text-right text-sm tabular-nums">{entry.average.toFixed(1)}</span>
                <span className="col-span-full text-right text-[11px] text-muted-foreground tabular-nums sm:col-span-1 sm:text-sm">
                  {entry.votes} {entry.votes === 1 ? "vote" : "votes"}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}

function formatDelta(delta: number) {
  const sign = delta > 0 ? "+" : "−"
  return `${sign}${Math.abs(delta).toFixed(1)}`
}

function RankingsFallback() {
  return (
    <p className="mx-auto max-w-6xl px-5 py-12 text-sm text-muted-foreground md:py-16">
      Counting the ballots.
    </p>
  )
}
