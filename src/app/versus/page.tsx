import type { Metadata } from "next"
import { VersusMatch } from "@/components/versus-match"
import { getAllEntries } from "@/lib/entries"
import { getCategory } from "@/lib/taxonomy"

export const metadata: Metadata = {
  title: "Which was worse?",
  description:
    "Two entries from the record. Choose the one that was worse. The ballot is anonymous.",
}

export default function VersusPage() {
  const entries = getAllEntries().map((entry) => {
    const image = entry.images[0]
    return {
      id: entry.id,
      slug: entry.slug,
      title: entry.title,
      year: entry.year,
      category: getCategory(entry.categories[0])?.label ?? "Entry",
      summary: entry.summary,
      image: image ? { url: image.url, alt: image.caption } : null,
    }
  })

  return (
    <div>
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-cream/75 uppercase">
            <span className="h-px w-8 bg-cardinal" />
            A head-to-head ballot
          </p>
          <h1 className="display mt-4 max-w-3xl text-5xl leading-[0.95] text-cream md:text-7xl">
            Which was worse?
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/80 md:text-lg">
            Two entries from the record. Choose the one that was worse. The
            ballot is anonymous, and it stays.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <VersusMatch entries={entries} />
      </div>
    </div>
  )
}
