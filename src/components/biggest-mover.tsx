import Link from "next/link"
import { io } from "next/cache"
import { getAllEntries } from "@/lib/entries"
import { biggestMover, type MoverSpan } from "@/lib/rankings"
import { loadShameRatings } from "@/lib/shame-averages"

const spanLabel: Record<MoverSpan, string> = {
  "7d": "this week",
  "30d": "this month",
}

function formatMove(delta: number) {
  const sign = delta > 0 ? "+" : "−"
  return `${sign}${Math.abs(delta).toFixed(1)}`
}

export async function BiggestMover() {
  await io()
  const mover = biggestMover(await loadShameRatings(), getAllEntries(), new Date())
  if (!mover || mover.entry.delta === undefined) return null

  return (
    <section className="border-b border-border bg-paper" aria-labelledby="biggest-mover-heading">
      <div className="mx-auto flex max-w-6xl flex-wrap items-baseline justify-between gap-x-8 gap-y-2 px-5 py-5">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
          <h2
            id="biggest-mover-heading"
            className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-cardinal uppercase"
          >
            <span aria-hidden="true" className="h-px w-6 bg-cardinal" />
            Biggest mover
          </h2>
          <Link
            href={`/entries/${mover.entry.slug}`}
            className="font-serif text-xl leading-tight tracking-tight underline-offset-4 hover:underline"
          >
            {mover.entry.title}
          </Link>
          <p className="text-sm text-cardinal tabular-nums">
            {formatMove(mover.entry.delta)} {spanLabel[mover.span]}
          </p>
        </div>
        <Link href="/rankings#movers" className="text-sm underline-offset-4 hover:underline">
          Rankings
        </Link>
      </div>
    </section>
  )
}

export function BiggestMoverFallback() {
  return (
    <section className="border-b border-border bg-paper" aria-hidden="true">
      <div className="mx-auto max-w-6xl px-5 py-5">
        <div className="h-5 w-64 bg-muted/70" />
      </div>
    </section>
  )
}
