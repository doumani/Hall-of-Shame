import { Suspense } from "react"
import Image from "next/image"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { CategoryIndex } from "@/components/category-index"
import { EntryCard } from "@/components/entry-card"
import { OnThisDay, OnThisDayFallback } from "@/components/on-this-day"
import {
  getAllEntries,
  getCategoryCounts,
  getEntryBySlug,
  homepageGridSlugs,
  homepageLeadSlug,
} from "@/lib/entries"
import { catalogNumber, formatEntryDate } from "@/lib/format"
import { getCategory, getEra } from "@/lib/taxonomy"
import { cn } from "@/lib/utils"

export default function HomePage() {
  const lead = getEntryBySlug(homepageLeadSlug)
  const grid = homepageGridSlugs
    .map((slug) => getEntryBySlug(slug))
    .filter((entry) => entry !== undefined)
  const total = getAllEntries().length

  if (!lead) return null

  const leadCategory = getCategory(lead.categories[0])
  const leadEra = getEra(lead.era)
  const portrait = lead.images[0]

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-cream">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(900px 480px at 88% 18%, rgba(245,240,230,0.08), transparent 55%), radial-gradient(700px 420px at 0% 100%, rgba(142,36,48,0.22), transparent 50%)",
          }}
        />
        <div className="relative mx-auto grid min-w-0 max-w-6xl items-center gap-12 px-5 py-14 md:py-20 lg:grid-cols-12 lg:gap-0 lg:py-24">
          <div className="min-w-0 lg:col-span-7 lg:pr-12">
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.24em] text-cream/75 uppercase">
              <span className="h-px w-8 bg-cardinal" />
              Volume I · {total} entries
            </p>
            <h1 className="display mt-6 max-w-3xl text-[2.7rem] leading-[0.92] text-balance text-cream sm:text-6xl lg:text-[5.35rem]">
              The plays baseball cannot forget.
            </h1>
            <p className="mt-7 max-w-md text-lg leading-relaxed text-cream/80 md:text-xl">
              A museum of classic blunders, told with the box score in one
              hand and the legend in the other.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/entries"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "h-11 bg-cream px-5 text-navy hover:bg-white",
                )}
              >
                Browse the catalog
              </Link>
              <Link
                href="/about"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "h-11 border-cream/30 bg-transparent px-5 text-cream hover:bg-white/10",
                )}
              >
                How the record is kept
              </Link>
            </div>
          </div>
          <div className="min-w-0 lg:col-span-5 lg:border-l lg:border-cream/15 lg:pl-10">
            <Link
              href={`/entries/${lead.slug}`}
              className="group mx-auto block w-full max-w-[380px] bg-cream text-navy shadow-[0_30px_70px_-36px_rgba(0,0,0,0.85)] lg:max-w-none"
            >
              {portrait ? (
                <div className="relative aspect-[3/4] bg-[#102038]">
                  <div className="absolute inset-3 overflow-hidden shadow-[inset_0_0_0_1px_rgba(245,240,230,0.16)]">
                    <Image
                      src={portrait.url}
                      alt={portrait.caption}
                      fill
                      priority
                      sizes="(min-width: 1024px) 380px, 80vw"
                      className="object-contain p-2 transition duration-700 ease-out group-hover:scale-[1.02]"
                    />
                  </div>
                </div>
              ) : null}
              <div className="space-y-3 px-5 py-5">
                <p className="text-[11px] font-semibold tracking-[0.18em] text-cardinal uppercase">
                  No. {catalogNumber(lead.date)} · {leadCategory?.label}
                </p>
                <h2 className="font-serif text-3xl leading-none tracking-tight italic group-hover:underline group-hover:underline-offset-4 md:text-4xl">
                  {lead.title}
                </h2>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {formatEntryDate(lead.date)} · {leadEra?.label}
                </p>
                <p className="text-sm leading-relaxed">{lead.summary}</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <Suspense fallback={<OnThisDayFallback />}>
        <OnThisDay />
      </Suspense>

      <section className="border-b border-border bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-14 md:py-16">
          <div className="mb-8 flex items-end justify-between gap-6 border-b border-border pb-5">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.18em] text-cardinal uppercase">
                From the collection
              </p>
              <h2 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">
                Featured entries
              </h2>
            </div>
            <Link
              href="/entries"
              className="hidden text-sm underline-offset-4 hover:underline sm:inline"
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

      <section className="mx-auto max-w-6xl px-5 py-14 md:py-16">
        <div className="mb-8 max-w-2xl">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-cardinal uppercase">
            Table of contents
          </p>
          <h2 className="mt-2 font-serif text-4xl tracking-tight md:text-5xl">
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
