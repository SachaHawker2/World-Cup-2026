import { getConfig, getStandings, formatCurrency, getStageLabel, getTeamProgressScore } from '@/lib/data'
import { fallbackTeam, prizeRankParticipants } from '@/lib/dashboard'

const PRIZE_MEDAL = ['🥇', '🥈', '🥉']

export default async function StandingsPage() {
  const [config, standings] = await Promise.all([
    Promise.resolve(getConfig()),
    getStandings()
  ])

  const prizeRanked = prizeRankParticipants(standings.participantStandings, standings.teams)
  const goalsRanked = [...standings.participantStandings].sort(
    (a, b) => a.netGoalDifference - b.netGoalDifference
  )

  const lastUpdated = new Date(standings.lastUpdated).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  })

  return (
    <div className="space-y-12">
      <div className="animate-fade-up">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-gradient-green">Standings</span>
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          Full tournament tables · Last updated {lastUpdated}
        </p>
      </div>

      <section className="animate-fade-up" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-sm font-bold text-green-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-green-500/60" />
          Prize Standings
          <span className="h-px flex-1 bg-gradient-to-r from-green-500/60 to-transparent" />
        </h2>
        <div className="overflow-x-auto rounded-2xl glass">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-left border-b border-green-500/20 bg-green-950/30">
                <th className="px-4 py-3.5 w-8 font-medium">#</th>
                <th className="px-4 py-3.5 font-medium">Participant</th>
                <th className="px-4 py-3.5 font-medium">Teams</th>
                <th className="px-4 py-3.5 text-right font-medium">Best Stage</th>
                <th className="px-4 py-3.5 text-right font-medium">Potential Prize</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-500/10 stagger">
              {prizeRanked.map((p, i) => {
                const bestTeam = p.teams
                  .map(t => standings.teams[t])
                  .filter(Boolean)
                  .sort((a, b) => getTeamProgressScore(b) - getTeamProgressScore(a))[0]

                const potentialPrize = i === 0 ? standings.prizes.first : null

                return (
                  <tr key={p.name} className={`row-hover ${i === 0 ? 'bg-amber-500/[0.04]' : ''}`}>
                    <td className="px-4 py-3.5 text-xl">
                      {i === 0 ? <span className="inline-block animate-float">{PRIZE_MEDAL[0]}</span> : <span className="text-slate-500 text-sm">{i + 1}</span>}
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-white">{p.name}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {p.teams.map(t => {
                          const td = standings.teams[t]
                          return (
                            <span
                              key={t}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 ${
                                td?.finishPosition === 1
                                  ? 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.25)]'
                                  : td?.eliminated
                                  ? 'bg-slate-800/60 text-slate-500 line-through'
                                  : 'bg-green-500/10 text-green-300 ring-1 ring-green-500/20'
                              }`}
                            >
                              {td?.crest && <img src={td.crest} alt={t} className="w-3.5 h-3.5 object-contain" />}
                              {t}
                            </span>
                          )
                        })}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right text-slate-300">
                      {bestTeam ? getStageLabel(bestTeam.finishPosition != null
                        ? (bestTeam.finishPosition === 1 ? 'FINAL' : bestTeam.finishPosition === 2 ? 'FINAL' : 'THIRD_PLACE')
                        : bestTeam.round) : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold">
                      {potentialPrize
                        ? <span className="text-gradient-gold text-base">{formatCurrency(potentialPrize.amount)}</span>
                        : <span className="text-slate-600">—</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-sm font-bold text-green-400 mb-1 uppercase tracking-[0.2em] flex items-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-green-500/60" />
          Goals Tracker
          <span className="h-px flex-1 bg-gradient-to-r from-green-500/60 to-transparent" />
        </h2>
        <p className="text-slate-500 text-xs mb-4 ml-11">
          Lowest net goal difference (scored − conceded) wins £{config.entryFee} entry refund
        </p>
        <div className="overflow-x-auto rounded-2xl glass">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-left border-b border-green-500/20 bg-green-950/30">
                <th className="px-4 py-3.5 w-8 font-medium">#</th>
                <th className="px-4 py-3.5 font-medium">Participant</th>
                <th className="px-4 py-3.5 text-right font-medium">Goals For</th>
                <th className="px-4 py-3.5 text-right font-medium">Goals Against</th>
                <th className="px-4 py-3.5 text-right font-medium">Net GD</th>
                <th className="px-4 py-3.5 text-right font-medium">Refund?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-500/10 stagger">
              {goalsRanked.map((p, i) => (
                <tr key={p.name} className={`row-hover ${i === 0 ? 'bg-green-500/[0.04]' : ''}`}>
                  <td className="px-4 py-3.5 text-slate-400 text-sm">{i + 1}</td>
                  <td className="px-4 py-3.5 font-semibold text-white">{p.name}</td>
                  <td className="px-4 py-3.5 text-right text-green-400 font-medium">{p.totalGoalsFor}</td>
                  <td className="px-4 py-3.5 text-right text-red-400 font-medium">{p.totalGoalsAgainst}</td>
                  <td className={`px-4 py-3.5 text-right font-bold text-base ${
                    p.netGoalDifference < 0 ? 'text-red-400' :
                    p.netGoalDifference === 0 ? 'text-slate-400' : 'text-green-400'
                  }`}>
                    {p.netGoalDifference > 0 ? `+${p.netGoalDifference}` : p.netGoalDifference}
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    {i === 0 ? (
                      <span className="text-xs bg-green-500/15 text-green-300 px-3 py-1 rounded-full ring-1 ring-green-400/40 shadow-[0_0_12px_rgba(34,197,94,0.2)] font-semibold">
                        £{config.entryFee} ✓
                      </span>
                    ) : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-sm font-bold text-green-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-green-500/60" />
          Team Status
          <span className="h-px flex-1 bg-gradient-to-r from-green-500/60 to-transparent" />
        </h2>
        <div className="overflow-x-auto rounded-2xl glass">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-left border-b border-green-500/20 bg-green-950/30">
                <th className="px-4 py-3.5 font-medium">Team</th>
                <th className="px-4 py-3.5 font-medium">Holder</th>
                <th className="px-4 py-3.5 text-right font-medium">P</th>
                <th className="px-4 py-3.5 text-right font-medium">GF</th>
                <th className="px-4 py-3.5 text-right font-medium">GA</th>
                <th className="px-4 py-3.5 text-right font-medium">GD</th>
                <th className="px-4 py-3.5 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-green-500/10">
              {config.participants.flatMap(p =>
                p.teams.map(teamName => {
                  const td = standings.teams[teamName]
                  const holder = p.name
                  return { teamName, td, holder }
                })
              ).sort((a, b) => {
                const sa = getTeamProgressScore(a.td ?? fallbackTeam(a.teamName))
                const sb = getTeamProgressScore(b.td ?? fallbackTeam(b.teamName))
                return sb - sa
              }).map(({ teamName, td, holder }) => (
                <tr key={teamName} className="row-hover">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 font-medium text-white">
                      {td?.crest && <img src={td.crest} alt={teamName} className="w-5 h-5 object-contain" />}
                      {teamName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-400">{holder}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{td?.played ?? 0}</td>
                  <td className="px-4 py-3 text-right text-green-400">{td?.goalsFor ?? 0}</td>
                  <td className="px-4 py-3 text-right text-red-400">{td?.goalsAgainst ?? 0}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${
                    (td?.goalDifference ?? 0) > 0 ? 'text-green-400' :
                    (td?.goalDifference ?? 0) < 0 ? 'text-red-400' : 'text-slate-400'
                  }`}>
                    {(td?.goalDifference ?? 0) > 0 ? `+${td?.goalDifference}` : (td?.goalDifference ?? 0)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {td?.finishPosition === 1 ? (
                      <span className="text-xs bg-amber-500/15 text-amber-300 px-3 py-1 rounded-full ring-1 ring-amber-400/50 shadow-[0_0_12px_rgba(251,191,36,0.25)]">🏆 Champion</span>
                    ) : td?.finishPosition === 2 ? (
                      <span className="text-xs bg-slate-500/15 text-slate-300 px-3 py-1 rounded-full ring-1 ring-slate-400/30">🥈 Runner-up</span>
                    ) : td?.finishPosition === 3 ? (
                      <span className="text-xs bg-orange-900/25 text-orange-400 px-3 py-1 rounded-full ring-1 ring-orange-500/30">🥉 3rd Place</span>
                    ) : td?.eliminated ? (
                      <span className="text-xs text-slate-600">Out ({getStageLabel(td.round)})</span>
                    ) : (
                      <span className="text-xs bg-green-500/10 text-green-400 px-3 py-1 rounded-full ring-1 ring-green-500/25">
                        {getStageLabel(td?.round ?? null) !== '—' ? getStageLabel(td?.round ?? null) : 'Active'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
