import Image from "next/image"
import Link from "next/link"
import { Bookmark } from "lucide-react"
import { io } from "next/cache"
import { getAllEntries } from "@/lib/entries"
import { heroImage, heroOfTheDay } from "@/lib/hero-of-the-day"
import { localImageSize } from "@/lib/image-size"

function filedStamp(iso: string) {
  const [year, month, day] = iso.split("-").map(Number)
  if (!year || !month || !day) return null
  const monthLabel = new Intl.DateTimeFormat("en-US", {
    month: "long",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, day)))
  return { year: String(year), when: `${monthLabel} ${day}`.toUpperCase() }
}

export async function HeroCard() {
  await io()
  const lead = heroOfTheDay(getAllEntries(), new Date())
  if (!lead) return null

  const portrait = heroImage(lead)
  if (!portrait) return null

  const size = localImageSize(portrait.url)
  const tall = size !== null && size.height > size.width * 1.15
  const stamp = filedStamp(lead.date)

  return (
    <Link
      href={`/entries/${lead.slug}`}
      className="group block bg-cream p-4 text-navy shadow-[0_28px_50px_-28px_rgba(0,0,0,0.65)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_32px_56px_-26px_rgba(0,0,0,0.75)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream sm:p-5"
    >
      <div className="flex items-center gap-3">
        <p className="text-[11px] font-semibold tracking-[0.18em] text-navy/70 uppercase">
          Featured archive
        </p>
        <span aria-hidden="true" className="h-px min-w-8 flex-1 bg-cardinal" />
      </div>
      <div className="relative mt-3 aspect-[16/10] overflow-hidden bg-[#e6dccb]">
        <Image
          src={portrait.url}
          alt={portrait.caption}
          fill
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className={
            tall
              ? "object-cover object-[center_22%] transition duration-700 ease-out group-hover:scale-[1.03]"
              : "object-cover object-center transition duration-700 ease-out group-hover:scale-[1.03]"
          }
        />
        {stamp ? (
          <p className="absolute bottom-3 left-3 bg-navy px-3 py-2 text-cream">
            <span className="block font-serif text-[1.65rem] leading-none tracking-tight">
              {stamp.year}
            </span>
            <span className="mt-1 block text-[10px] font-semibold tracking-[0.14em]">
              {stamp.when}
            </span>
          </p>
        ) : null}
      </div>
      <h2 className="mt-4 font-serif text-3xl leading-tight tracking-tight md:text-[2rem]">
        {lead.title}
      </h2>
      <p className="mt-2 line-clamp-3 text-[15px] leading-relaxed text-navy/70">{lead.summary}</p>
      <div className="mt-4 flex items-center justify-between gap-4">
        <p className="text-[12px] font-semibold tracking-[0.14em] text-cardinal uppercase group-hover:underline group-hover:underline-offset-4">
          View archive entry
          <span aria-hidden="true"> →</span>
        </p>
        <Bookmark aria-hidden="true" className="size-5 text-cardinal" strokeWidth={1.75} />
      </div>
    </Link>
  )
}

export function HeroCardFallback() {
  return (
    <div className="bg-cream p-4 sm:p-5" aria-hidden="true">
      <div className="h-3 w-36 bg-navy/10" />
      <div className="mt-3 aspect-[16/10] bg-[#e6dccb]" />
      <div className="mt-4 h-8 w-3/4 bg-navy/10" />
      <div className="mt-3 h-4 w-full bg-navy/10" />
      <div className="mt-2 h-4 w-5/6 bg-navy/10" />
    </div>
  )
}
