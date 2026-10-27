"use client"

import { createContext, useContext, useEffect, useState, type FormEvent, type ReactNode } from "react"
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

type ShameMeterValue = {
  entryId: string
  votes: ShameVote[] | null
  voterKey: string | null
  pending: boolean
  hasReason: boolean
  reasonDraft: string
  setReasonDraft: (value: string) => void
  reasonState: "idle" | "saved" | "error"
  setReasonState: (value: "idle" | "saved" | "error") => void
  windowId: ShameWindowId
  setWindowId: (value: ShameWindowId) => void
  hoverScore: number | null
  setHoverScore: (value: number | null) => void
  unavailable: boolean
  rate: (score: number) => Promise<void>
  saveReason: (event: FormEvent) => Promise<void>
}

const ShameMeterContext = createContext<ShameMeterValue | null>(null)

function useShameMeter() {
  const value = useContext(ShameMeterContext)
  if (!value) throw new Error("Shame meter controls must render inside ShameMeter.")
  return value
}

export function ShameMeter({ entryId, children }: { entryId: string; children: ReactNode }) {
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

  async function rate(score: number) {
    const mine = votes?.find((vote) => vote.voter_key === voterKey) ?? null
    if (!voterKey || !client || mine || pending || score < 1 || score > 5) return
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
    <ShameMeterContext.Provider
      value={{
        entryId,
        votes,
        voterKey,
        pending,
        hasReason,
        reasonDraft,
        setReasonDraft,
        reasonState,
        setReasonState,
        windowId,
        setWindowId,
        hoverScore,
        setHoverScore,
        unavailable,
        rate,
        saveReason,
      }}
    >
      {children}
    </ShameMeterContext.Provider>
  )
}

export function ShameRating() {
  const {
    entryId,
    votes,
    voterKey,
    pending,
    hasReason,
    reasonDraft,
    setReasonDraft,
    reasonState,
    setReasonState,
    hoverScore,
    setHoverScore,
    unavailable,
    rate,
    saveReason,
  } = useShameMeter()

  const mine = votes?.find((vote) => vote.voter_key === voterKey) ?? null
  const locked = Boolean(mine)
  const scores = votes?.map((vote) => vote.score) ?? []
  const average = averageOf(scores)

  return (
    <section aria-label="Shame meter">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-cream/65 uppercase">
        Shame meter
      </p>
      <p className="mt-2 flex items-baseline gap-3">
        <span className="font-serif text-5xl leading-none text-cream tabular-nums">
          {average === null ? "—" : average.toFixed(1)}
        </span>
        <span className="text-[11px] font-semibold tracking-[0.16em] text-cream/60 uppercase">
          All-time · {voteLabel(scores.length)}
        </span>
      </p>

      <div className="mt-4 flex gap-1.5" role="group" aria-label="Rate this entry from 1 to 5">
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
              className={`transition disabled:cursor-default ${
                filled
                  ? "text-cardinal"
                  : "text-cream/45 hover:text-cream disabled:hover:text-cream/45"
              }`}
            >
              <BaseballIcon filled={filled} className="size-8 sm:size-9" />
            </button>
          )
        })}
      </div>

      <p className="mt-3 text-sm text-cream/65">
        {locked ? "Your vote is final." : "One anonymous score, and it stays."}
      </p>

      {unavailable ? <p className="mt-3 text-sm text-cream/70">The meter is unavailable.</p> : null}

      {locked && !hasReason ? (
        <form onSubmit={saveReason} className="mt-4 flex flex-col items-start gap-2">
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
            className="w-full border border-cream/25 bg-transparent px-3 py-2 text-sm text-cream outline-none placeholder:text-cream/40 focus:border-cream/70"
          />
          <button
            type="submit"
            disabled={pending || reasonDraft.trim().length === 0}
            className="border border-cream/40 px-3 py-2 text-[11px] font-semibold tracking-[0.14em] text-cream uppercase disabled:opacity-40"
          >
            Save
          </button>
        </form>
      ) : null}
      {reasonState === "saved" ? <p className="mt-2 text-sm text-cream/65">Note saved.</p> : null}
      {reasonState === "error" ? (
        <p className="mt-2 text-sm text-cream/70">The note could not be saved.</p>
      ) : null}
      <ShameTrend />
    </section>
  )
}

function ShameTrend() {
  const { votes, windowId, setWindowId } = useShameMeter()
  const windowVotes = votes ? votesInWindow(votes, windowId) : []
  const windowAverage = averageOf(windowVotes.map((vote) => vote.score))

  return (
    <div className="mt-6 border-t border-cream/15 pt-4" role="group" aria-label="Shame trend">
      <p className="text-[11px] font-semibold tracking-[0.18em] text-cream/65 uppercase">Trend</p>
      <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Trend window">
        {shameWindows.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={windowId === item.id}
            onClick={() => setWindowId(item.id)}
            className={
              windowId === item.id
                ? "border border-cream bg-cream px-2 py-1 text-[11px] font-semibold tracking-[0.12em] text-navy uppercase"
                : "border border-cream/25 px-2 py-1 text-[11px] font-semibold tracking-[0.12em] text-cream/70 uppercase hover:border-cream/60 hover:text-cream"
            }
          >
            {item.label}
          </button>
        ))}
      </div>
      <p className="mt-3 text-sm text-cream/65">
        {windowAverage === null ? "No votes" : windowAverage.toFixed(1)} · {voteLabel(windowVotes.length)}
      </p>
      <Sparkline scores={windowVotes.map((vote) => vote.score)} />
    </div>
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
