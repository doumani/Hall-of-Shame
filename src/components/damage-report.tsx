import { Separator } from "@/components/ui/separator"
import { damageRows } from "@/lib/damage"
import type { DamageReport as DamageReportData } from "@/lib/types"

export function DamageReport({ damage }: { damage?: DamageReportData }) {
  const rows = damageRows(damage)
  if (rows.length === 0) return null

  return (
    <section
      className="mt-5 border border-border bg-paper p-5 shadow-[0_0_0_1px_rgba(10,22,40,0.04)]"
      aria-labelledby="damage-report-heading"
    >
      <h2
        id="damage-report-heading"
        className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase"
      >
        <span aria-hidden="true" className="h-px w-6 bg-cardinal" />
        Damage report
      </h2>
      <dl className="mt-4 space-y-4 text-sm">
        {rows.map((row, index) => (
          <div key={row.term}>
            {index > 0 ? <Separator className="mb-4" /> : null}
            <dt className="text-muted-foreground">{row.term}</dt>
            <dd className="mt-1 leading-relaxed">{row.detail}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
