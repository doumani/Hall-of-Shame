"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import { notifyShame, type ShameVote } from "@/lib/shame"

const ShameContext = createContext<SupabaseClient | null>(null)

let cached:
  | {
      url: string
      anonKey: string
      client: SupabaseClient
    }
  | null = null

function shameClient(url: string, anonKey: string) {
  if (cached?.url === url && cached.anonKey === anonKey) return cached.client
  const client = createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
  cached = { url, anonKey, client }
  return client
}

export function ShameProvider({
  url,
  anonKey,
  children,
}: {
  url: string
  anonKey: string
  children: ReactNode
}) {
  const client = useMemo(() => {
    if (!url || !anonKey) {
      console.error(
        "Shame meter: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required.",
      )
      return null
    }
    return shameClient(url, anonKey)
  }, [url, anonKey])

  return <ShameContext.Provider value={client}>{children}</ShameContext.Provider>
}

export function useShameClient() {
  return useContext(ShameContext)
}

export async function loadEntryVotes(client: SupabaseClient, entryId: string) {
  const { data, error } = await client
    .from("shame_ratings")
    .select("entry_id, score, created_at, voter_key")
    .eq("entry_id", entryId)

  if (error) {
    console.error("Shame meter: failed to load ratings", error.message, error.code, error.details)
    throw error
  }

  return (data ?? []).map(toVote)
}

export async function voterHasReason(client: SupabaseClient, entryId: string, voterKey: string) {
  const { data, error } = await client
    .from("shame_ratings")
    .select("reason")
    .eq("entry_id", entryId)
    .eq("voter_key", voterKey)
    .maybeSingle()

  if (error) {
    console.error("Shame meter: failed to check note", error.message, error.code)
    return false
  }
  return Boolean(data?.reason)
}

export async function insertVote(
  client: SupabaseClient,
  entryId: string,
  voterKey: string,
  score: number,
) {
  const { error } = await client.from("shame_ratings").insert({
    entry_id: entryId,
    score,
    voter_key: voterKey,
    reason: null,
  })

  if (error?.code === "23505") return "duplicate" as const
  if (error) {
    console.error("Shame meter: vote failed", error.message, error.code, error.details)
    throw error
  }
  notifyShame()
  return "inserted" as const
}

export async function updateReason(
  client: SupabaseClient,
  entryId: string,
  voterKey: string,
  reason: string,
) {
  const { data, error } = await client
    .from("shame_ratings")
    .update({ reason })
    .eq("entry_id", entryId)
    .eq("voter_key", voterKey)
    .select("entry_id")

  if (error || !data?.length) {
    console.error(
      "Shame meter: note was not saved",
      error?.message ?? "no row updated",
      error?.code ?? "",
    )
    throw error ?? new Error("no row updated")
  }
}

export async function loadAverages(client: SupabaseClient) {
  const { data, error } = await client.from("shame_ratings").select("entry_id, score")
  if (error) {
    console.error("Shame meter: failed to load averages", error.message, error.code, error.details)
    throw error
  }

  const map = new Map<string, { sum: number; count: number }>()
  for (const row of data ?? []) {
    const score = Number(row.score)
    if (!Number.isFinite(score)) continue
    const current = map.get(row.entry_id) ?? { sum: 0, count: 0 }
    current.sum += score
    current.count += 1
    map.set(row.entry_id, current)
  }
  return map
}

function toVote(row: {
  entry_id: string
  score: number
  created_at: string
  voter_key: string
}): ShameVote {
  return {
    entry_id: row.entry_id,
    score: Number(row.score),
    created_at: row.created_at,
    voter_key: row.voter_key,
  }
}
