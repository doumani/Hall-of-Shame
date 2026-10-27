import Image from "next/image"
import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { EntryCard } from "@/components/entry-card"
import { ShameMeter } from "@/components/shame-meter"
import { Story } from "@/components/story"
import { Separator } from "@/components/ui/separator"
import {
  getAllEntries,
  getEntryBySlug,
  getRelatedEntries,
} from "@/lib/entries"
import { catalogNumber, formatEntryDate, videoEmbedUrl } from "@/lib/format"
import { getCategory, getEra } from "@/lib/taxonomy"
import { localImageSize } from "@/lib/image-size"
import { getSiteUrl } from "@/lib/site"

type Props = { params: Promise<{ slug: string }> }

export function generateStaticParams() {
  return getAllEntries().map((entry) => ({ slug: entry.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const entry = getEntryBySlug(slug)
  if (!entry) return { title: "Entry not found" }

  return {
    title: entry.title,
    description: entry.summary,
    openGraph: {
      title: entry.title,
      description: entry.summary,
      type: "article",
    },
  }
}

export const instant = false

export default async function EntryPage({ params }: Props) {
  const { slug } = await params
  const entry = getEntryBySlug(slug)
  if (!entry) notFound()

  const era = getEra(entry.era)
  const related = getRelatedEntries(entry)
  const url = `${getSiteUrl()}/entries/${entry.slug}`

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: entry.title,
    description: entry.summary,
    datePublished: entry.date,
    articleSection: entry.categories
      .map((id) => getCategory(id)?.label)
      .filter(Boolean),
    about: entry.players.map((player) => player.name),
    url,
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="bg-navy text-cream">
        <div className="mx-auto max-w-6xl px-5 py-10 md:py-14">
          <nav aria-label="Breadcrumb" className="text-sm text-cream/70">
            <Link href="/entries" className="hover:text-cream hover:underline">
              The Catalog
            </Link>
            <span aria-hidden="true"> / </span>
            <span className="text-cream">{entry.title}</span>
          </nav>

          <div className="mt-8 max-w-3xl">
            <p className="flex items-center gap-3 text-[11px] font-semibold tracking-[0.18em] text-cream/75 uppercase">
              <span className="h-px w-8 bg-cardinal" />
              No. {catalogNumber(entry.date)} · {era?.label}
            </p>
            <h1 className="display mt-4 text-5xl leading-[0.95] text-balance text-cream md:text-7xl">
              {entry.title}
            </h1>
            <p className="mt-5 text-xl leading-relaxed text-cream/80">
              {entry.summary}
            </p>
            <p className="mt-4 text-sm text-cream/75">
              <time dateTime={entry.date}>{formatEntryDate(entry.date)}</time>
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {entry.categories.map((id) => {
                const category = getCategory(id)
                if (!category) return null
                return (
                  <li key={id}>
                    <Link
                      href={`/entries?category=${id}`}
                      className="inline-block border border-cream/25 px-2.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-cream uppercase hover:border-cream"
                    >
                      {category.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        {entry.images.length > 0 ? (
          <div className="mx-auto max-w-6xl space-y-6 px-5 pb-12">
            {entry.images.map((image, index) => {
              const size = localImageSize(image.url)
              const landscape = size ? size.width / size.height > 1.05 : false
              return (
                <figure
                  key={image.url}
                  className={
                    landscape
                      ? "grid max-w-5xl items-end gap-5 lg:grid-cols-[minmax(0,42rem)_16rem] lg:gap-8"
                      : "flex max-w-3xl flex-col gap-5 sm:flex-row sm:items-end sm:gap-8"
                  }
                >
                  <div
                    className={
                      landscape
                        ? "relative aspect-[3/2] w-full bg-[#102038] shadow-[inset_0_0_0_1px_rgba(245,240,230,0.2)]"
                        : "relative aspect-[3/4] w-full max-w-[240px] shrink-0 bg-[#102038] shadow-[inset_0_0_0_1px_rgba(245,240,230,0.2)]"
                    }
                  >
                    <Image
                      src={image.url}
                      alt={image.caption}
                      fill
                      sizes={landscape ? "(min-width: 1024px) 672px, 100vw" : "240px"}
                      className="object-contain p-2"
                      priority={index === 0}
                    />
                  </div>
                  <figcaption className="max-w-sm pb-1 text-sm leading-relaxed text-cream/75">
                    <p className="font-serif text-2xl leading-snug text-cream">{image.caption}</p>
                    <p className="mt-3">{image.credit}</p>
                  </figcaption>
                </figure>
              )
            })}
          </div>
        ) : null}
      </header>

      <div
        className={`mx-auto mt-12 grid max-w-6xl gap-12 px-5 lg:grid-cols-12 ${related.length === 0 ? "pb-16 lg:pb-20" : ""}`}
      >
        <div className="lg:col-span-8">
          <Story markdown={entry.story} />
          <ShameMeter entryId={entry.slug} />

          {entry.videos.length > 0 ? (
            <div className="mt-12 space-y-6">
              <h2 className="font-serif text-3xl">Film</h2>
              {entry.videos.map((video) => {
                const embed = videoEmbedUrl(video.url)
                if (video.thumbnail) {
                  return (
                    <figure key={video.url} className="border border-border bg-paper">
                      <a href={video.url} target="_blank" rel="noopener noreferrer" className="block">
                        <div className="relative aspect-video w-full bg-navy">
                          <Image
                            src={video.thumbnail}
                            alt={video.title}
                            fill
                            sizes="(min-width: 1024px) 640px, 100vw"
                            className="object-cover"
                          />
                        </div>
                      </a>
                      <figcaption className="border-t border-border px-4 py-4">
                        <p className="font-serif text-2xl leading-snug text-navy">{video.title}</p>
                        {video.description ? (
                          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                            {video.description}
                          </p>
                        ) : null}
                        <a
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-4 inline-block text-[11px] font-semibold tracking-[0.16em] text-cardinal uppercase"
                        >
                          Watch on MLB.com
                        </a>
                      </figcaption>
                    </figure>
                  )
                }
                return (
                  <figure key={video.url}>
                    {embed ? (
                      <div className="aspect-video border border-border bg-navy">
                        <iframe
                          src={embed}
                          title={video.title}
                          className="h-full w-full"
                          allow="fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    ) : (
                      <a href={video.url} className="text-cardinal underline-offset-4 hover:underline">
                        {video.title}
                      </a>
                    )}
                    <figcaption className="mt-2 text-sm text-muted-foreground">
                      {video.title}
                      {video.credit ? ` · ${video.credit}` : ""}
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          ) : null}
        </div>

        <aside className="lg:col-span-4">
          <div className="border border-border bg-paper p-5 shadow-[0_0_0_1px_rgba(10,22,40,0.04)] lg:sticky lg:top-32">
            <p className="font-serif text-4xl leading-none tracking-tight">{entry.year}</p>
            <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-muted-foreground uppercase">
              Catalog card
            </p>
            <dl className="mt-4 space-y-4 text-sm">
              <div>
                <dt className="text-muted-foreground">Teams</dt>
                <dd className="mt-1">
                  {entry.teams.map((team, index) => (
                    <span key={team.id}>
                      {index > 0 ? ", " : null}
                      <Link href={`/teams/${team.id}`} className="underline-offset-4 hover:underline">
                        {team.name}
                      </Link>
                    </span>
                  ))}
                </dd>
              </div>
              <Separator />
              <div>
                <dt className="text-muted-foreground">People</dt>
                <dd className="mt-1">
                  {entry.players.map((player, index) => (
                    <span key={player.id}>
                      {index > 0 ? ", " : null}
                      <Link
                        href={`/players/${player.id}`}
                        className="underline-offset-4 hover:underline"
                      >
                        {player.name}
                      </Link>
                    </span>
                  ))}
                </dd>
              </div>
              <Separator />
              <div>
                <dt className="text-muted-foreground">Tags</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {entry.tags.map((tag) => (
                    <Link
                      key={tag}
                      href={`/entries?q=${encodeURIComponent(tag.replaceAll("-", " "))}`}
                      className="border border-border px-2 py-1 text-xs tracking-wide hover:border-navy"
                    >
                      {tag.replaceAll("-", " ")}
                    </Link>
                  ))}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>

      {related.length > 0 ? (
        <section className="mx-auto mt-4 max-w-6xl border-t border-border px-5 pt-12 pb-16 md:pb-20">
          <h2 className="font-serif text-4xl tracking-tight">Related entries</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
            {related.map((item) => (
              <EntryCard key={item.id} entry={item} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}
