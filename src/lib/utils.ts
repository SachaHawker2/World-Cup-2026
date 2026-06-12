import type { TeamData } from '@/types'

export function formatCurrency(amount: number): string {
  return `£${amount.toFixed(2)}`
}

export function formatMatchDate(dateStr: string, timeZone = 'Europe/London'): string {
  return new Date(dateStr).toLocaleString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone,
    timeZoneName: 'short'
  })
}

export function getStageLabel(round: string | null): string {
  const labels: Record<string, string> = {
    GROUP_STAGE: 'Group Stage',
    ROUND_OF_32: 'Round of 32',
    ROUND_OF_16: 'Round of 16',
    QUARTER_FINALS: 'Quarter-Finals',
    SEMI_FINALS: 'Semi-Finals',
    THIRD_PLACE: '3rd Place',
    FINAL: 'Final'
  }
  return round ? (labels[round] ?? round) : '—'
}

const STAGE_RANK: Record<string, number> = {
  GROUP_STAGE: 1,
  ROUND_OF_32: 2,
  ROUND_OF_16: 3,
  QUARTER_FINALS: 4,
  SEMI_FINALS: 5,
  THIRD_PLACE: 6,
  FINAL: 7
}

export function getTeamProgressScore(team: TeamData): number {
  if (team.finishPosition === 1) return 100
  if (team.finishPosition === 2) return 90
  if (team.finishPosition === 3) return 80
  const base = STAGE_RANK[team.round ?? ''] ?? 0
  return team.eliminated ? base * 10 : base * 10 + 5
}
