"use client"

import { Suspense, useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

const links = [
  { href: "/entries", label: "The Catalog" },
  { href: "/versus", label: "Versus" },
  { href: "/rankings", label: "Rankings" },
  { href: "/players", label: "Players" },
  { href: "/teams", label: "Teams" },
  { href: "/eras", label: "Eras" },
  { href: "/about", label: "About" },
  { href: "/submit", label: "Suggest" },
]

export function SiteHeader({ slugs }: { slugs: string[] }) {
  const pathname = usePathname()
  const router = useRouter()

  function openRandomEntry() {
    if (slugs.length === 0) return
    const current = pathname.match(/^\/entries\/([^/]+)/)?.[1]
    const here = current ? decodeURIComponent(current) : undefined
    const pool = here ? slugs.filter((slug) => slug !== here) : slugs
    const choices = pool.length > 0 ? pool : slugs
    const slug = choices[Math.floor(Math.random() * choices.length)]
    router.push(`/entries/${slug}`)
  }

  return (
    <header className="sticky top-0 z-40 border-b border-cardinal bg-cream/95 backdrop-blur-md">
      <div className="bg-navy text-cream">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-2 text-[11px] font-semibold tracking-[0.2em] uppercase">
          <span>The Record</span>
          <span className="hidden lg:inline">Major League Baseball</span>
          <span className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={openRandomEntry}
              className="tracking-[0.16em] text-cream underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream"
            >
              Random entry
            </button>
            <span className="hidden sm:inline">Vol. I</span>
          </span>
        </div>
      </div>
      <div className="mx-auto max-w-6xl">
      <div className="flex items-end justify-between gap-6 px-5 pt-4 md:pt-5">
        <Link href="/" className="group min-w-0">
          <span className="block font-serif text-3xl leading-none tracking-tight italic md:text-4xl">
            Hall of Shame
          </span>
          <span className="mt-1 block text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            A catalog of baseball&apos;s lasting mistakes
          </span>
        </Link>
        <nav className="hidden items-center gap-x-3.5 gap-y-1 md:flex lg:gap-x-5 xl:gap-x-7" aria-label="Primary">
          {links.map((link) => {
            const current = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={current ? "page" : undefined}
                className={cn(
                  "text-sm tracking-wide underline-offset-4 hover:underline",
                  current && "underline decoration-cardinal decoration-2",
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger
              render={<Button variant="outline" size="icon" aria-label="Open menu" className="bg-card" />}
            >
              <Menu />
            </SheetTrigger>
            <SheetContent side="right" className="bg-cream">
              <SheetHeader>
                <SheetTitle className="font-serif text-2xl italic">Hall of Shame</SheetTitle>
                <SheetDescription>The catalog and the method.</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-4 px-4" aria-label="Mobile">
                {links.map((link) => (
                  <SheetClose
                    key={link.href}
                    render={
                      <Link
                        href={link.href}
                        className="font-serif text-3xl italic"
                      />
                    }
                  >
                    {link.label}
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <Suspense fallback={<HeaderSearchFallback />}>
        <HeaderSearch />
      </Suspense>
      </div>
    </header>
  )
}

function HeaderSearch() {
  const pathname = usePathname()
  const params = useSearchParams()
  const router = useRouter()
  const query = params.get("q") ?? ""
  const [value, setValue] = useState(query)

  useEffect(() => {
    setValue(query)
  }, [query])

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const next = value.trim()
    const search = new URLSearchParams(pathname === "/entries" ? params.toString() : "")
    if (next) search.set("q", next)
    else search.delete("q")
    const href = search.size > 0 ? `/entries?${search.toString()}` : "/entries"
    router.push(href)
  }

  return (
    <form role="search" onSubmit={submit} className="mx-auto flex max-w-6xl items-center gap-2 px-5 pb-3">
      <label htmlFor="header-search" className="sr-only">
        Search the catalog
      </label>
      <input
        id="header-search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Player, team, year, or play"
        autoComplete="off"
        className="h-10 min-w-0 flex-1 rounded-sm border border-navy/15 bg-card px-3 text-sm text-navy outline-none placeholder:text-navy/45 focus-visible:border-navy focus-visible:ring-2 focus-visible:ring-navy/20"
      />
      <button type="submit" className="h-10 shrink-0 bg-navy px-3 text-sm text-cream hover:bg-navy/90">
        Search
      </button>
    </form>
  )
}

function HeaderSearchFallback() {
  return (
    <div className="mx-auto flex max-w-6xl items-center gap-2 px-5 pb-3" aria-hidden="true">
      <div className="h-10 min-w-0 flex-1 rounded-sm border border-navy/15 bg-card" />
      <div className="h-10 w-16 bg-navy/80" />
    </div>
  )
}
