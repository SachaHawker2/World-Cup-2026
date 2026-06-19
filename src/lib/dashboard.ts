import type { Config, ParticipantStanding, Standings, TeamData } from '@/types'
import { getTeamProgressScore } from './utils'

export function fallbackTeam(name: string): TeamData {
    return {
          name,
          fifaRank: null,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          played: 0,
          eliminated: false,
          round: null,
          finishPosition: null,
          nextMatch: null
    }
}

export function prizeRankParticipants(
    standings: ParticipantStanding[],
    teams: Record<string, TeamData>
  ) {
    return [...standings].sort((a, b) => {
          const scoreA = Math.max(...a.teams.map(t => getTeamProgressScore(teams[t] ?? fallbackTeam(t))))
          const scoreB = Math.max(...b.teams.map(t => getTeamProgressScore(teams[t] ?? fallbackTeam(t))))
          return scoreB - scoreA
    })
}

export interface UpcomingMatch {
    team: string
    holder: string
    opponent: string | null
    date: string
    stage: string
    crest?: string
}

export function getUpcomingMatches(config: Config, standings: Standings): UpcomingMatch[] {
    return config.participants
      .flatMap(p =>
              p.teams.flatMap(teamName => {
                        const td = standings.teams[teamName];
                        if (!td || !td.nextMatch) return [];
                        return [{
                                    team: teamName,
                                    holder: p.name,
                                    opponent: td.nextMatch.opponent,
                                    date: td.nextMatch.date,
                                    stage: td.nextMatch.stage,
                                    crest: td.crest
                        }];
              })
                   );
}

export function getDashboardStats(config: Config, standings: Standings) {
    const teams = Object.values(standings.teams)
    const activeTeams = teams.filter(t => !t.eliminated && !t.finishPosition).length
    const matchesPlayed = teams.reduce((sum, t) => sum + t.played, 0)
    const goalsScored = teams.reduce((sum, t) => sum + t.goalsFor, 0)

  return {
        participants: config.participants.length,
        activeTeams,
        totalTeams: teams.length,
        matchesPlayed,
        goalsScored,
        totalPot: standings.prizes.totalPot
  }
}
