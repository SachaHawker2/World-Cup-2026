import type { ParticipantStanding } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface GoalsRaceProps {
  ranked: ParticipantStanding[]
  refundAmount: number
}

export default function GoalsRace({ ranked, refundAmount }: GoalsRaceProps) {
  const maxAbsGd = Math.max(...ranked.map(p => Math.abs(p.netGoalDifference)), 1)

  return (
    <div className="rounded-2xl glass p-6">
      <h2 className="text-sm font-bold text-green-400 uppercase tracking-[0.2em] mb-1">Goals Refund Race</h2>
      <p className="text-xs text-slate-500 mb-5">Lowest net GD wins {formatCurrency(refundAmount)} back</p>
      <div className="space-y-3">
        {ranked.map((p, i) => {
          const barWidth = Math.max(8, (Math.abs(p.netGoalDifference) / maxAbsGd) * 100)
          const isLeader = i === 0

          return (
            <div key={p.name} className="group">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <span className={`font-medium ${isLeader ? 'text-green-300' : 'text-slate-300'}`}>
                  {p.name}
                  {isLeader && (
                    <span className="ml-2 text-[10px] bg-green-500/15 text-green-400 px-2 py-0.5 rounded-full ring-1 ring-green-400/30">
                      Leading
                    </span>
                  )}
                </span>
                <span
                  className={`font-mono text-xs font-bold ${
                    p.netGoalDifference < 0
                      ? 'text-red-400'
                      : p.netGoalDifference > 0
                      ? 'text-green-400'
                      : 'text-slate-400'
                  }`}
                >
                  {p.netGoalDifference > 0 ? `+${p.netGoalDifference}` : p.netGoalDifference}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-800/80 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    p.netGoalDifference < 0
                      ? 'bg-gradient-to-r from-red-600/80 to-red-400/60'
                      : p.netGoalDifference > 0
                      ? 'bg-gradient-to-r from-green-700/80 to-green-400/60'
                      : 'bg-slate-600/60'
                  }`}
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
