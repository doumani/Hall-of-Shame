import { Suspense } from "react"
import Link from "next/link"
import { io } from "next/cache"
import { BaseballIcon } from "@/components/baseball-icon"
import { getRelatedEntries } from "@/lib/entries"
import { loadAllTimeShameAverages } from "@/lib/shame-averages"
import { getCategory } from "@/lib/taxonomy"
import type { Entry } from "@/lib/types"
import { cn } from "@/lib/utils"

export function RelatedEntries({ entry }: { entry: Entry }) {
  const related = getRelatedEntries(entry)
  if (related.length === 0) return null

  return (
    <Suspense fallback={<RelatedSection entries={related} />}>
      <RelatedWithScores entries={related} />
    </Suspense>
  )
}

async function RelatedWithScores({ entries }: { entries: Entry[] }) {
  await io()
  const averages = await loadAllTimeShameAverages()
  return <RelatedSection entries={entries} averages={averages} />
}

function RelatedSection({
  entries,
  averages,
}: {
  entries: Entry[]
  averages?: Map<string, number>
}) {
  return (
    <section className="mx-auto mt-4 max-w-6xl border-t border-border px-5 pt-12 pb-16 md:pb-20">
      <h2 className="font-serif text-4xl tracking-tight">Related entries</h2>
      <ul
        className={cn(
          "mt-6 grid gap-4 sm:grid-cols-2 sm:gap-5",
          entries.length > 2 && "lg:grid-cols-4",
        )}
      >
        {entries.map((item) => (
          <li key={item.id} className="min-w-0">
            <RelatedCard entry={item} shame={averages?.get(item.id)} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function RelatedCard({ entry, shame }: { entry: Entry; shame?: number }) {
  const category = getCategory(entry.categories[0])

  return (
    <Link
      href={`/entries/${entry.slug}`}
      className="group relative flex h-full flex-col bg-paper px-4 py-4 text-foreground shadow-[0_0_0_1px_rgba(10,22,40,0.1)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-28px_rgba(10,22,40,0.65),0_0_0_1px_#0A1628] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cardinal"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-cardinal transition duration-300 group-hover:scale-x-100"
      />
      <div className="flex items-baseline justify-between gap-3 text-[11px] font-semibold tracking-[0.16em] uppercase">
        <span className="text-cardinal">{category?.label}</span>
        <span className="shrink-0 text-muted-foreground tabular-nums">{entry.year}</span>
      </div>
      <h3 className="mt-2.5 font-serif text-xl leading-tight tracking-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
        {entry.title}
      </h3>
      {typeof shame === "number" ? (
        <p className="mt-3 flex items-center gap-1.5 text-xs tracking-wide text-navy">
          <BaseballIcon filled className="size-3 text-cardinal" />
          <span className="tabular-nums">{shame.toFixed(1)}</span>
          <span className="text-muted-foreground">shame</span>
        </p>
      ) : null}
    </Link>
  )
}
