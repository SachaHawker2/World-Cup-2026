import type { UpcomingMatch } from '@/lib/dashboard'
import { formatMatchDate, getStageLabel } from '@/lib/utils'

interface UpcomingMatchesProps {
  matches: UpcomingMatch[]
  timezone?: string
}

export default function UpcomingMatches({ matches, timezone = 'Europe/London' }: UpcomingMatchesProps) {
  if (matches.length === 0) {
    return (
      <div className="rounded-2xl glass p-6 text-center text-slate-500 text-sm">
        No upcoming fixtures scheduled
      </div>
    )
  }

  return (
    <div className="rounded-2xl glass p-6">
      <h2 className="text-sm font-bold text-green-400 uppercase tracking-[0.2em] mb-5">Upcoming Fixtures</h2>
      <div className="space-y-3">
        {matches.slice(0, 6).map(m => (
          <div
            key={`${m.team}-${m.date}`}
            className="flex items-center gap-4 rounded-xl bg-green-950/20 px-4 py-3 row-hover"
          >
            {m.crest && <img src={m.crest} alt={m.team} className="w-6 h-6 object-contain shrink-0" />}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium text-white">
                {m.team} <span className="text-slate-500 font-normal">vs</span> {m.opponent}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {m.holder} · {getStageLabel(m.stage)}
              </div>
            </div>
            <div className="text-xs text-slate-400 text-right shrink-0">
              {formatMatchDate(m.date, timezone)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
