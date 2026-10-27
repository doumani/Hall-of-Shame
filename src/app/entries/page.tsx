import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { EntryCard } from "@/components/entry-card"
import { EntryFilters } from "@/components/entry-filters"
import { filterEntries, getAllEntries, parseFilters } from "@/lib/entries"
import { loadAllTimeShameAverages } from "@/lib/shame-averages"
import { categories, eras, getCategory, getEra } from "@/lib/taxonomy"

export const metadata: Metadata = {
  title: "The Catalog",
  description:
    "Search and filter classic MLB blunders by player, team, category, era, and date. Results live in the URL, so a shelf of the record can be shared.",
}

type CatalogSearch = {
  q?: string
  category?: string
  era?: string
  sort?: string
}

export default function EntriesPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearch>
}) {
  return (
    <Suspense fallback={<ListingFallback />}>
      <Listing searchParams={searchParams} />
    </Suspense>
  )
}

async function Listing({ searchParams }: { searchParams: Promise<CatalogSearch> }) {
  const filters = parseFilters(await searchParams)
  const shameAverages =
    filters.sort === "shame" ? await loadAllTimeShameAverages() : undefined
  const results = filterEntries(filters, shameAverages)
  const total = getAllEntries().length
  const category = filters.category ? getCategory(filters.category) : undefined
  const era = filters.era ? getEra(filters.era) : undefined

  return (
    <div>
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-5 pt-12 pb-20 md:pt-16 md:pb-24">
          <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-cream/75 uppercase">
            <span className="h-px w-8 bg-cardinal" />
            The Catalog
          </p>
          <h1 className="display mt-4 max-w-3xl text-5xl leading-[0.95] text-cream md:text-7xl">
            Every mistake, in order.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-cream/80">
            Search the shelf. Filters stay in the address bar, so a particular
            argument can be sent to someone else.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 pb-16 md:pb-20">
        <div className="relative z-10 -mt-10 border border-navy/10 bg-paper px-4 py-4 shadow-[0_18px_40px_-32px_rgba(10,22,40,0.8)] md:px-6 md:py-5">
          <EntryFilters filters={filters} categories={categories} eras={eras} />
        </div>

        <div className="mt-8 flex items-center gap-4">
          <p className="text-sm text-muted-foreground" aria-live="polite">
            Showing {results.length} of {total}
            {category ? ` · ${category.label}` : ""}
            {era ? ` · ${era.label}` : ""}
            {filters.q ? ` · “${filters.q}”` : ""}
          </p>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>

        {results.length === 0 ? (
          <div className="mt-8 border border-dashed border-border bg-paper px-6 py-16 text-center">
            <p className="font-serif text-3xl">Nothing on this shelf.</p>
            <p className="mt-3 text-muted-foreground">
              Try a player, a club, or a year, or clear the filters.
            </p>
            <Link href="/entries" className="mt-6 inline-block text-sm text-cardinal underline-offset-4 hover:underline">
              Return to the full catalog
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {results.map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ListingFallback() {
  return (
    <div>
      <div className="bg-navy">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <div className="h-3 w-28 bg-cream/20" />
          <div className="mt-5 h-16 w-2/3 bg-cream/15" />
        </div>
      </div>
      <div className="mx-auto max-w-6xl px-5 pb-16">
        <div className="-mt-8 h-28 border border-border bg-paper" />
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="aspect-[3/4] bg-card shadow-[0_0_0_1px_rgba(10,22,40,0.1)]" />
          ))}
        </div>
      </div>
    </div>
  )
}
