"use client"

import { useState } from "react"
import { useShameClient } from "@/components/shame-client"

const fieldClass =
  "w-full rounded-sm border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

const inputClass = `${fieldClass} h-11`
const areaClass = `${fieldClass} min-h-28 py-3 leading-relaxed`

function fieldValue(form: FormData, name: string) {
  const value = String(form.get(name) ?? "").trim()
  return value.length > 0 ? value : null
}

export function SubmitForm() {
  const client = useShameClient()
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [failed, setFailed] = useState(false)

  if (sent) {
    return (
      <div
        className="border border-border bg-card px-6 py-10 md:px-10"
        role="status"
        aria-live="polite"
      >
        <p className="text-[11px] font-semibold tracking-[0.18em] text-cardinal uppercase">
          Received
        </p>
        <h2 className="mt-3 font-serif text-3xl leading-tight">
          Received. We&apos;ll review it.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          The note is saved for review. It is not added to the catalog on its own.
        </p>
        <button
          type="button"
          className="mt-8 h-11 bg-navy px-5 text-sm text-cream"
          onClick={() => setSent(false)}
        >
          Write another note
        </button>
      </div>
    )
  }

  return (
    <form
      className="border border-border bg-card px-6 py-8 md:px-10 md:py-10"
      onSubmit={async (event) => {
        event.preventDefault()
        if (sending) return
        setFailed(false)

        if (!client) {
          setFailed(true)
          return
        }

        const form = new FormData(event.currentTarget)
        const description = fieldValue(form, "description")
        setSending(true)
        const { error } = await client.from("submissions").insert({
          name: fieldValue(form, "name"),
          email: fieldValue(form, "email"),
          title: description,
          year: fieldValue(form, "year"),
          teams: fieldValue(form, "teams"),
          description,
          why_it_belongs: fieldValue(form, "why"),
          notes: fieldValue(form, "notes"),
        })
        setSending(false)

        if (error) {
          setFailed(true)
          return
        }

        setSent(true)
      }}
    >
      <div className="grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Name <span className="tracking-normal normal-case">(optional)</span>
          </span>
          <input name="name" autoComplete="name" className={`${inputClass} mt-2`} />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Email <span className="tracking-normal normal-case">(optional)</span>
          </span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            className={`${inputClass} mt-2`}
          />
        </label>
      </div>

      <label className="mt-6 block">
        <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Entry title or description
        </span>
        <textarea
          name="description"
          required
          className={`${areaClass} mt-2`}
        />
      </label>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <label className="block">
          <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Year or approximate date
          </span>
          <input name="year" className={`${inputClass} mt-2`} />
        </label>
        <label className="block">
          <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            Teams involved
          </span>
          <input name="teams" className={`${inputClass} mt-2`} />
        </label>
      </div>

      <label className="mt-6 block">
        <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Why it belongs in the Hall
        </span>
        <textarea name="why" required className={`${areaClass} mt-2`} />
      </label>

      <label className="mt-6 block">
        <span className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
          Notes <span className="tracking-normal normal-case">(optional)</span>
        </span>
        <textarea
          name="notes"
          className={`${areaClass} mt-2 min-h-20`}
          placeholder="A correction, a source, or a public-domain image credit."
        />
      </label>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={sending}
          className="h-11 bg-navy px-5 text-sm text-cream disabled:opacity-60"
        >
          {sending ? "Sending…" : "Submit note"}
        </button>
        <p className="text-sm text-muted-foreground">
          Saved for review. Not published on its own.
        </p>
      </div>
      {failed ? (
        <p className="mt-4 text-sm text-cardinal" role="alert">
          The note could not be saved. Try again.
        </p>
      ) : null}
    </form>
  )
}
