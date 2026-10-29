import { Suspense } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CategoryIndex } from "@/components/category-index"
import { EntryCard } from "@/components/entry-card"
import { HeroCard, HeroCardFallback } from "@/components/hero-card"
import { OnThisDay, OnThisDayFallback } from "@/components/on-this-day"
import {
  getAllEntries,
  getCategoryCounts,
  getEntryBySlug,
  getEraCounts,
  homepageGridSlugs,
} from "@/lib/entries"

export default function HomePage() {
  const grid = homepageGridSlugs
    .map((slug) => getEntryBySlug(slug))
    .filter((entry) => entry !== undefined)
  const total = getAllEntries().length

  return (
    <>
      <section className="bg-navy text-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-2 lg:gap-14 lg:py-16">
          <div className="min-w-0 max-w-xl">
            <span aria-hidden="true" className="block h-px w-10 bg-cardinal" />
            <p className="mt-4 text-[11px] font-semibold tracking-[0.2em] text-cream/75 uppercase">
              An archive of baseball&apos;s infamous moments
            </p>
            <h1 className="display mt-4 text-5xl leading-[0.92] text-cream sm:text-6xl lg:text-[4.5rem]">
              Hall of Shame
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-cream/80 sm:text-lg">
              A living archive of baseball&apos;s most infamous moments, players, and
              blunders. Preserving the plays history tried to forget.
            </p>
            <Link
              href="/entries"
              className="mt-8 inline-flex items-center gap-2.5 bg-cardinal px-5 py-3 text-[12px] font-semibold tracking-[0.16em] text-cream uppercase transition-colors hover:bg-[#751e29] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream"
            >
              Explore the archive
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
          <Suspense fallback={<HeroCardFallback />}>
            <HeroCard />
          </Suspense>
        </div>
      </section>

      <Suspense fallback={<OnThisDayFallback />}>
        <OnThisDay />
      </Suspense>

      <section className="border-b border-border/80 bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-14">
          <div className="mb-7 flex items-end justify-between gap-6 border-b border-border/80 pb-4">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-cardinal uppercase">
                From the collection
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight md:text-4xl">
                Featured entries
              </h2>
            </div>
            <Link
              href="/entries"
              className="hidden text-sm tracking-wide text-navy/80 underline-offset-4 hover:text-cardinal hover:underline sm:inline"
            >
              All {total} entries
            </Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {grid.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
          <Link
            href="/entries"
            className="mt-8 inline-block text-sm underline-offset-4 hover:underline sm:hidden"
          >
            All {total} entries
          </Link>
        </div>
      </section>

      <section className="border-b border-border/80">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-14">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="text-[11px] font-semibold tracking-[0.18em] text-cardinal uppercase">
                Chapters
              </p>
              <h2 className="mt-2 font-serif text-3xl tracking-tight md:text-4xl">
                Seven eras
              </h2>
            </div>
            <Link
              href="/eras"
              className="text-sm tracking-wide text-navy/80 underline-offset-4 hover:text-cardinal hover:underline"
            >
              Open the chapters
            </Link>
          </div>
          <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {getEraCounts().map((era) => (
              <li key={era.id}>
                <Link
                  href={`/eras/${era.id}`}
                  className="block h-full border border-border bg-paper/50 px-4 py-5 transition-colors hover:border-navy/20 hover:bg-paper"
                >
                  <span className="text-[11px] font-semibold tracking-[0.16em] text-cardinal uppercase">
                    {era.years}
                  </span>
                  <span className="mt-2 block font-serif text-2xl tracking-tight">{era.label}</span>
                  <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">
                    {era.description}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 md:py-14">
        <div className="mb-7 max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-cardinal uppercase">
            Table of contents
          </p>
          <h2 className="mt-2 font-serif text-3xl tracking-tight md:text-4xl">
            Eleven ways to get it wrong
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Every entry wears at least one of these labels. Some wear two,
            because a missed base can also be a rule, and a crowd can also be
            an umpire&apos;s problem.
          </p>
        </div>
        <CategoryIndex categories={getCategoryCounts()} />
      </section>
    </>
  )
}
