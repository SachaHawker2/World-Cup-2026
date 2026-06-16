import type { Participant, TeamData } from '@/types'
import { getStageLabel, formatMatchDate } from '@/lib/utils'

interface ParticipantCardProps {
  participant: Participant
  teams: Record<string, TeamData>
  timezone?: string
}

export default function ParticipantCard({ participant, teams, timezone = 'Europe/London' }: ParticipantCardProps) {
  const teamDataList = participant.teams.map(name => ({ name, data: teams[name] }))
  const primary = teamDataList[0]
  const data = primary?.data
  const hasWinner = teamDataList.some(t => t.data?.finishPosition === 1)
  const isActive = teamDataList.some(t => t.data && !t.data.eliminated && !t.data.finishPosition)

  const statusLabel =
    data?.finishPosition === 1
      ? '🏆 Champion'
      : data?.finishPosition === 2
      ? '🥈 Runner-up'
      : data?.finishPosition === 3
      ? '🥉 3rd'
      : data?.eliminated
      ? `Out · ${getStageLabel(data.round)}`
      : data?.played
      ? getStageLabel(data.round)
      : 'Not started'

  return (
    <div
      className={`rounded-2xl p-5 glass-hover transition-all duration-300 ${
        hasWinner ? 'gold-card animate-glow-pulse' : isActive ? 'glass' : 'glass opacity-60'
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <div className="font-bold text-white text-lg tracking-tight">{participant.name}</div>
          {data?.fifaRank && (
            <div className="text-xs text-green-500/70 font-mono mt-0.5">FIFA #{data.fifaRank}</div>
          )}
        </div>
        {hasWinner && <span className="text-2xl animate-float">🏆</span>}
      </div>

      {primary && (
        <div className="flex items-center gap-3 mb-3">
          {data?.crest && (
            <img src={data.crest} alt={primary.name} className="w-10 h-10 object-contain" />
          )}
          <div className="min-w-0">
            <div className={`font-semibold truncate ${data?.eliminated ? 'text-slate-500 line-through' : 'text-slate-100'}`}>
              {primary.name}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">{statusLabel}</div>
          </div>
        </div>
      )}

      {data && !data.eliminated && !data.finishPosition && (
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-green-500/10 text-center">
          <div>
            <div className="text-lg font-bold text-green-400">{data.goalsFor}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">GF</div>
          </div>
          <div>
            <div className="text-lg font-bold text-red-400">{data.goalsAgainst}</div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">GA</div>
          </div>
          <div>
            <div
              className={`text-lg font-bold ${
                data.goalDifference > 0
                  ? 'text-green-400'
                  : data.goalDifference < 0
                  ? 'text-red-400'
                  : 'text-slate-400'
              }`}
            >
              {data.goalDifference > 0 ? `+${data.goalDifference}` : data.goalDifference}
            </div>
            <div className="text-[10px] text-slate-500 uppercase tracking-wider">GD</div>
          </div>
        </div>
      )}

      {data?.nextMatch && !data.eliminated && !data.finishPosition && (
        <div className="mt-3 pt-3 border-t border-green-500/10 text-xs text-slate-500">
          <span className="text-slate-400">Next:</span> vs {data.nextMatch.opponent}
          <div className="text-slate-600 mt-0.5">{formatMatchDate(data.nextMatch.date, timezone)}</div>
        </div>
      )}
    </div>
  )
}
