import { getEntryById, getEraCounts } from "@/lib/entries"
import { eras, getEra } from "@/lib/taxonomy"
import type { EraId } from "@/lib/types"

const chapters: Record<EraId, { introduction: string[]; notable: string[] }> = {
  "dead-ball": {
    introduction: [
      "The dead-ball game was decided on the ground. A missed base, an uncovered plate, or a fly lost in the late innings of a pennant race could finish a season, and the newspapers were glad to give the play a name.",
      "This chapter keeps those names, and the parts of them the box score does not support. Merkle did not touch second. Snodgrass dropped the fly and then made the hard catch. The nickname is the record the public kept. The entry is the other one.",
    ],
    notable: [
      "merkles-boner",
      "snodgrass-muff",
      "zimmerman-chase",
      "schaefer-steals-first",
      "double-no-hitter",
    ],
  },
  "live-ball": {
    introduction: [
      "The ball got livelier in 1920, and the money did too. A franchise could be rearranged in January, and a World Series could turn in one afternoon on a third strike that never reached the mitt.",
      "The entries here are the ones still told as if a single decision built a club, or ended one. Several of them were smaller than the story that followed. The sale of Ruth was a sale. The curse was added later.",
    ],
    notable: [
      "sale-of-babe-ruth",
      "owen-dropped-third-strike",
      "hack-wilson-sun-field",
      "three-men-on-third",
      "ruth-caught-stealing",
    ],
  },
  postwar: {
    introduction: [
      "After the war the game was on the radio, and then on television, and a pennant race could be heard across the country. The famous pitch of these years won a playoff the Giants had already been reading.",
      "Around that homer are the stunts and the baserunning the highlight left uncomplicated. A man three feet seven inches tall walked. A runner scored from first because the relay hesitated. A perfect game lasted twelve innings and was lost in the thirteenth.",
    ],
    notable: [
      "shot-heard-round-the-world",
      "eddie-gaedel",
      "slaughter-scores-from-first",
      "haddix-twelve-innings",
    ],
  },
  expansion: {
    introduction: [
      "New cities got clubs, the draft arrived, and a few owners treated the ballpark as a show. Some of what lasted from these years was a trade made in a hurry. Some of it was a promotion that ended with the umpire giving the game to the visitors.",
      "The chapter is the stretch when the sport got larger and a handful of decisions got harder to defend. Brock left Chicago in June. Ryan left New York in the winter. Cleveland sold beer for a dime, and the field did not stay a field.",
    ],
    notable: [
      "brock-for-broglio",
      "phillies-collapse",
      "robinson-for-pappas",
      "ryan-for-fregosi",
      "ten-cent-beer-night",
    ],
  },
  "free-agency": {
    introduction: [
      "October became a national broadcast, and a ground ball could be shown again for twenty years. Most of these entries come from a series that was an out, or a call, from being over.",
      "Where the retelling put a whole championship on one player, the record says what the inning actually was. Buckner's error came after the lead was gone. Denkinger missed the out, and the Cardinals then missed the rest of the night.",
    ],
    notable: [
      "disco-demolition-night",
      "pine-tar-game",
      "durham-through-the-wicket",
      "denkinger-safe-call",
      "buckner-game-six",
      "lonnie-smith-game-seven",
    ],
  },
  "wild-card": {
    introduction: [
      "Another round of playoffs meant another night when five outs, or one walk to the mound, was the season. The cameras were closer. The person left holding the mistake was sometimes a fan, sometimes a manager, and sometimes the umpire standing on top of the play.",
      "A perfect game ended on a call that replay would later have fixed. A popup in the ninth ended a game the Mets had already won, until they had not. The chapter is the first long stretch of baseball in which almost nothing happened unwitnessed.",
    ],
    notable: [
      "jeffrey-maier",
      "bartman-game",
      "grady-little-game-seven",
      "castillo-popup",
      "galarraga-imperfect-game",
    ],
  },
  modern: {
    introduction: [
      "Replay was meant to end the argument. It ended some of them. The rest stayed with the people who made them: a pitcher taken out of a World Series while he was still in command, a closer who never got up, an infield fly with the bases full.",
      "This chapter is the recent record, close enough that the participants are still watching. The entries are the ones that already have a name, not every loss of the last decade.",
    ],
    notable: [
      "infield-fly-wild-card",
      "showalter-holds-britton",
      "davis-off-chapman",
      "cash-pulls-snell",
      "yankees-fifth-inning",
    ],
  },
}

export function getExhibition(id: string) {
  const era = getEra(id)
  const chapter = chapters[id as EraId]
  if (!era || !chapter) return null

  const entries = chapter.notable.map((slug) => {
    const entry = getEntryById(slug)
    if (!entry) throw new Error(`Exhibition ${id} names missing entry ${slug}.`)
    if (entry.era !== era.id) {
      throw new Error(`Exhibition ${id} includes ${slug}, which is filed under ${entry.era}.`)
    }
    return entry
  })

  const total = getEraCounts().find((item) => item.id === era.id)?.count ?? entries.length
  const index = eras.findIndex((item) => item.id === era.id)

  return {
    era,
    introduction: chapter.introduction,
    entries,
    total,
    previous: index > 0 ? eras[index - 1] : null,
    next: index < eras.length - 1 ? eras[index + 1] : null,
  }
}
