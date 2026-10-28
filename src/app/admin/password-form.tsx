"use client"

import { useActionState } from "react"
import { login } from "@/app/admin/actions"

const fieldClass =
  "mt-2 h-11 w-full rounded-sm border border-input bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"

export function PasswordForm() {
  const [state, action, pending] = useActionState(login, null)

  return (
    <form action={action} className="max-w-md border border-border bg-card px-6 py-8">
      <label htmlFor="admin-password" className="text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
        Password
      </label>
      <input
        id="admin-password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        className={fieldClass}
      />
      {state?.error ? (
        <p className="mt-4 text-sm text-cardinal" role="alert">
          {state.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="mt-6 h-11 bg-navy px-5 text-sm text-cream disabled:opacity-60"
      >
        {pending ? "Checking…" : "Enter"}
      </button>
    </form>
  )
}
