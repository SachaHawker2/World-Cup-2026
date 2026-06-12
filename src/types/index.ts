export interface Participant {
  name: string
  teams: string[]
}

export interface Config {
  tournament: string
  entryFee: number
  prizeSplit: [number]
  participants: Participant[]
}

export interface NextMatch {
  date: string
  opponent: string | null
  stage: string
}

export interface TeamData {
  id?: number
  name: string
  crest?: string
  fifaRank: number | null
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  played: number
  eliminated: boolean
  round: string | null
  finishPosition: number | null
  nextMatch: NextMatch | null
}

export interface ParticipantStanding {
  name: string
  teams: string[]
  totalGoalsFor: number
  totalGoalsAgainst: number
  netGoalDifference: number
  bestFinishPosition: number | null
  prizePosition: 1 | null
}

export interface PrizeAllocation {
  recipient: string | null
  amount: number
}

export interface Prizes {
  totalPot: number
  goalsRefund: PrizeAllocation & { leader: string | null }
  remainingPot: number
  first: PrizeAllocation
}

export interface Standings {
  lastUpdated: string
  teams: Record<string, TeamData>
  participantStandings: ParticipantStanding[]
  prizes: Prizes
}
