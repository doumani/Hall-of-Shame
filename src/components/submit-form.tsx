"use client"

import { useState } from "react"

const fieldClass =
  "w-full rounded-sm border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

const inputClass = `${fieldClass} h-11`
const areaClass = `${fieldClass} min-h-28 py-3 leading-relaxed`

export function SubmitForm() {
  const [sent, setSent] = useState(false)

  if (sent) {
    return (
      <div
        className="border border-border bg-card px-6 py-10 md:px-10"
        role="status"
        aria-live="polite"
      >
        <p className="text-[11px] font-semibold tracking-[0.18em] text-cardinal uppercase">
          Received on this page only
        </p>
        <h2 className="mt-3 font-serif text-3xl leading-tight">
          Thank you. This is a placeholder form and does not send data yet.
        </h2>
        <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground">
          Nothing was saved, emailed, or stored. When a real submission path
          exists, this page will say so.
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
      onSubmit={(event) => {
        event.preventDefault()
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
        <button type="submit" className="h-11 bg-navy px-5 text-sm text-cream">
          Submit note
        </button>
        <p className="text-sm text-muted-foreground">
          The button only confirms the note on this page.
        </p>
      </div>
    </form>
  )
}
