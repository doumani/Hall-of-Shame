export function shareLine(title: string, year: number, average: number | null) {
  const heading = `${title} (${year})`
  if (average === null || !Number.isFinite(average)) return heading
  return `${heading} — ${average.toFixed(1)} shame`
}

export function shareCardPath(slug: string) {
  return `/entries/${slug}/card`
}
