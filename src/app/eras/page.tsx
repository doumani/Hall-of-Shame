import type { Metadata } from "next"
import Link from "next/link"
import { getEraCounts } from "@/lib/entries"
import { formatCount } from "@/lib/format"

export const instant = false

export const metadata: Metadata = {
  title: "Eras",
  description:
    "Seven chapters of the Hall of Shame, from the dead-ball years to the present, each with a short introduction and a selection of notable entries.",
}

export default function ErasPage() {
  const eras = getEraCounts()

  return (
    <div>
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
          <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-cream/75 uppercase">
            <span className="h-px w-8 bg-cardinal" />
            The chapters
          </p>
          <h1 className="display mt-4 max-w-3xl text-5xl leading-[0.95] text-cream md:text-7xl">
            Eras
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-cream/80 md:text-lg">
            The catalog is also a set of rooms. Each era keeps a short
            introduction and a handful of the entries that named it. The rest
            of the shelf is still in the catalog.
          </p>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-12 md:py-16">
        <ol className="divide-y divide-border border-y border-border">
          {eras.map((era, index) => (
            <li key={era.id}>
              <Link
                href={`/eras/${era.id}`}
                className="grid gap-2 py-6 hover:bg-paper md:grid-cols-[4rem_11rem_minmax(0,1fr)] md:items-baseline md:gap-6 md:px-2"
              >
                <span className="text-xs text-muted-foreground tabular-nums">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-semibold text-cardinal tabular-nums">
                  {era.years}
                </span>
                <span>
                  <span className="block font-serif text-3xl tracking-tight text-navy">
                    {era.label}
                  </span>
                  <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {era.description} {formatCount(era.count, "entry")} in the catalog.
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
