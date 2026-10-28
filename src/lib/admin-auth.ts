import { createHmac, timingSafeEqual } from "node:crypto"
import { cookies } from "next/headers"

export const adminCookie = "hos_admin"

function digest(value: string) {
  return createHmac("sha256", "hos-admin-compare").update(value).digest()
}

export function passwordsMatch(given: string, expected: string) {
  return timingSafeEqual(digest(given), digest(expected))
}

function sessionValue() {
  const password = process.env.ADMIN_PASSWORD
  if (!password) return null
  return createHmac("sha256", password).update("hos-admin-v1").digest("base64url")
}

export async function isAdmin() {
  const expected = sessionValue()
  if (!expected) return false
  const current = (await cookies()).get(adminCookie)?.value
  if (!current || current.length !== expected.length) return false
  return timingSafeEqual(Buffer.from(current), Buffer.from(expected))
}

export async function setAdminCookie() {
  const value = sessionValue()
  if (!value) return
  const jar = await cookies()
  jar.set(adminCookie, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  })
}

export async function clearAdminCookie() {
  const jar = await cookies()
  jar.delete(adminCookie)
}
