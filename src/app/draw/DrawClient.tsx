'use client'

import { useState, useEffect } from 'react'
import type { Config, Standings } from '@/types'
import { getStageLabel, formatMatchDate } from '@/lib/utils'

interface Props {
  config: Config
  standings: Standings
}

export default function DrawClient({ config, standings }: Props) {
  const [showRankings, setShowRankings] = useState(false)
  const [timezone, setTimezone] = useState('Europe/London')

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  const totalTeams = config.participants.reduce((s, p) => s + p.teams.length, 0)

  return (
    <div className="space-y-10">
      <div className="flex items-start justify-between gap-4 animate-fade-up">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight">
            <span className="text-gradient-green">The Draw</span>
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            {config.participants.length} participants · {totalTeams} teams in draw
          </p>
        </div>
        <button
          onClick={() => setShowRankings(r => !r)}
          className={`shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border ${
            showRankings
              ? 'bg-green-500/15 border-green-400/50 text-green-300 shadow-[0_0_18px_rgba(34,197,94,0.25)]'
              : 'glass border-green-900/50 text-slate-400 hover:text-white hover:border-green-500/40'
          }`}
        >
          <span
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${
              showRankings ? 'bg-green-500' : 'bg-slate-700'
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-300 ${
                showRankings ? 'translate-x-[18px]' : 'translate-x-[3px]'
              }`}
            />
          </span>
          FIFA Rankings
        </button>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 stagger">
        {config.participants.map(p => {
          const teamDataList = p.teams.map(name => ({
            name,
            data: standings.teams[name]
          }))

          const isActive = teamDataList.some(t => t.data && !t.data.eliminated)
          const hasWinner = teamDataList.some(t => t.data?.finishPosition === 1)

          return (
            <div
              key={p.name}
              className={`rounded-2xl p-5 glass-hover ${
                hasWinner
                  ? 'gold-card animate-glow-pulse'
                  : isActive
                  ? 'glass'
                  : 'glass opacity-50 saturate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-green-500/10">
                <span className="font-bold text-white text-lg tracking-tight">{p.name}</span>
                {hasWinner && <span className="text-xl animate-float">🏆</span>}
              </div>

              <div className="space-y-3">
                {teamDataList.map(({ name, data }) => {
                  const statusLabel =
                    data?.finishPosition === 1 ? '🏆 Champion' :
                    data?.finishPosition === 2 ? '🥈 Runner-up' :
                    data?.finishPosition === 3 ? '🥉 3rd' :
                    data?.eliminated ? `Out (${getStageLabel(data.round)})` :
                    data?.played ? getStageLabel(data.round) : 'Not started'

                  return (
                    <div key={name} className="group">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {data?.crest && (
                            <img
                              src={data.crest}
                              alt={name}
                              className="w-5 h-5 object-contain shrink-0 transition-transform duration-300 group-hover:scale-125"
                            />
                          )}
                          <span className={`truncate ${data?.eliminated ? 'text-slate-600 line-through' : 'text-slate-200 group-hover:text-white transition-colors'}`}>
                            {name}
                          </span>
                          <span
                            className={`text-xs text-green-500/80 font-mono shrink-0 overflow-hidden transition-all duration-500 ${
                              showRankings && data?.fifaRank ? 'max-w-[3rem] opacity-100' : 'max-w-0 opacity-0'
                            }`}
                          >
                            #{data?.fifaRank}
                          </span>
                        </div>
                        <span className="text-xs text-slate-500 ml-2 text-right shrink-0">{statusLabel}</span>
                      </div>

                      {data?.nextMatch && !data.eliminated && (
                        <div className="mt-1 ml-[30px] text-xs text-slate-600 group-hover:text-slate-500 transition-colors">
                          Next: vs {data.nextMatch.opponent} · {formatMatchDate(data.nextMatch.date, timezone)}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {config.participants.some(p => p.teams.length === 0) && (
        <div className="rounded-2xl glass border-yellow-700/40 px-5 py-4 text-yellow-400 text-sm">
          Team assignments are not yet configured. Edit <code className="font-mono text-xs bg-yellow-900/30 px-1.5 py-0.5 rounded">data/config.json</code>.
        </div>
      )}
    </div>
  )
}
