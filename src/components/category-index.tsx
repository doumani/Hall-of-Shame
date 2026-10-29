import Link from "next/link"
import type { Category } from "@/lib/taxonomy"

export function CategoryIndex({
  categories,
}: {
  categories: (Category & { count: number })[]
}) {
  return (
    <ol className="divide-y divide-border border-y border-border">
      {categories.map((category, index) => (
        <li key={category.id}>
          <Link
            href={`/entries?category=${category.id}`}
            className="group grid grid-cols-[auto_1fr_auto] items-baseline gap-4 border-l-2 border-transparent px-1 py-3.5 transition-colors hover:border-cardinal hover:bg-paper md:grid-cols-[4rem_16rem_1fr_auto] md:gap-6 md:px-3 md:py-4"
          >
            <span className="text-[11px] font-semibold tracking-[0.16em] text-cardinal">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-serif text-xl leading-tight group-hover:underline group-hover:underline-offset-4 md:text-2xl">
              {category.label}
            </span>
            <span className="col-span-2 text-sm leading-relaxed text-muted-foreground md:col-span-1">
              {category.description}
            </span>
            <span className="text-sm tabular-nums text-muted-foreground">
              {category.count}
            </span>
          </Link>
        </li>
      ))}
    </ol>
  )
}
