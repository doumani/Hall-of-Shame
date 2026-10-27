"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useShameClient } from "@/components/shame-client"
import { getVoterKey } from "@/lib/shame"
import { cn } from "@/lib/utils"

export type VersusEntry = {
  id: string
  slug: string
  title: string
  year: number
  category: string
  summary: string
  image: { url: string; alt: string } | null
}

type Pair = [VersusEntry, VersusEntry]

type Ballot = {
  winnerId: string
  wins: number | null
  total: number | null
}

export function VersusMatch({ entries }: { entries: VersusEntry[] }) {
  const client = useShameClient()
  const catalog = useRef(entries)
  catalog.current = entries
  const [pair, setPair] = useState<Pair | null>(null)
  const [ballot, setBallot] = useState<Ballot | null>(null)
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const sending = useRef(false)

  useEffect(() => {
    setPair((current) => current ?? drawPair(catalog.current))
  }, [])

  function nextMatchup() {
    setBallot(null)
    setFailed(false)
    setPending(false)
    setPair(drawPair(catalog.current, pair ?? undefined))
  }

  async function choose(winnerId: string) {
    if (!pair || !client || sending.current || ballot) return
    const [left, right] = pair
    if (winnerId !== left.id && winnerId !== right.id) return

    sending.current = true
    setPending(true)
    setFailed(false)
    try {
      const { error } = await client.from("matchups").insert({
        entry_a: left.id,
        entry_b: right.id,
        winner: winnerId,
        voter_key: getVoterKey(),
      })
      if (error) {
        console.error("Versus: ballot was not recorded", error.message, error.code, error.details)
        setFailed(true)
        return
      }

      const tally = await loadPairTally(client, left.id, right.id)
      const wins = tally?.filter((row) => row.winner === winnerId).length ?? null
      setBallot({
        winnerId,
        wins,
        total: tally ? tally.length : null,
      })
    } catch (error) {
      console.error("Versus: ballot was not recorded", error)
      setFailed(true)
    } finally {
      sending.current = false
      setPending(false)
    }
  }

  if (!pair) {
    return <p className="text-sm text-muted-foreground">Drawing two entries from the record.</p>
  }

  const winner = ballot ? pair.find((entry) => entry.id === ballot.winnerId) : undefined

  return (
    <div>
      <div className="grid items-stretch gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-5">
        <VersusCard
          entry={pair[0]}
          chosen={ballot?.winnerId === pair[0].id}
          settled={Boolean(ballot)}
          pending={pending}
          onChoose={() => void choose(pair[0].id)}
        />
        <p className="self-center text-center text-[11px] font-semibold tracking-[0.22em] text-muted-foreground uppercase">
          or
        </p>
        <VersusCard
          entry={pair[1]}
          chosen={ballot?.winnerId === pair[1].id}
          settled={Boolean(ballot)}
          pending={pending}
          onChoose={() => void choose(pair[1].id)}
        />
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3" aria-live="polite">
        {winner && ballot ? (
          <p className="max-w-xl text-sm leading-relaxed text-foreground">
            You called <span className="font-serif text-lg">{winner.title}</span> worse.
            {ballot.wins !== null && ballot.total !== null ? (
              <>
                {" "}
                Called worse in {ballot.wins} of {ballot.total}{" "}
                {ballot.total === 1 ? "ballot" : "ballots"} for this pairing.
              </>
            ) : null}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">
            {failed
              ? "The ballot could not be recorded."
              : pending
                ? "Recording the ballot."
                : "Click the entry that was worse."}
          </p>
        )}
        {ballot ? (
          <button
            type="button"
            onClick={nextMatchup}
            className="border border-navy bg-navy px-4 py-2 text-[11px] font-semibold tracking-[0.14em] text-cream uppercase hover:bg-navy/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cardinal"
          >
            Next matchup
          </button>
        ) : null}
      </div>
    </div>
  )
}

function VersusCard({
  entry,
  chosen,
  settled,
  pending,
  onChoose,
}: {
  entry: VersusEntry
  chosen: boolean
  settled: boolean
  pending: boolean
  onChoose: () => void
}) {
  return (
    <article
      className={cn(
        "flex h-full flex-col bg-paper text-foreground shadow-[0_0_0_1px_rgba(10,22,40,0.1)]",
        settled && !chosen && "opacity-60",
        chosen && "shadow-[0_0_0_1px_#0A1628]",
      )}
    >
      <button
        type="button"
        onClick={onChoose}
        disabled={pending || settled}
        aria-pressed={chosen}
        aria-label={`Call ${entry.title} worse`}
        className="group relative flex flex-1 flex-col text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cardinal disabled:cursor-default"
      >
        <span
          aria-hidden="true"
          className={cn(
            "absolute inset-x-0 top-0 z-10 h-0.5 bg-cardinal transition duration-300",
            chosen ? "scale-x-100" : "origin-left scale-x-0 group-hover:scale-x-100",
          )}
        />
        <div className="relative aspect-[16/10] overflow-hidden bg-[#07111e]">
          {entry.image ? (
            <Image
              src={entry.image.url}
              alt={entry.image.alt}
              fill
              sizes="(min-width: 768px) 40vw, 100vw"
              className="object-cover object-center"
            />
          ) : (
            <div className="flex h-full items-end px-5 py-4 text-cream">
              <p className="font-serif text-5xl leading-none tracking-tight">{entry.year}</p>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col px-5 pt-4 pb-5">
          <div className="flex items-baseline justify-between gap-3 text-[11px] font-semibold tracking-[0.16em] uppercase">
            <span className="text-cardinal">{chosen ? "Worse" : entry.category}</span>
            <span className="text-muted-foreground tabular-nums">{entry.year}</span>
          </div>
          <h2 className="mt-2.5 font-serif text-2xl leading-tight tracking-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4 group-disabled:no-underline">
            {entry.title}
          </h2>
          <p className="mt-2.5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {entry.summary}
          </p>
        </div>
      </button>
      <p className="border-t border-border/80 px-5 py-3 text-xs tracking-wide">
        <Link href={`/entries/${entry.slug}`} className="underline-offset-4 hover:underline">
          Read the entry
        </Link>
      </p>
    </article>
  )
}

function drawPair(entries: VersusEntry[], avoid?: Pair): Pair | null {
  if (entries.length < 2) return null
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const left = entries[Math.floor(Math.random() * entries.length)]
    const right = entries[Math.floor(Math.random() * entries.length)]
    if (!left || !right || left.id === right.id) continue
    if (avoid && samePair(left.id, right.id, avoid[0].id, avoid[1].id)) continue
    return Math.random() < 0.5 ? [left, right] : [right, left]
  }
  const fallback = entries.find((entry) => entry.id !== entries[0]?.id)
  if (!entries[0] || !fallback) return null
  return [entries[0], fallback]
}

function samePair(a: string, b: string, c: string, d: string) {
  return (a === c && b === d) || (a === d && b === c)
}

async function loadPairTally(
  client: NonNullable<ReturnType<typeof useShameClient>>,
  left: string,
  right: string,
) {
  const { data, error } = await client
    .from("matchups")
    .select("winner")
    .or(`and(entry_a.eq.${left},entry_b.eq.${right}),and(entry_a.eq.${right},entry_b.eq.${left})`)

  if (error) {
    console.error("Versus: could not read this pairing", error.message, error.code)
    return null
  }
  return data ?? []
}
