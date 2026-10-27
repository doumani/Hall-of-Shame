import { Suspense } from "react"
import Link from "next/link"
import { EntryCard } from "@/components/entry-card"
import { TeamShame, TeamShameFallback } from "@/components/team-shame"
import type { RosterGroup } from "@/lib/entries"
import { formatCount } from "@/lib/format"

export function RosterRecord({
  group,
  kind,
}: {
  group: RosterGroup
  kind: "player" | "team"
}) {
  const indexHref = kind === "player" ? "/players" : "/teams"
  const indexLabel = kind === "player" ? "Players" : "Teams"
  const years = group.entries.map((entry) => entry.year)
  const first = Math.min(...years)
  const last = Math.max(...years)
  const span = first === last ? String(first) : `${first}–${last}`

  return (
    <article>
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-cream/70">
            <Link href={indexHref} className="hover:text-cream hover:underline">
              {indexLabel}
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-cream">{group.name}</span>
          </nav>
          <p className="mt-8 flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-cream/75 uppercase">
            <span className="h-px w-8 bg-cardinal" />
            {kind === "player" ? "Player" : "Team"}
          </p>
          <h1 className="display mt-4 max-w-4xl text-5xl leading-[0.95] text-cream md:text-7xl">
            {group.name}
          </h1>
          <p className="mt-5 text-lg text-cream/80">
            {formatCount(group.entries.length, "entry")} · {span}
          </p>
        </div>
      </header>
      {kind === "team" ? (
        <Suspense fallback={<TeamShameFallback />}>
          <TeamShame entries={group.entries} />
        </Suspense>
      ) : null}
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {group.entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>
      </div>
    </article>
  )
}
