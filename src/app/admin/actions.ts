"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  clearAdminCookie,
  isAdmin,
  passwordsMatch,
  setAdminCookie,
} from "@/lib/admin-auth"
import { setSubmissionStatus } from "@/lib/admin-submissions"

export async function login(_prev: { error?: string } | null, formData: FormData) {
  const expected = process.env.ADMIN_PASSWORD
  const given = String(formData.get("password") ?? "")
  if (!expected) return { error: "The review desk is not configured." }
  if (!given || !passwordsMatch(given, expected)) {
    return { error: "That password is not right." }
  }
  await setAdminCookie()
  redirect("/admin")
}

export async function logout() {
  await clearAdminCookie()
  redirect("/admin")
}

export async function reviewSubmission(formData: FormData) {
  if (!(await isAdmin())) redirect("/admin")

  const id = String(formData.get("id") ?? "")
  const status = String(formData.get("status") ?? "")
  if (!/^[0-9a-f-]{36}$/i.test(id) || (status !== "approved" && status !== "rejected")) {
    redirect("/admin?error=update")
  }

  const result = await setSubmissionStatus(id, status)
  revalidatePath("/admin")
  redirect(result.ok ? "/admin" : "/admin?error=update")
}
