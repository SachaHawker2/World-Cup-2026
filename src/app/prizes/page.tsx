import { getConfig, getStandings, formatCurrency } from '@/lib/data'

export default async function PrizesPage() {
  const [config, standings] = await Promise.all([
    Promise.resolve(getConfig()),
    getStandings()
  ])

  const { prizes } = standings
  const n = config.participants.length

  return (
    <div className="space-y-10">
      <div className="animate-fade-up">
        <h1 className="text-4xl font-extrabold tracking-tight">
          <span className="text-gradient-gold">Prize Breakdown</span>
        </h1>
        <p className="text-slate-400 text-sm mt-2">
          {n} participants × {formatCurrency(config.entryFee)} entry = {formatCurrency(prizes.totalPot)} total pot
        </p>
      </div>

      {/* Pot summary */}
      <div className="grid gap-5 sm:grid-cols-2 stagger">
        <div className="rounded-2xl glass glass-hover p-6">
          <div className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">Total Pot</div>
          <div className="text-4xl font-extrabold text-white">{formatCurrency(prizes.totalPot)}</div>
          <div className="text-slate-500 text-xs mt-2">{n} × {formatCurrency(config.entryFee)}</div>
        </div>
        <div className="rounded-2xl gold-card glass-hover p-6 animate-glow-pulse">
          <div className="text-amber-200/60 text-xs uppercase tracking-[0.2em] mb-2">Winner Takes</div>
          <div className="text-4xl font-extrabold text-gradient-gold">{formatCurrency(prizes.remainingPot)}</div>
          <div className="text-amber-200/40 text-xs mt-2">
            {formatCurrency(prizes.totalPot)} − {formatCurrency(config.entryFee)} goals refund
          </div>
        </div>
      </div>

      {/* Prizes */}
      <section className="animate-fade-up" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-sm font-bold text-green-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-green-500/60" />
          Prizes
          <span className="h-px flex-1 bg-gradient-to-r from-green-500/60 to-transparent" />
        </h2>
        <div className="space-y-4">
          <div className="rounded-2xl gold-card glass-hover p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl animate-float">🏆</span>
              <div>
                <div className="font-bold text-white text-lg">Winner</div>
                <div className="text-xs text-amber-200/50 mt-0.5">Holder of the World Cup champion team</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-gradient-gold">{formatCurrency(prizes.remainingPot)}</div>
              {prizes.first.recipient ? (
                <div className="text-sm text-amber-300 mt-1 font-semibold">{prizes.first.recipient}</div>
              ) : (
                <div className="text-xs text-slate-500 mt-1">TBD</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl glass glass-hover p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-3xl">🎯</span>
              <div>
                <div className="font-bold text-white text-lg">Entry Refund</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  Lowest net goal difference (goals scored − goals conceded) across all teams
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-extrabold text-gradient-green">{formatCurrency(prizes.goalsRefund.amount)}</div>
              {prizes.goalsRefund.recipient ? (
                <div className="text-sm text-green-300 mt-1 font-semibold">{prizes.goalsRefund.recipient}</div>
              ) : prizes.goalsRefund.leader ? (
                <div className="text-xs text-slate-400 mt-1">Leading: <span className="text-green-400">{prizes.goalsRefund.leader}</span></div>
              ) : (
                <div className="text-xs text-slate-500 mt-1">TBD</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="animate-fade-up" style={{ animationDelay: '0.35s' }}>
        <h2 className="text-sm font-bold text-green-400 mb-4 uppercase tracking-[0.2em] flex items-center gap-3">
          <span className="h-px w-8 bg-gradient-to-r from-transparent to-green-500/60" />
          How It Works
          <span className="h-px flex-1 bg-gradient-to-r from-green-500/60 to-transparent" />
        </h2>
        <div className="rounded-2xl glass p-6 text-sm text-slate-400 space-y-3 leading-relaxed">
          <p>
            <span className="text-white font-semibold">Winner ({formatCurrency(prizes.remainingPot)})</span> goes to
            the participant whose team wins the World Cup.
          </p>
          <p>
            <span className="text-white font-semibold">Entry refund ({formatCurrency(prizes.goalsRefund.amount)})</span> goes
            to the participant with the lowest cumulative net goal difference (goals scored minus goals conceded)
            across all their teams throughout the tournament.
          </p>
          <p>
            The {formatCurrency(config.entryFee)} refund is deducted first, leaving{' '}
            <span className="text-gradient-gold font-semibold">{formatCurrency(prizes.remainingPot)}</span> for the winner.
          </p>
        </div>
      </section>
    </div>
  )
}
