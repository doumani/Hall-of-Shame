export function formatEntryDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number)
  if (!year || !month || !day) return iso
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  })
}

export function catalogNumber(iso: string) {
  const [year, month, day] = iso.split("-")
  if (!year || !month || !day) return iso
  return `${year}.${month}.${day}`
}

function pluralize(noun: string) {
  if (/(?:s|x|z|ch|sh)$/i.test(noun)) return `${noun}es`
  if (/[^aeiou]y$/i.test(noun)) return `${noun.slice(0, -1)}ies`
  return `${noun}s`
}

export function formatCount(count: number, noun: string) {
  return `${count} ${count === 1 ? noun : pluralize(noun)}`
}

export function filmWatchLabel(url: string) {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "")
    if (host === "mlb.com" || host.endsWith(".mlb.com")) return "Watch on MLB.com"
    if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be") {
      return "Watch on YouTube"
    }
  } catch {
    return "Watch"
  }
  return "Watch"
}

/** Turns a YouTube or Internet Archive page URL into an embeddable src. */
export function videoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.replace(/^www\./, "")

    if (host === "youtu.be") {
      const id = parsed.pathname.slice(1)
      return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname === "/watch") {
        const id = parsed.searchParams.get("v")
        return id ? `https://www.youtube-nocookie.com/embed/${id}` : null
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return `https://www.youtube-nocookie.com${parsed.pathname}`
      }
    }

    if (host === "youtube-nocookie.com" && parsed.pathname.startsWith("/embed/")) {
      return url
    }

    if (host.endsWith("archive.org")) {
      if (parsed.pathname.startsWith("/embed/")) return url
      const details = parsed.pathname.match(/^\/details\/([^/]+)/)
      if (details) return `https://archive.org/embed/${details[1]}`
    }
  } catch {
    return null
  }

  return null
}
