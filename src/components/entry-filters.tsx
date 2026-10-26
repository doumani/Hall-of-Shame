"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import type { Category, Era } from "@/lib/taxonomy"
import { sorts } from "@/lib/taxonomy"
import type { EntryFilters } from "@/lib/types"

const fieldClass =
  "h-11 w-full rounded-sm border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

export function EntryFilters(props: {
  filters: EntryFilters
  categories: Category[]
  eras: Era[]
}) {
  return <FilterControls key={props.filters.q ?? ""} {...props} />
}

function FilterControls({
  filters,
  categories,
  eras,
}: {
  filters: EntryFilters
  categories: Category[]
  eras: Era[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [query, setQuery] = useState(filters.q ?? "")

  function push(next: Partial<EntryFilters>) {
    const merged: EntryFilters = {
      q: query.trim() || undefined,
      category: filters.category,
      era: filters.era,
      sort: filters.sort,
      ...next,
    }
    const params = new URLSearchParams()
    if (merged.q) params.set("q", merged.q)
    if (merged.category) params.set("category", merged.category)
    if (merged.era) params.set("era", merged.era)
    if (merged.sort && merged.sort !== "newest") params.set("sort", merged.sort)
    const search = params.toString()
    router.replace(search ? `${pathname}?${search}` : pathname, { scroll: false })
  }

  const active =
    Boolean(filters.q || filters.category || filters.era) || filters.sort !== "newest"

  return (
    <form
      className="grid gap-3 md:grid-cols-12 md:items-end"
      role="search"
      onSubmit={(event) => {
        event.preventDefault()
        push({ q: query.trim() || undefined })
      }}
    >
      <div className="md:col-span-5">
        <label
          htmlFor="catalog-search"
          className="mb-1.5 block text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase"
        >
          Search
        </label>
        <Input
          id="catalog-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Player, team, year, or play"
          className={fieldClass}
          autoComplete="off"
        />
      </div>
      <div className="md:col-span-3">
        <label
          htmlFor="catalog-category"
          className="mb-1.5 block text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase"
        >
          Category
        </label>
        <select
          id="catalog-category"
          className={fieldClass}
          value={filters.category ?? ""}
          onChange={(event) =>
            push({
              category: (event.target.value || undefined) as EntryFilters["category"],
            })
          }
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <label
          htmlFor="catalog-era"
          className="mb-1.5 block text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase"
        >
          Era
        </label>
        <select
          id="catalog-era"
          className={fieldClass}
          value={filters.era ?? ""}
          onChange={(event) =>
            push({ era: (event.target.value || undefined) as EntryFilters["era"] })
          }
        >
          <option value="">All eras</option>
          {eras.map((era) => (
            <option key={era.id} value={era.id}>
              {era.label}
            </option>
          ))}
        </select>
      </div>
      <div className="md:col-span-2">
        <label
          htmlFor="catalog-sort"
          className="mb-1.5 block text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase"
        >
          Sort
        </label>
        <select
          id="catalog-sort"
          className={fieldClass}
          value={filters.sort}
          onChange={(event) => push({ sort: event.target.value as EntryFilters["sort"] })}
        >
          {sorts.map((sort) => (
            <option key={sort.id} value={sort.id}>
              {sort.label}
            </option>
          ))}
        </select>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border/80 pt-3 md:col-span-12">
        <button type="submit" className="h-10 bg-navy px-4 text-sm text-cream hover:bg-navy/90">
          Search the record
        </button>
        {active ? (
          <button
            type="button"
            className="text-sm text-cardinal underline-offset-4 hover:underline"
            onClick={() => {
              setQuery("")
              router.replace(pathname, { scroll: false })
            }}
          >
            Clear search and filters
          </button>
        ) : (
          <p className="text-sm text-muted-foreground">Press Enter to search.</p>
        )}
      </div>
    </form>
  )
}
