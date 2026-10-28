import { createClient } from "@supabase/supabase-js"

export type PendingSubmission = {
  id: string
  created_at: string
  title: string | null
  year: string | null
  teams: string | null
  description: string | null
  why_it_belongs: string | null
  name: string | null
  email: string | null
  notes: string | null
}

function serviceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY
}

export function adminConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && serviceRoleKey())
}

function adminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = serviceRoleKey()
  if (!url || !key) return null
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  })
}

export async function loadPendingSubmissions() {
  const client = adminClient()
  if (!client) return { rows: [] as PendingSubmission[], error: "missing-key" as const }

  const { data, error } = await client
    .from("submissions")
    .select("id, created_at, title, year, teams, description, why_it_belongs, name, email, notes")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  if (error) return { rows: [] as PendingSubmission[], error: "query" as const }
  return { rows: (data ?? []) as PendingSubmission[], error: null }
}

export async function setSubmissionStatus(id: string, status: "approved" | "rejected") {
  const client = adminClient()
  if (!client) return { ok: false as const, error: "missing-key" as const }

  const { data, error } = await client
    .from("submissions")
    .update({ status })
    .eq("id", id)
    .eq("status", "pending")
    .select("id")
    .maybeSingle()

  if (error || !data) return { ok: false as const, error: "update" as const }
  return { ok: true as const }
}
