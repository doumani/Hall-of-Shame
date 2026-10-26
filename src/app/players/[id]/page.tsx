import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { RosterRecord } from "@/components/roster-record"
import { getPlayer, getPlayers } from "@/lib/entries"

type Props = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return getPlayers().map((player) => ({ id: player.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const player = getPlayer(id)
  if (!player) return { title: "Not in the catalog" }

  const description = `Catalog entries that name ${player.name}.`

  return {
    title: player.name,
    description,
    openGraph: { title: player.name, description },
  }
}

export const instant = false

export default async function PlayerPage({ params }: Props) {
  const { id } = await params
  const player = getPlayer(id)
  if (!player) notFound()

  return <RosterRecord group={player} kind="player" />
}
