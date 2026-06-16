import Link from 'next/link'
import type { Standings } from '@/types'
import { formatCurrency } from '@/lib/utils'

interface PrizeWidgetProps {
  prizes: Standings['prizes']
}

export default function PrizeWidget({ prizes }: PrizeWidgetProps) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="rounded-2xl gold-card glass-hover p-6 flex-1 animate-glow-pulse">
        <div className="text-amber-200/60 text-xs uppercase tracking-[0.2em] mb-2">Winner Takes</div>
        <div className="text-4xl font-extrabold text-gradient-gold">{formatCurrency(prizes.remainingPot)}</div>
        {prizes.first.recipient ? (
          <div className="text-sm text-amber-300 mt-2 font-semibold">🏆 {prizes.first.recipient}</div>
        ) : (
          <div className="text-xs text-amber-200/40 mt-2">Holder of the champion team</div>
        )}
      </div>

      <div className="rounded-2xl glass glass-hover p-6">
        <div className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">Goals Refund</div>
        <div className="text-2xl font-extrabold text-gradient-green">
          {formatCurrency(prizes.goalsRefund.amount)}
        </div>
        {prizes.goalsRefund.recipient ? (
          <div className="text-sm text-green-300 mt-2 font-semibold">{prizes.goalsRefund.recipient}</div>
        ) : prizes.goalsRefund.leader ? (
          <div className="text-xs text-slate-400 mt-2">
            Leading: <span className="text-green-400 font-medium">{prizes.goalsRefund.leader}</span>
          </div>
        ) : (
          <div className="text-xs text-slate-500 mt-2">Lowest net goal difference</div>
        )}
      </div>

      <Link
        href="/prizes"
        className="block text-center text-xs text-slate-500 hover:text-green-400 transition-colors py-2"
      >
        Prize breakdown →
      </Link>
    </div>
  )
}
