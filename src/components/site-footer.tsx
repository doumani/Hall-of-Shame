import Link from "next/link"

export function SiteFooter() {
  return (
    <footer className="bg-navy text-cream">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="font-serif text-3xl italic">Hall of Shame</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-cream/75">
            A field catalog of classic major-league blunders. The mistake is
            the subject. The person is not the punch line.
          </p>
        </div>
        <div className="md:col-span-3">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-cream/50 uppercase">
            Index
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/entries" className="hover:underline">
                The Catalog
              </Link>
            </li>
            <li>
              <Link href="/versus" className="hover:underline">
                Which was worse?
              </Link>
            </li>
            <li>
              <Link href="/rankings" className="hover:underline">
                Rankings
              </Link>
            </li>
            <li>
              <Link href="/players" className="hover:underline">
                Players
              </Link>
            </li>
            <li>
              <Link href="/teams" className="hover:underline">
                Teams
              </Link>
            </li>
            <li>
              <Link href="/eras" className="hover:underline">
                Eras
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:underline">
                About the record
              </Link>
            </li>
            <li>
              <Link href="/submit" className="hover:underline">
                Suggest an entry
              </Link>
            </li>
          </ul>
        </div>
        <div className="md:col-span-3">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-cream/50 uppercase">
            Colophon
          </p>
          <p className="mt-4 text-sm leading-relaxed text-cream/75">
            Sequences checked against Retrosheet, the Society for American
            Baseball Research, and contemporary accounts. Where a legend
            outruns the evidence, the entry says so.
          </p>
        </div>
      </div>
      <div className="border-t border-cream/15">
        <p className="mx-auto max-w-6xl px-5 py-4 text-[11px] tracking-[0.14em] text-cream/50 uppercase">
          Compiled for the record · Not an official Major League Baseball publication
        </p>
      </div>
    </footer>
  )
}
