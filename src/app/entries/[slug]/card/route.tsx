import { ImageResponse } from "next/og"
import { connection } from "next/server"
import { getEntryBySlug } from "@/lib/entries"
import { loadEntryShame } from "@/lib/shame-averages"
import { loadShareFonts, shareCardElement, shareCardPhoto } from "@/lib/share-card"

export async function GET(_request: Request, context: RouteContext<"/entries/[slug]/card">) {
  await connection()
  const { slug } = await context.params
  const entry = getEntryBySlug(slug)
  if (!entry) return new Response("Not found", { status: 404 })

  const [fonts, shame, photo] = await Promise.all([
    loadShareFonts(),
    loadEntryShame(entry.slug),
    shareCardPhoto(entry.images[0]?.url),
  ])

  const element = shareCardElement({
    title: entry.title,
    year: entry.year,
    summary: entry.summary,
    average: shame?.average ?? null,
    votes: shame?.votes ?? 0,
    photo,
  })
  const options = {
    width: 1200,
    height: 630,
    fonts,
    headers: {
      "Cache-Control": "public, max-age=300, stale-while-revalidate=3600",
    },
  }

  try {
    return new ImageResponse(element, options)
  } catch (error) {
    console.error("Share card: image failed", error)
    if (!fonts) return new Response("Could not draw the share card", { status: 500 })
    return new ImageResponse(element, { ...options, fonts: undefined })
  }
}
