import Image from "next/image"
import Link from "next/link"
import { io } from "next/cache"
import { getAllEntries } from "@/lib/entries"
import { catalogNumber, formatEntryDate } from "@/lib/format"
import { heroImage, heroOfTheDay } from "@/lib/hero-of-the-day"
import { localImageSize } from "@/lib/image-size"

export async function HeroCard() {
  await io()
  const lead = heroOfTheDay(getAllEntries(), new Date())
  if (!lead) return null

  const portrait = heroImage(lead)
  if (!portrait) return null

  const size = localImageSize(portrait.url)
  const tall = size !== null && size.height > size.width * 1.15
  const filing = [lead.teams[0]?.name, formatEntryDate(lead.date)].filter(Boolean).join(" • ")

  return (
    <Link
      href={`/entries/${lead.slug}`}
      className="group mx-auto block w-full max-w-md rounded-xl border-2 border-[#7c624c] bg-cream px-4 py-3 text-center text-navy shadow-[0_28px_60px_-32px_rgba(0,0,0,0.7)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream sm:px-5"
    >
      <p className="text-[12px] font-semibold tracking-[0.16em] text-navy/80">
        No. {catalogNumber(lead.date)}
      </p>
      <div className="relative mx-auto mt-2 h-36 w-full overflow-hidden border border-navy/20 bg-[#e6dccb] sm:h-40">
        <Image
          src={portrait.url}
          alt={portrait.caption}
          fill
          priority
          sizes="(min-width: 1024px) 420px, 90vw"
          className={tall ? "object-cover object-[center_42%]" : "object-cover object-center"}
        />
      </div>
      <p className="mt-2 font-serif text-3xl leading-none tracking-tight text-cardinal">{lead.year}</p>
      <h2 className="mt-1 font-serif text-2xl leading-tight tracking-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4">
        {lead.title}
      </h2>
      {filing ? <p className="mt-1 text-sm text-navy/75">{filing}</p> : null}
    </Link>
  )
}

export function HeroCardFallback() {
  return (
    <div
      className="mx-auto w-full max-w-md rounded-xl border-2 border-[#7c624c] bg-cream px-4 py-3 sm:px-5"
      aria-hidden="true"
    >
      <div className="mx-auto h-3 w-28 bg-navy/10" />
      <div className="mt-2 h-36 w-full bg-[#e6dccb] sm:h-40" />
      <div className="mx-auto mt-2 h-8 w-16 bg-cardinal/15" />
      <div className="mx-auto mt-2 h-6 w-48 bg-navy/10" />
    </div>
  )
}
