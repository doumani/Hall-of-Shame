"use client"

import { useEffect } from "react"
import { invalidateShame } from "@/lib/shame"
import { ensureShameSeed } from "@/lib/shame-seed"

export function ShameSeed({ slugs }: { slugs: string[] }) {
  useEffect(() => {
    void ensureShameSeed(slugs).then(() => invalidateShame())
  }, [slugs])

  return null
}
