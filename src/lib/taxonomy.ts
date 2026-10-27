import type { CategoryId, EraId, SortId } from "@/lib/types"

export interface Category {
  id: CategoryId
  label: string
  description: string
}

export interface Era {
  id: EraId
  label: string
  years: string
  start: number
  end: number
  description: string
}

export const categories: Category[] = [
  {
    id: "baserunning",
    label: "Baserunning Blunders",
    description: "Missed bases, frozen leads, and runs that never came around to score.",
  },
  {
    id: "fielding",
    label: "Fielding Fiascos",
    description: "Balls lost in the sun, dropped in the glove, or allowed to roll on through.",
  },
  {
    id: "pitching",
    label: "Pitching Disasters",
    description: "One pitch, or one inning, that undid an afternoon of good work.",
  },
  {
    id: "hitting-mental",
    label: "Hitting & Mental Lapses",
    description: "The moment a player lost the ball, the strike zone, or the plot.",
  },
  {
    id: "umpire",
    label: "Umpire Controversies",
    description: "Calls the replay settled, and calls the rulebook could not.",
  },
  {
    id: "managerial",
    label: "Managerial Decisions",
    description: "The visit to the mound, the short rest, the substitution that never came.",
  },
  {
    id: "front-office",
    label: "Front Office & Trades",
    description: "Deals that look obvious now and looked reasonable on the day they were made.",
  },
  {
    id: "promotions",
    label: "Promotions & Ballpark Events",
    description: "Stunts, beer, and the nights a ballpark stopped being a ballpark.",
  },
  {
    id: "fan-crowd",
    label: "Fan & Crowd Moments",
    description: "Hands over the wall, fruit from the stands, and scapegoats in the seats.",
  },
  {
    id: "rules",
    label: "Rules & Quirks",
    description: "Pine tar, cork, and the plays that forced the rulebook to catch up.",
  },
  {
    id: "personalities",
    label: "Personalities & Off-field",
    description: "The human beings inside the uniform, caught in a moment they could not take back.",
  },
]

export const eras: Era[] = [
  {
    id: "dead-ball",
    label: "Dead Ball Era",
    years: "1900–1919",
    start: 1900,
    end: 1919,
    description: "Low scoring, aggressive baserunning, and the first modern scapegoats.",
  },
  {
    id: "live-ball",
    label: "Live Ball Era",
    years: "1920–1945",
    start: 1920,
    end: 1945,
    description: "The lively ball, the Yankees' rise, and World Series played in daylight.",
  },
  {
    id: "postwar",
    label: "Postwar Era",
    years: "1946–1960",
    start: 1946,
    end: 1960,
    description: "Integration, television, and a pennant that turned on one pitch.",
  },
  {
    id: "expansion",
    label: "Expansion Era",
    years: "1961–1976",
    start: 1961,
    end: 1976,
    description: "New franchises, the amateur draft, and promotions that got away.",
  },
  {
    id: "free-agency",
    label: "Free Agency Era",
    years: "1977–1993",
    start: 1977,
    end: 1993,
    description: "October became a television event, and so did the mistakes.",
  },
  {
    id: "wild-card",
    label: "Wild Card Era",
    years: "1994–2011",
    start: 1994,
    end: 2011,
    description: "More playoff games, more cameras, and less room to hide a misplay.",
  },
  {
    id: "modern",
    label: "Modern Era",
    years: "2012–present",
    start: 2012,
    end: 2100,
    description: "Replay, challenges, and the calls that still belong to a human being.",
  },
]

export const sorts: { id: SortId; label: string }[] = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
  { id: "title", label: "Title A–Z" },
  { id: "shame", label: "Highest shame" },
]

export function getCategory(id: string) {
  return categories.find((category) => category.id === id)
}

export function getEra(id: string) {
  return eras.find((era) => era.id === id)
}
