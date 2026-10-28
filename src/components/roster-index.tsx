"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { formatCount } from "@/lib/format"
import type { RosterGroup } from "@/lib/entries"

export function RosterIndex({
  groups,
  hrefBase,
}: {
  groups: RosterGroup[]
  hrefBase: "/players" | "/teams"
}) {
  const shelf = hrefBase === "/players" ? "players" : "teams"
  const [query, setQuery] = useState("")
  const [jump, setJump] = useState<string | null>(null)
  const foldedQuery = fold(query.trim())
  const visible = foldedQuery
    ? groups.filter((group) => fold(group.name).includes(foldedQuery))
    : groups
  const letters = groupByLetter(groups)
  const shown = groupByLetter(visible)

  useEffect(() => {
    if (!jump) return
    const heading = document.getElementById(letterId(shelf, jump))
    if (!heading) return
    heading.focus()
    setJump(null)
  }, [jump, shelf])

  function openLetter(letter: string) {
    setQuery("")
    setJump(letter)
  }

  return (
    <div>
      <form role="search" onSubmit={(event) => event.preventDefault()}>
        <label
          htmlFor={`${shelf}-find`}
          className="mb-1.5 block text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase"
        >
          Find a name
        </label>
        <input
          id={`${shelf}-find`}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={shelf === "players" ? "Player name" : "Team name"}
          autoComplete="off"
          className="h-11 w-full rounded-sm border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
        />
      </form>

      <nav aria-label="Letters" className="mt-4 flex flex-wrap gap-1.5">
        {[...letters.keys()].map((letter) => (
          <button
            key={letter}
            type="button"
            onClick={() => openLetter(letter)}
            className="h-9 min-w-9 border border-border px-2 text-sm font-semibold text-navy hover:bg-paper focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cardinal"
          >
            {letter}
          </button>
        ))}
      </nav>

      {shown.size === 0 ? (
        <div className="mt-8 border border-dashed border-border bg-paper px-6 py-12 text-center" role="status">
          <p className="font-serif text-3xl">Nothing matches that name.</p>
          <button
            type="button"
            className="mt-4 text-sm text-cardinal underline-offset-4 hover:underline"
            onClick={() => setQuery("")}
          >
            Clear the search
          </button>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {[...shown.entries()].map(([letter, items]) => (
            <section key={letter} aria-labelledby={letterId(shelf, letter)}>
              <h2
                id={letterId(shelf, letter)}
                tabIndex={-1}
                className="scroll-mt-44 font-serif text-3xl tracking-tight outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cardinal"
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
                      <span className="text-sm text-muted-foreground tabular-nums">
                        {formatCount(item.entries.length, "entry")}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}

function letterId(shelf: string, letter: string) {
  return `letter-${shelf}-${letter}`
}

function fold(value: string) {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
}

function letterOf(name: string) {
  const folded = name.normalize("NFD").replace(/\p{M}/gu, "")
  const letter = folded[0]?.toUpperCase() ?? "#"
  return /[A-Z]/.test(letter) ? letter : "#"
}

function groupByLetter(groups: RosterGroup[]) {
  const letters = new Map<string, RosterGroup[]>()
  for (const group of groups) {
    const letter = letterOf(group.name)
    const list = letters.get(letter) ?? []
    list.push(group)
    letters.set(letter, list)
  }
  return letters
}
