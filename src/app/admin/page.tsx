import { Suspense } from "react"
import type { Metadata } from "next"
import Link from "next/link"
import { io } from "next/cache"
import { logout, reviewSubmission } from "@/app/admin/actions"
import { PasswordForm } from "@/app/admin/password-form"
import { isAdmin } from "@/lib/admin-auth"
import {
  adminConfigured,
  loadSubmissions,
  parseReviewStatus,
  reviewHref,
  submissionStatuses,
  type SubmissionStatus,
} from "@/lib/admin-submissions"

export const metadata: Metadata = {
  title: "Review",
  robots: { index: false, follow: false },
}

const tabLabels: Record<SubmissionStatus, string> = {
  pending: "Pending",
  approved: "Approved",
  rejected: "Rejected",
  completed: "Completed",
}

const headings: Record<SubmissionStatus, string> = {
  pending: "Pending notes",
  approved: "Approved notes",
  rejected: "Rejected notes",
  completed: "Completed notes",
}

const emptyCopy: Record<SubmissionStatus, string> = {
  pending: "No notes are waiting.",
  approved: "Nothing has been approved.",
  rejected: "Nothing has been rejected.",
  completed: "Nothing is complete.",
}

export default function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>
}) {
  return (
    <Suspense fallback={<AdminFallback />}>
      <Admin searchParams={searchParams} />
    </Suspense>
  )
}

async function Admin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; status?: string }>
}) {
  await io()
  const authed = await isAdmin()
  const params = await searchParams
  const status = parseReviewStatus(params.status)

  return (
    <div>
      <header className="bg-navy text-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-4 px-5 py-10">
          <div>
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.22em] text-cream/75 uppercase">
              <span className="h-px w-8 bg-cardinal" />
              Review
            </p>
            <h1 className="mt-4 font-serif text-4xl tracking-tight md:text-5xl">
              {authed ? headings[status] : "Pending notes"}
            </h1>
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
        {authed ? <Queue status={status} failed={params.error === "update"} /> : <PasswordForm />}
      </div>
    </div>
  )
}

async function Queue({ status, failed }: { status: SubmissionStatus; failed: boolean }) {
  if (!adminConfigured()) {
    return (
      <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
        The password is accepted, but the list needs SUPABASE_SERVICE_ROLE_KEY on the server.
        The public key cannot read or update submissions.
      </p>
    )
  }

  const { rows, error } = await loadSubmissions(status)

  return (
    <div>
      <StatusTabs current={status} />
      {failed ? (
        <p className="mb-6 text-sm text-cardinal" role="alert">
          The status could not be updated.
        </p>
      ) : null}
      {error ? (
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
          This list could not be loaded.
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyCopy[status]}</p>
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
              <RowActions id={row.id} status={status} />
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

function StatusTabs({ current }: { current: SubmissionStatus }) {
  return (
    <nav aria-label="Status" className="mb-8 flex flex-wrap gap-2">
      {submissionStatuses.map((status) => {
        const active = status === current
        return (
          <Link
            key={status}
            href={reviewHref(status)}
            aria-current={active ? "page" : undefined}
            className={
              active
                ? "inline-flex h-10 items-center bg-navy px-4 text-sm text-cream"
                : "inline-flex h-10 items-center border border-border bg-card px-4 text-sm text-foreground"
            }
          >
            {tabLabels[status]}
          </Link>
        )
      })}
    </nav>
  )
}

function RowActions({ id, status }: { id: string; status: SubmissionStatus }) {
  if (status === "completed") {
    return <p className="mt-5 text-sm text-muted-foreground">This note is complete.</p>
  }

  return (
    <div className="mt-5 flex flex-wrap gap-3">
      {status === "pending" ? (
        <>
          <StatusButton id={id} from="pending" to="approved" label="Approve" tone="primary" />
          <StatusButton id={id} from="pending" to="rejected" label="Reject" tone="danger" />
        </>
      ) : null}
      {status === "approved" ? (
        <>
          <StatusButton id={id} from="approved" to="completed" label="Mark complete" tone="primary" />
          <StatusButton id={id} from="approved" to="pending" label="Return to pending" tone="quiet" />
        </>
      ) : null}
      {status === "rejected" ? (
        <StatusButton id={id} from="rejected" to="pending" label="Return to pending" tone="quiet" />
      ) : null}
    </div>
  )
}

function StatusButton({
  id,
  from,
  to,
  label,
  tone,
}: {
  id: string
  from: SubmissionStatus
  to: SubmissionStatus
  label: string
  tone: "primary" | "danger" | "quiet"
}) {
  const className =
    tone === "primary"
      ? "h-10 bg-navy px-4 text-sm text-cream"
      : tone === "danger"
        ? "h-10 border border-border bg-card px-4 text-sm text-cardinal"
        : "h-10 border border-border bg-card px-4 text-sm text-foreground"

  return (
    <form action={reviewSubmission}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="from" value={from} />
      <input type="hidden" name="status" value={to} />
      <button type="submit" className={className}>
        {label}
      </button>
    </form>
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
