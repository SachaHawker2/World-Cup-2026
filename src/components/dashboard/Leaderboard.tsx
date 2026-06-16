import Link from 'next/link'
import type { ParticipantStanding, Standings, TeamData } from '@/types'
import { formatCurrency, getStageLabel, getTeamProgressScore } from '@/lib/utils'
import { fallbackTeam } from '@/lib/dashboard'

const MEDALS = ['🥇', '🥈', '🥉']

interface LeaderboardProps {
  ranked: ParticipantStanding[]
  teams: Record<string, TeamData>
  prizes: Standings['prizes']
}

export default function Leaderboard({ ranked, teams, prizes }: LeaderboardProps) {
  const top = ranked.slice(0, 5)

  return (
    <div className="rounded-2xl glass p-6 h-full">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-sm font-bold text-green-400 uppercase tracking-[0.2em]">Prize Race</h2>
        <Link href="/standings" className="text-xs text-slate-500 hover:text-green-400 transition-colors">
          Full standings →
        </Link>
      </div>
      <div className="space-y-3">
        {top.map((p, i) => {
          const bestTeam = p.teams
            .map(t => teams[t])
            .filter(Boolean)
            .sort((a, b) => getTeamProgressScore(b) - getTeamProgressScore(a))[0]
          const teamData = bestTeam ?? fallbackTeam(p.teams[0])
          const crest = teams[p.teams[0]]?.crest

          return (
            <div
              key={p.name}
              className={`flex items-center gap-4 rounded-xl px-4 py-3 transition-colors ${
                i === 0 ? 'bg-amber-500/[0.08] ring-1 ring-amber-400/20' : 'bg-green-950/20'
              }`}
            >
              <span className="w-8 text-center text-lg shrink-0">
                {i < 3 ? MEDALS[i] : <span className="text-slate-500 text-sm font-medium">{i + 1}</span>}
              </span>
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {crest && <img src={crest} alt="" className="w-7 h-7 object-contain shrink-0" />}
                <div className="min-w-0">
                  <div className="font-semibold text-white truncate">{p.name}</div>
                  <div className="text-xs text-slate-500 truncate">{p.teams.join(', ')}</div>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs text-slate-400">
                  {teamData.finishPosition === 1
                    ? 'Champion'
                    : getStageLabel(
                        teamData.finishPosition != null
                          ? teamData.finishPosition <= 2
                            ? 'FINAL'
                            : 'THIRD_PLACE'
                          : teamData.round
                      )}
                </div>
                {i === 0 && (
                  <div className="text-sm font-bold text-gradient-gold mt-0.5">
                    {formatCurrency(prizes.first.amount)}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
