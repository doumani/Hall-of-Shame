"use client"

import { useEffect, useState } from "react"
import { BaseballIcon } from "@/components/baseball-icon"
import { loadAverages, useShameClient } from "@/components/shame-client"
import { crowdRatingMinimum, subscribeShame } from "@/lib/shame"
import { cn } from "@/lib/utils"

export function CrowdRating({
  count,
  tone = "ink",
}: {
  count: number
  tone?: "ink" | "cream"
}) {
  if (count < crowdRatingMinimum) return null

  return (
    <span
      className={cn(
        "inline-flex items-center font-semibold tracking-[0.14em] uppercase tabular-nums",
        tone === "cream"
          ? "border border-cream/35 px-1.5 py-0.5 text-[10px] leading-none text-cream/80"
          : "text-[10px] leading-none text-muted-foreground",
      )}
    >
      {count} ratings
    </span>
  )
}

export function ShameBadge({ entryId }: { entryId: string }) {
  const client = useShameClient()
  const [stats, setStats] = useState<{ average: string; count: number } | null>(null)

  useEffect(() => {
    if (!client) return
    let cancelled = false
    async function read() {
      try {
        const map = await loadAverages(client!)
        const row = map.get(entryId)
        if (cancelled) return
        setStats(row && row.count > 0 ? { average: (row.sum / row.count).toFixed(1), count: row.count } : null)
      } catch {
        if (!cancelled) setStats(null)
      }
    }
    void read()
    const unsubscribe = subscribeShame(() => {
      void read()
    })
    return () => {
      cancelled = true
      unsubscribe()
    }
  }, [client, entryId])

  if (!stats) return null

  return (
    <p className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs tracking-wide text-navy">
      <BaseballIcon filled className="size-3.5 text-cardinal" />
      <span className="tabular-nums">{stats.average}</span>
      <span className="text-muted-foreground">shame</span>
      <CrowdRating count={stats.count} />
    </p>
  )
}
