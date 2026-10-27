"use client"

import { useEffect, useState } from "react"
import { BaseballIcon } from "@/components/baseball-icon"
import { loadAverages, useShameClient } from "@/components/shame-client"
import { subscribeShame } from "@/lib/shame"

export function ShameBadge({ entryId }: { entryId: string }) {
  const client = useShameClient()
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    if (!client) return
    let cancelled = false
    async function read() {
      try {
        const map = await loadAverages(client!)
        const row = map.get(entryId)
        if (!cancelled) setLabel(row && row.count > 0 ? (row.sum / row.count).toFixed(1) : null)
      } catch {
        if (!cancelled) setLabel(null)
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

  if (!label) return null

  return (
    <p className="mt-3 flex items-center gap-1.5 text-xs tracking-wide text-navy">
      <BaseballIcon filled className="size-3.5 text-cardinal" />
      <span className="tabular-nums">{label}</span>
      <span className="text-muted-foreground">shame</span>
    </p>
  )
}
