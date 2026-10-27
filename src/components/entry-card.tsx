import Image from "next/image"
import Link from "next/link"
import { ShameBadge } from "@/components/shame-badge"
import { catalogNumber, formatEntryDate } from "@/lib/format"
import { getCategory } from "@/lib/taxonomy"
import type { Entry } from "@/lib/types"
import { cn } from "@/lib/utils"

export function EntryCard({
  entry,
  className,
}: {
  entry: Entry
  className?: string
}) {
  const category = getCategory(entry.categories[0])
  const image = entry.images[0]
  const filed = formatEntryDate(entry.date).replace(`, ${entry.year}`, "")

  return (
    <Link
      href={`/entries/${entry.slug}`}
      className={cn(
        "group relative flex h-full flex-col bg-paper text-foreground shadow-[0_0_0_1px_rgba(10,22,40,0.1)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_44px_-28px_rgba(10,22,40,0.65),0_0_0_1px_#0A1628] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cardinal",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left scale-x-0 bg-cardinal transition duration-300 group-hover:scale-x-100"
      />
      <div className="relative aspect-[5/4] overflow-hidden bg-[#07111e]">
        {image ? (
          <>
            <Image
              src={image.url}
              alt={image.caption}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover object-center transition duration-700 ease-out group-hover:scale-[1.04]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-3 border border-cream/30"
            />
          </>
        ) : (
          <YearPlate year={entry.year} filed={filed} number={catalogNumber(entry.date)} />
        )}
      </div>
      <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
        <div className="flex items-baseline justify-between gap-3 text-[11px] font-semibold tracking-[0.16em] uppercase">
          <span className="text-cardinal">{category?.label}</span>
          <span className="text-muted-foreground tabular-nums">{entry.year}</span>
        </div>
        <h3 className="mt-2.5 font-serif text-[1.55rem] leading-[1.12] tracking-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
          {entry.title}
        </h3>
        <p className="mt-2.5 line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {entry.summary}
        </p>
        <ShameBadge entryId={entry.id} />
        <p className="mt-4 border-t border-border/80 pt-3 text-xs tracking-wide text-foreground/75">
          {entry.teams.map((team) => team.name).join(" · ")}
        </p>
      </div>
    </Link>
  )
}

function YearPlate({
  year,
  filed,
  number,
}: {
  year: number
  filed: string
  number: string
}) {
  return (
    <div className="relative flex h-full flex-col justify-between px-6 py-5 text-cream">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: [
            "radial-gradient(80% 60% at 100% 0%, rgba(142,36,48,0.34), transparent 52%)",
            "linear-gradient(180deg, rgba(245,240,230,0.07), transparent 34%)",
            "repeating-linear-gradient(180deg, transparent, transparent 10px, rgba(245,240,230,0.045) 11px)",
          ].join(", "),
        }}
      />
      <div aria-hidden="true" className="pointer-events-none absolute inset-3 border border-cream/15" />
      <span aria-hidden="true" className="pointer-events-none absolute top-3 left-3 size-2.5 border-t border-l border-cardinal" />
      <span aria-hidden="true" className="pointer-events-none absolute top-3 right-3 size-2.5 border-t border-r border-cream/35" />
      <span aria-hidden="true" className="pointer-events-none absolute bottom-3 left-3 size-2.5 border-b border-l border-cream/35" />
      <span aria-hidden="true" className="pointer-events-none absolute right-3 bottom-3 size-2.5 border-r border-b border-cardinal" />
      <p className="relative text-[10px] font-semibold tracking-[0.22em] text-cream/70 uppercase">
        No. {number}
      </p>
      <div className="relative">
        <p className="font-serif text-[clamp(3.4rem,4.6vw,4.6rem)] leading-[0.8] tracking-[-0.045em] text-cream">
          {year}
        </p>
        <div className="mt-3 flex items-center gap-3">
          <span className="h-px w-8 bg-cardinal transition-all duration-300 group-hover:w-14" />
          <span className="text-[11px] tracking-[0.14em] text-cream/80 uppercase">{filed}</span>
        </div>
      </div>
    </div>
  )
}
