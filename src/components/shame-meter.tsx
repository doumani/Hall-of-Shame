"use client"

import { useEffect, useState, type FormEvent } from "react"
import { BaseballIcon } from "@/components/baseball-icon"
import {
  insertVote,
  loadEntryVotes,
  updateReason,
  useShameClient,
  voterHasReason,
} from "@/components/shame-client"
import {
  averageOf,
  getVoterKey,
  shameWindows,
  votesInWindow,
  type ShameVote,
  type ShameWindowId,
} from "@/lib/shame"

export function ShameMeter({ entryId }: { entryId: string }) {
  const [votes, setVotes] = useState<ShameVote[] | null>(null)
  const [voterKey, setVoterKey] = useState<string | null>(null)
  const [pending, setPending] = useState(false)
  const [hasReason, setHasReason] = useState(false)
  const [reasonDraft, setReasonDraft] = useState("")
  const [reasonState, setReasonState] = useState<"idle" | "saved" | "error">("idle")
  const [windowId, setWindowId] = useState<ShameWindowId>("all")
  const [hoverScore, setHoverScore] = useState<number | null>(null)
  const client = useShameClient()

  const [unavailable, setUnavailable] = useState(false)

  useEffect(() => {
    const key = getVoterKey()
    setVoterKey(key)
    if (!client) {
      setUnavailable(true)
      return
    }

    let cancelled = false
    async function load(active: NonNullable<typeof client>) {
      try {
        const rows = await loadEntryVotes(active, entryId)
        if (cancelled) return
        setVotes(rows)
        setUnavailable(false)
        const noted = await voterHasReason(active, entryId, key)
        if (!cancelled) setHasReason(noted)
      } catch {
        if (!cancelled) setUnavailable(true)
      }
    }

    void load(client)
    return () => {
      cancelled = true
    }
  }, [client, entryId])

  const mine = votes?.find((vote) => vote.voter_key === voterKey) ?? null
  const locked = Boolean(mine)
  const scores = votes?.map((vote) => vote.score) ?? []
  const average = averageOf(scores)
  const windowVotes = votes ? votesInWindow(votes, windowId) : []
  const windowAverage = averageOf(windowVotes.map((vote) => vote.score))

  async function rate(score: number) {
    if (!voterKey || !client || locked || pending || score < 1 || score > 5) return
    setPending(true)
    try {
      const result = await insertVote(client, entryId, voterKey, score)
      if (result === "duplicate") {
        setVotes(await loadEntryVotes(client, entryId))
      } else {
        setVotes((current) => {
          const next = (current ?? []).filter((vote) => vote.voter_key !== voterKey)
          next.push({
            entry_id: entryId,
            score,
            voter_key: voterKey,
            created_at: new Date().toISOString(),
          })
          return next
        })
      }
      setUnavailable(false)
    } catch {
      setUnavailable(true)
    } finally {
      setPending(false)
    }
  }

  async function saveReason(event: FormEvent) {
    event.preventDefault()
    const reason = reasonDraft.trim()
    if (!reason || !voterKey || !client || hasReason) return
    setPending(true)
    try {
      await updateReason(client, entryId, voterKey, reason)
      setReasonDraft("")
      setHasReason(true)
      setReasonState("saved")
    } catch {
      setReasonState("error")
    } finally {
      setPending(false)
    }
  }

  return (
    <section className="mt-12 border border-border bg-paper p-5 md:p-6" aria-label="Shame meter">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-3xl tracking-tight">Shame meter</h2>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            {locked
              ? "Your vote is final."
              : "Anonymous. One score from 1 to 5, and it stays."}
          </p>
        </div>
        <p className="text-right">
          <span className="font-serif text-4xl leading-none tabular-nums">
            {average === null ? "—" : average.toFixed(1)}
          </span>
          <span className="mt-1 block text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
            All-time · {voteLabel(scores.length)}
          </span>
        </p>
      </div>

      <div className="mt-5 flex gap-2" role="group" aria-label="Rate this entry from 1 to 5">
        {[1, 2, 3, 4, 5].map((score) => {
          const shown = mine?.score ?? hoverScore
          const filled = shown ? score <= shown : false
          return (
            <button
              key={score}
              type="button"
              disabled={locked || pending || unavailable || votes === null}
              onClick={() => void rate(score)}
              onMouseEnter={() => setHoverScore(score)}
              onMouseLeave={() => setHoverScore(null)}
              onFocus={() => setHoverScore(score)}
              onBlur={() => setHoverScore(null)}
              aria-label={locked ? `Rated ${mine?.score} out of 5` : `Rate ${score} out of 5`}
              aria-pressed={mine?.score === score}
              className="text-cardinal transition hover:text-navy disabled:cursor-default disabled:hover:text-cardinal"
            >
              <BaseballIcon filled={filled} className="size-9" />
            </button>
          )
        })}
      </div>

      {unavailable ? (
        <p className="mt-3 text-sm text-muted-foreground">The meter is unavailable.</p>
      ) : null}

      {locked && !hasReason ? (
        <form onSubmit={saveReason} className="mt-5 flex gap-2">
          <label className="sr-only" htmlFor={`shame-reason-${entryId}`}>
            Optional private note
          </label>
          <input
            id={`shame-reason-${entryId}`}
            value={reasonDraft}
            onChange={(event) => {
              setReasonDraft(event.target.value)
              setReasonState("idle")
            }}
            maxLength={180}
            placeholder="Optional note, kept private"
            className="min-w-0 flex-1 border border-border bg-cream px-3 py-2 text-sm outline-none focus:border-navy"
          />
          <button
            type="submit"
            disabled={pending || reasonDraft.trim().length === 0}
            className="border border-navy px-3 py-2 text-[11px] font-semibold tracking-[0.14em] text-navy uppercase disabled:opacity-40"
          >
            Save
          </button>
        </form>
      ) : null}
      {reasonState === "saved" ? (
        <p className="mt-2 text-sm text-muted-foreground">Note saved.</p>
      ) : null}
      {reasonState === "error" ? (
        <p className="mt-2 text-sm text-muted-foreground">The note could not be saved.</p>
      ) : null}

      <div className="mt-6 border-t border-border pt-4">
        <div className="flex flex-wrap gap-2" role="group" aria-label="Trend window">
          {shameWindows.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={windowId === item.id}
              onClick={() => setWindowId(item.id)}
              className={
                windowId === item.id
                  ? "border border-navy bg-navy px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-cream uppercase"
                  : "border border-border px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-muted-foreground uppercase hover:border-navy hover:text-navy"
              }
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          {windowAverage === null ? "No votes" : windowAverage.toFixed(1)} · {voteLabel(windowVotes.length)}
        </p>
        <Sparkline scores={windowVotes.map((vote) => vote.score)} />
      </div>
    </section>
  )
}

function voteLabel(count: number) {
  return `${count} ${count === 1 ? "vote" : "votes"}`
}

function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length === 0) return null
  const width = 320
  const height = 56
  const points = scores
    .map((score, index) => {
      const x = scores.length === 1 ? width / 2 : (index / (scores.length - 1)) * (width - 8) + 4
      const y = height - 6 - ((score - 1) / 4) * (height - 14)
      return `${x},${y}`
    })
    .join(" ")

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="mt-2 h-14 w-full text-cardinal" role="img" aria-label="Score trend">
      <polyline fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" points={points} />
      {scores.map((score, index) => {
        const x = scores.length === 1 ? width / 2 : (index / (scores.length - 1)) * (width - 8) + 4
        const y = height - 6 - ((score - 1) / 4) * (height - 14)
        return <circle key={`${score}-${index}`} cx={x} cy={y} r="2.5" fill="currentColor" />
      })}
    </svg>
  )
}
