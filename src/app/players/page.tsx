import type { Metadata } from "next"
import { RosterIndex } from "@/components/roster-index"
import { getPlayers } from "@/lib/entries"
import { formatCount } from "@/lib/format"

export const metadata: Metadata = {
  title: "Players",
  description: "Every player named in the Hall of Shame, listed alphabetically.",
}

export default function PlayersPage() {
  const players = getPlayers()

  return (
    <div>
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-cream/75 uppercase">
            <span className="h-px w-8 bg-cardinal" />
            The index
          </p>
          <h1 className="display mt-4 text-5xl leading-[0.95] text-cream md:text-7xl">Players</h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream/80">
            {formatCount(players.length, "name")} in the catalog.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <RosterIndex groups={players} hrefBase="/players" />
      </div>
    </div>
  )
}
