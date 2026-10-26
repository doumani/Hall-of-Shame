import Link from "next/link"

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-24">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-cardinal uppercase">
        Not in the catalog
      </p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">This entry is not on the shelf.</h1>
      <p className="mt-4 text-lg text-muted-foreground">
        The address does not match a record in this volume.
      </p>
      <Link href="/entries" className="mt-8 inline-block text-cardinal underline-offset-4 hover:underline">
        Return to the catalog
      </Link>
    </div>
  )
}
