import type { Metadata } from "next"
import Link from "next/link"
import { categories, eras } from "@/lib/taxonomy"
import { getAllEntries, getCategoryCounts, getEraCounts } from "@/lib/entries"

export const metadata: Metadata = {
  title: "About",
  description:
    "How the Hall of Shame chooses an entry, what it leaves out, and how the catalog is organized.",
}

export default function AboutPage() {
  const total = getAllEntries().length
  const eraCounts = getEraCounts()
  const categoryCounts = getCategoryCounts()

  return (
    <div>
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-cream/75 uppercase">
            <span className="h-px w-8 bg-cardinal" />
            About the record
          </p>
          <h1 className="display mt-4 max-w-3xl text-5xl leading-[0.95] text-cream md:text-7xl">
            A museum, not a roast.
          </h1>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
      <div className="max-w-3xl">
        <div className="story">
          <p>
            The Hall of Shame is a catalog of {total} classic major-league
            blunders: the missed base, the uncovered plate, the trade that
            only looks obvious afterward, the promotion that ended in a
            forfeit. The tone is editorial. The standard is the box score.
          </p>
          <p>
            An entry starts with what happened, then with what the retelling
            added. Fred Snodgrass dropped a fly and, in the same inning, made
            a difficult catch. Bill Buckner&apos;s error came after the Red Sox
            had already lost the lead. Don Denkinger missed a call, and the
            Cardinals then missed a popup, a pitch, and the next day. Where a
            nickname outruns the evidence — the &quot;$30,000 muff,&quot; the
            1908 version of Germany Schaefer stealing first, a soaked glove in
            a Chicago dugout — the entry says so.
          </p>
          <p>
            Some famous shame is not in this volume on purpose. Ray
            Chapman&apos;s death is a tragedy, not a blooper. Donnie Moore&apos;s
            1986 pitch is bound up with a suicide, and reducing a life to one
            slider would be a second cruelty. On-field assaults are left out.
            The Black Sox scandal was a crime. Those subjects deserve a
            different room.
          </p>
          <p>
            The catalog is a local JSON file, with stable ids on every entry,
            player, and team, so it can move later to a database without
            renaming the public record. A player page or a team page gathers
            the entries that already name that id. A suggestion, a
            correction, or a public-domain image can be offered on the{" "}
            <Link href="/submit" className="underline">
              suggestion page
            </Link>
            . Notes are saved for review and are not published on their own.
          </p>
        </div>
      </div>

      <section className="mt-16">
        <h2 className="font-serif text-3xl">Eras</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Each era is a short chapter, not a round decade. A sale announced
          in January 1920 belongs with the live-ball years. The full shelf
          for any era is still in the catalog.
        </p>
        <ul className="mt-6 divide-y divide-border border-y border-border">
          {eras.map((era) => {
            const count = eraCounts.find((item) => item.id === era.id)?.count ?? 0
            return (
              <li key={era.id} className="grid gap-2 py-4 md:grid-cols-[14rem_8rem_1fr] md:items-baseline">
                <Link
                  href={`/eras/${era.id}`}
                  className="font-serif text-2xl hover:underline hover:underline-offset-4"
                >
                  {era.label}
                </Link>
                <span className="text-sm text-muted-foreground">
                  {era.years} · {count}
                </span>
                <span className="text-sm leading-relaxed text-muted-foreground">
                  {era.description}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-serif text-3xl">Categories</h2>
        <ul className="mt-6 space-y-3">
          {categories.map((category) => {
            const count = categoryCounts.find((item) => item.id === category.id)?.count ?? 0
            return (
              <li key={category.id}>
                <Link href={`/entries?category=${category.id}`} className="hover:underline">
                  {category.label}
                </Link>
                <span className="text-muted-foreground"> · {count}</span>
                <span className="mt-1 block text-sm text-muted-foreground">
                  {category.description}
                </span>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="mt-16 max-w-3xl">
        <h2 className="font-serif text-3xl">Sources</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">
          Play-by-play comes first from Retrosheet and Baseball-Reference.
          Narrative corrections come from the Society for American Baseball
          Research, the National Baseball Hall of Fame, and reporting in the
          daily papers of the day. Photographs in this volume are public-domain
          images, credited on the entry, or the entry stands without one.
          Film slots exist in the data model and stay empty until a clip can
          be embedded without pretending a rights-holder&apos;s broadcast is free.
        </p>
      </section>
      </div>
    </div>
  )
}
