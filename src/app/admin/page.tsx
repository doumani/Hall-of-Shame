import { Suspense } from "react"
import type { Metadata } from "next"
import { io } from "next/cache"
import { logout, reviewSubmission } from "@/app/admin/actions"
import { PasswordForm } from "@/app/admin/password-form"
import { isAdmin } from "@/lib/admin-auth"
import { adminConfigured, loadPendingSubmissions } from "@/lib/admin-submissions"

export const metadata: Metadata = {
  title: "Review",
  robots: { index: false, follow: false },
}

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Admin searchParams={searchParams} />
    </Suspense>
  )
}

async function Admin({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  await io()
  const authed = await isAdmin()
  const { error } = await searchParams

  return (
    <div>
      <header className="bg-navy text-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-5 py-10">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-cream/75 uppercase">
              <span className="h-px w-8 bg-cardinal" />
              Review
            </p>
            <h1 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">Pending notes</h1>
          </div>
          {authed ? (
            <form action={logout}>
              <button type="submit" className="text-sm text-cream/80 underline-offset-4 hover:underline">
                Lock
              </button>
            </form>
          ) : null}
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-10">
        {authed ? <Queue failed={error === "update"} /> : <PasswordForm />}
      </div>
    </div>
  )
}

async function Queue({ failed }: { failed: boolean }) {
  if (!adminConfigured()) {
    return (
      <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
        The password is accepted, but the list needs SUPABASE_SERVICE_ROLE_KEY on the server.
        The public key cannot read or update submissions.
      </p>
    )
  }

  const { rows, error } = await loadPendingSubmissions()

  return (
    <div>
      {failed ? (
        <p className="mb-6 text-sm text-cardinal" role="alert">
          The status could not be updated.
        </p>
      ) : null}
      {error ? (
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          The pending list could not be loaded.
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No notes are waiting.</p>
      ) : (
        <ol className="grid gap-6">
          {rows.map((row) => (
            <li key={row.id} className="border border-border bg-card px-5 py-5 md:px-6">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="font-serif text-2xl tracking-tight">{row.title || "Untitled"}</h2>
                <time className="text-sm text-muted-foreground tabular-nums" dateTime={row.created_at}>
                  {formatWhen(row.created_at)}
                </time>
              </div>
              <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                <Field term="Year" value={row.year} />
                <Field term="Teams" value={row.teams} />
                <Field term="Name" value={row.name} />
                <Field term="Email" value={row.email} />
                <Field term="Description" value={row.description} wide />
                <Field term="Why it belongs" value={row.why_it_belongs} wide />
                <Field term="Notes" value={row.notes} wide />
              </dl>
              <div className="mt-5 flex flex-wrap gap-3">
                <form action={reviewSubmission}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="status" value="approved" />
                  <button type="submit" className="h-10 bg-navy px-4 text-sm text-cream">
                    Approve
                  </button>
                </form>
                <form action={reviewSubmission}>
                  <input type="hidden" name="id" value={row.id} />
                  <input type="hidden" name="status" value="rejected" />
                  <button
                    type="submit"
                    className="h-10 border border-border bg-card px-4 text-sm text-cardinal"
                  >
                    Reject
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function Field({
  term,
  value,
  wide = false,
}: {
  term: string
  value: string | null
  wide?: boolean
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        {term}
      </dt>
      <dd className="mt-1 leading-relaxed whitespace-pre-wrap">{value?.trim() || "—"}</dd>
    </div>
  )
}

function formatWhen(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "America/New_York",
  }).format(date)
}

function AdminFallback() {
  return (
    <div className="bg-navy">
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="h-3 w-24 bg-cream/20" />
        <div className="mt-5 h-12 w-64 bg-cream/15" />
      </div>
    </div>
  )
}
