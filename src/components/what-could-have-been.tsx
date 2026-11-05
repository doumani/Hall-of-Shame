import { Story } from "@/components/story"

export function WhatCouldHaveBeen({ markdown }: { markdown?: string }) {
  if (!markdown?.trim()) return null

  return (
    <section
      className="mt-12 border border-border bg-paper p-6 shadow-[0_0_0_1px_rgba(10,22,40,0.04)] md:p-8"
      aria-labelledby="what-could-have-been-heading"
    >
      <h2
        id="what-could-have-been-heading"
        className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase"
      >
        <span aria-hidden="true" className="h-px w-6 bg-cardinal" />
        What could have been
      </h2>
      <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-cardinal uppercase">
        Alternate history
      </p>
      <div className="mt-4">
        <Story markdown={markdown} plain />
      </div>
    </section>
  )
}
