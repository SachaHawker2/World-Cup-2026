interface StatCardProps {
  label: string
  value: string
  detail?: string
  accent?: 'green' | 'gold' | 'default'
}

export default function StatCard({ label, value, detail, accent = 'default' }: StatCardProps) {
  const valueClass =
    accent === 'gold'
      ? 'text-gradient-gold'
      : accent === 'green'
      ? 'text-gradient-green'
      : 'text-white'

  return (
    <div className="rounded-2xl glass glass-hover p-5">
      <div className="text-slate-400 text-xs uppercase tracking-[0.2em] mb-2">{label}</div>
      <div className={`text-3xl font-extrabold ${valueClass}`}>{value}</div>
      {detail && <div className="text-slate-500 text-xs mt-2">{detail}</div>}
    </div>
  )
}
