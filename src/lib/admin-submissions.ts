import { createClient } from "@supabase/supabase-js"

export const submissionStatuses = ["pending", "approved", "rejected", "completed"] as const

export type SubmissionStatus = (typeof submissionStatuses)[number]

export type SubmissionRow = {
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

const transitions: Record<SubmissionStatus, readonly SubmissionStatus[]> = {
  pending: ["approved", "rejected"],
  approved: ["completed", "pending"],
  rejected: ["pending"],
  completed: [],
}

export function isSubmissionStatus(value: string): value is SubmissionStatus {
  return (submissionStatuses as readonly string[]).includes(value)
}

export function parseReviewStatus(value: string | undefined): SubmissionStatus {
  return value && isSubmissionStatus(value) ? value : "pending"
}

export function canTransition(from: SubmissionStatus, to: SubmissionStatus) {
  return transitions[from].includes(to)
}

export function reviewHref(status: SubmissionStatus = "pending", failed = false) {
  const params = new URLSearchParams()
  if (status !== "pending") params.set("status", status)
  if (failed) params.set("error", "update")
  const query = params.toString()
  return query ? `/admin?${query}` : "/admin"
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

export async function loadSubmissions(status: SubmissionStatus) {
  const client = adminClient()
  if (!client) return { rows: [] as SubmissionRow[], error: "missing-key" as const }

  const { data, error } = await client
    .from("submissions")
    .select("id, created_at, title, year, teams, description, why_it_belongs, name, email, notes")
    .eq("status", status)
    .order("created_at", { ascending: false })

  if (error) return { rows: [] as SubmissionRow[], error: "query" as const }
  return { rows: (data ?? []) as SubmissionRow[], error: null }
}

export async function setSubmissionStatus(
  id: string,
  from: SubmissionStatus,
  status: SubmissionStatus,
) {
  const client = adminClient()
  if (!client || !canTransition(from, status)) {
    return { ok: false as const, error: "update" as const }
  }

  const { data, error } = await client
    .from("submissions")
    .update({ status })
    .eq("id", id)
    .eq("status", from)
    .select("id")
    .maybeSingle()

  if (error || !data) return { ok: false as const, error: "update" as const }
  return { ok: true as const }
}
