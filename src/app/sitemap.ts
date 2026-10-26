import type { MetadataRoute } from "next"
import { getAllEntries, getPlayers, getTeams } from "@/lib/entries"
import { getSiteUrl } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl()

  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/entries`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/players`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/teams`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/about`, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/submit`, changeFrequency: "yearly", priority: 0.4 },
    ...getPlayers().map((player) => ({
      url: `${base}/players/${player.id}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...getTeams().map((team) => ({
      url: `${base}/teams/${team.id}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    ...getAllEntries().map((entry) => ({
      url: `${base}/entries/${entry.slug}`,
      lastModified: new Date(`${entry.date}T00:00:00Z`),
      changeFrequency: "yearly" as const,
      priority: entry.featured ? 0.8 : 0.6,
    })),
  ]
}
