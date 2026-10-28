"use client"

import { useEffect, useState } from "react"
import { useShameMeter } from "@/components/shame-meter"
import { averageOf } from "@/lib/shame"
import { shareLine } from "@/lib/share"

export function ShareEntry({ title, year }: { title: string; year: number }) {
  const { votes, unavailable } = useShameMeter()
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle")
  const loading = votes === null && !unavailable
  const ready = votes !== null || unavailable
  const average = votes === null ? null : averageOf(votes.map((vote) => vote.score))

  useEffect(() => {
    if (status === "idle") return
    const timer = window.setTimeout(() => setStatus("idle"), 2200)
    return () => window.clearTimeout(timer)
  }, [status])

  async function share() {
    const text = shareLine(title, year, average)
    const url = new URL(window.location.pathname, window.location.origin).toString()

    if (typeof navigator.share === "function") {
      try {
        await navigator.share({ title: text, text, url })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return
      }
    }

    try {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setStatus("copied")
    } catch {
      setStatus("failed")
    }
  }

  const label = status === "copied" ? "Copied" : status === "failed" ? "Copy failed" : "Share"

  return (
    <span className="inline-flex flex-wrap items-center gap-x-3 gap-y-1">
      <button
        type="button"
        onClick={() => void share()}
        disabled={!ready || status === "copied"}
        aria-live="polite"
        aria-describedby={loading ? "share-waiting" : undefined}
        className="border border-cream/40 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-cream uppercase hover:border-cream disabled:opacity-60"
      >
        {label}
      </button>
      {loading ? (
        <span id="share-waiting" className="text-[11px] tracking-[0.08em] text-cream/70 uppercase">
          Waiting for the votes.
        </span>
      ) : null}
    </span>
  )
}
