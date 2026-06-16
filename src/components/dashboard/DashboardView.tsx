'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import type { Config, Standings } from '@/types'
import { formatCurrency } from '@/lib/utils'
import {
  getDashboardStats,
  getUpcomingMatches,
  prizeRankParticipants
} from '@/lib/dashboard'
import StatCard from '@/components/dashboard/StatCard'
import Leaderboard from '@/components/dashboard/Leaderboard'
import PrizeWidget from '@/components/dashboard/PrizeWidget'
import ParticipantCard from '@/components/dashboard/ParticipantCard'
import UpcomingMatches from '@/components/dashboard/UpcomingMatches'
import GoalsRace from '@/components/dashboard/GoalsRace'

interface Props {
  config: Config
  standings: Standings
}

export default function DashboardView({ config, standings }: Props) {
  const [timezone, setTimezone] = useState('Europe/London')

  useEffect(() => {
    setTimezone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  const stats = getDashboardStats(config, standings)
  const prizeRanked = prizeRankParticipants(standings.participantStandings, standings.teams)
  const goalsRanked = [...standings.participantStandings].sort(
    (a, b) => a.netGoalDifference - b.netGoalDifference
  )
  const upcoming = getUpcomingMatches(config, standings)

  const lastUpdated = new Date(standings.lastUpdated).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl glass px-6 py-10 sm:px-10 sm:py-12 animate-fade-up">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-amber-500/5 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-green-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
          <div>
            <div className="text-xs font-semibold tracking-[0.3em] text-green-500/70 uppercase mb-3">
              The Beautiful Game · The Beautiful Pot
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              <span className="text-gradient-gold">{config.tournament}</span>
            </h1>
            <p className="text-slate-400 text-sm mt-4 max-w-xl leading-relaxed">
              {stats.participants} players · one team each · {formatCurrency(stats.totalPot)} prize pool.
              Track the race for the World Cup and the goals refund in real time.
            </p>
            <p className="text-slate-500 text-xs mt-4 flex items-center gap-2">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              Last updated {lastUpdated}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {[
              { href: '/draw', label: 'The Draw', icon: '🎲' },
              { href: '/standings', label: 'Standings', icon: '📊' },
              { href: '/prizes', label: 'Prizes', icon: '🏆' }
            ].map(({ href, label, icon }) => (
              <Link
                key={href}
                href={href}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold glass glass-hover border border-green-500/20 text-slate-300 hover:text-white hover:border-green-400/40 transition-all"
              >
                <span>{icon}</span>
                {label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4 animate-fade-up stagger">
        <StatCard
          label="Prize Pool"
          value={formatCurrency(stats.totalPot)}
          detail={`${stats.participants} × ${formatCurrency(config.entryFee)} entry`}
          accent="gold"
        />
        <StatCard
          label="Participants"
          value={String(stats.participants)}
          detail={`${stats.totalTeams} teams in play`}
          accent="green"
        />
        <StatCard
          label="Active Teams"
          value={String(stats.activeTeams)}
          detail={`${stats.totalTeams - stats.activeTeams} eliminated or finished`}
        />
        <StatCard
          label="Goals Scored"
          value={String(stats.goalsScored)}
          detail={`${stats.matchesPlayed} matches played`}
        />
      </section>

      {/* Leaderboard + Prize */}
      <section className="grid gap-6 lg:grid-cols-3 animate-fade-up">
        <div className="lg:col-span-2">
          <Leaderboard ranked={prizeRanked} teams={standings.teams} prizes={standings.prizes} />
        </div>
        <PrizeWidget prizes={standings.prizes} />
      </section>

      {/* Participants */}
      <section className="animate-fade-up">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-bold text-green-400 uppercase tracking-[0.2em] flex items-center gap-3">
            <span className="h-px w-8 bg-gradient-to-r from-transparent to-green-500/60" />
            The Draw
            <span className="h-px flex-1 max-w-24 bg-gradient-to-r from-green-500/60 to-transparent" />
          </h2>
          <Link href="/draw" className="text-xs text-slate-500 hover:text-green-400 transition-colors">
            View all →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger">
          {config.participants.map(p => (
            <ParticipantCard
              key={p.name}
              participant={p}
              teams={standings.teams}
              timezone={timezone}
            />
          ))}
        </div>
      </section>

      {/* Goals race + Fixtures */}
      <section className="grid gap-6 lg:grid-cols-2 animate-fade-up">
        <GoalsRace ranked={goalsRanked} refundAmount={standings.prizes.goalsRefund.amount} />
        <UpcomingMatches matches={upcoming} timezone={timezone} />
      </section>
    </div>
  )
}
