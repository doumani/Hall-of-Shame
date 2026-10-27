import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { EntryCard } from "@/components/entry-card"
import { getExhibition } from "@/lib/exhibitions"
import { eras } from "@/lib/taxonomy"
import { formatCount } from "@/lib/format"

type Props = { params: Promise<{ id: string }> }

export const instant = false

export function generateStaticParams() {
  return eras.map((era) => ({ id: era.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const exhibition = getExhibition(id)
  if (!exhibition) return { title: "Not in the catalog" }

  const description = exhibition.introduction[0]

  return {
    title: exhibition.era.label,
    description,
    openGraph: { title: exhibition.era.label, description },
  }
}

export default async function EraExhibitionPage({ params }: Props) {
  const { id } = await params
  const exhibition = getExhibition(id)
  if (!exhibition) notFound()

  const { era, introduction, entries, total, previous, next } = exhibition

  return (
    <article>
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <nav aria-label="Breadcrumb" className="text-sm text-cream/70">
            <Link href="/eras" className="hover:text-cream hover:underline">
              Eras
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-cream">{era.label}</span>
          </nav>
          <p className="mt-8 flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-cream/75 uppercase">
            <span className="h-px w-8 bg-cardinal" />
            {era.years}
          </p>
          <h1 className="display mt-4 max-w-4xl text-5xl leading-[0.95] text-cream md:text-7xl">
            {era.label}
          </h1>
          <div className="mt-6 max-w-2xl space-y-4 text-base leading-relaxed text-cream/80 md:text-lg">
            {introduction.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-navy pb-4">
          <h2 className="flex items-center gap-3 font-serif text-3xl tracking-tight text-navy">
            <span aria-hidden="true" className="h-px w-6 bg-cardinal" />
            In this chapter
          </h2>
          <Link
            href={`/entries?era=${era.id}`}
            className="text-sm text-muted-foreground underline-offset-4 hover:text-navy hover:underline"
          >
            All {formatCount(total, "entry")}
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} />
          ))}
        </div>

        <nav
          aria-label="Chapters"
          className="mt-14 grid gap-6 border-t border-border pt-6 sm:grid-cols-2"
        >
          {previous ? (
            <Link href={`/eras/${previous.id}`} className="group">
              <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Previous
              </span>
              <span className="mt-1 block font-serif text-2xl tracking-tight group-hover:underline group-hover:underline-offset-4">
                {previous.label}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/eras/${next.id}`} className="group sm:text-right">
              <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
                Next
              </span>
              <span className="mt-1 block font-serif text-2xl tracking-tight group-hover:underline group-hover:underline-offset-4">
                {next.label}
              </span>
            </Link>
          ) : null}
        </nav>
      </div>
    </article>
  )
}
