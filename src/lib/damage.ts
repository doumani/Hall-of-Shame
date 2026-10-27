import type { ConsequenceId, DamageReport, LeverageId } from "@/lib/types"

export const leverageLabels: Record<LeverageId, string> = {
  "late-inning": "Late and close",
  "one-out": "One out away",
  clinch: "A chance to clinch",
  elimination: "Elimination",
  postseason: "A postseason game",
  "the-record": "A record in progress",
  "roster-move": "A roster decision",
  "off-field": "Off the field",
}

export const consequenceLabels: Record<ConsequenceId, string> = {
  "the-play": "The play",
  "the-game": "The game",
  "the-series": "The series",
  "the-season": "The season",
  "the-franchise": "The franchise",
  "the-record": "The record",
}

export function damageRows(damage: DamageReport | undefined) {
  if (!damage) return []

  const rows: { term: string; detail: string }[] = []
  if (damage.leverage) {
    rows.push({ term: "Leverage", detail: leverageLabels[damage.leverage] })
  }
  if (damage.consequence) {
    rows.push({ term: "Consequence", detail: consequenceLabels[damage.consequence] })
  }
  if (damage.stakes?.trim()) {
    rows.push({ term: "Stakes", detail: damage.stakes.trim() })
  }
  return rows
}
