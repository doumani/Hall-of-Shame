import Link from "next/link"
import type { RosterGroup } from "@/lib/entries"

export function RosterIndex({
  groups,
  hrefBase,
}: {
  groups: RosterGroup[]
  hrefBase: "/players" | "/teams"
}) {
  const letters = new Map<string, RosterGroup[]>()

  for (const group of groups) {
    const letter = group.name[0]?.toUpperCase() ?? "#"
    const list = letters.get(letter) ?? []
    list.push(group)
    letters.set(letter, list)
  }

  return (
    <div className="space-y-10">
      {[...letters.entries()].map(([letter, items]) => (
        <section key={letter} aria-labelledby={`letter-${hrefBase}-${letter}`}>
          <h2
            id={`letter-${hrefBase}-${letter}`}
            className="font-serif text-3xl tracking-tight"
          >
            {letter}
          </h2>
          <ul className="mt-3 divide-y divide-border border-y border-border">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  href={`${hrefBase}/${item.id}`}
                  className="group flex items-baseline justify-between gap-6 px-1 py-3.5 transition-colors hover:bg-paper md:px-3"
                >
                  <span className="font-serif text-2xl leading-tight group-hover:underline group-hover:underline-offset-4">
                    {item.name}
                  </span>
                  <span className="text-sm tabular-nums text-muted-foreground">
                    {item.entries.length}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
