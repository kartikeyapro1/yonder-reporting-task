import { TrendingUp, TrendingDown } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'flat'
}

export function KpiCard({ label, value, sub, trend }: KpiCardProps) {
  return (
    <div className="py-4">
      <p className="text-[11px] font-medium text-ink-400 mb-2 leading-none">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <p className="text-[1.65rem] font-display font-semibold text-ink-900 font-tabular leading-none tracking-tight">{value}</p>
        {trend && trend !== 'flat' && (
          <span className={`flex items-center mb-0.5 ${
            trend === 'up' ? 'text-positive' : 'text-negative'
          }`}>
            {trend === 'up'
              ? <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
              : <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.5} />}
          </span>
        )}
      </div>
      {sub && <p className="text-[11px] text-ink-300 mt-1.5">{sub}</p>}
    </div>
  )
}

