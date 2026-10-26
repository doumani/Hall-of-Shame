import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { RosterRecord } from "@/components/roster-record"
import { getTeam, getTeams } from "@/lib/entries"

type Props = { params: Promise<{ id: string }> }

export function generateStaticParams() {
  return getTeams().map((team) => ({ id: team.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const team = getTeam(id)
  if (!team) return { title: "Not in the catalog" }

  const description = `Catalog entries that name the ${team.name}.`

  return {
    title: team.name,
    description,
    openGraph: { title: team.name, description },
  }
}

export const instant = false

export default async function TeamPage({ params }: Props) {
  const { id } = await params
  const team = getTeam(id)
  if (!team) notFound()

  return <RosterRecord group={team} kind="team" />
}
