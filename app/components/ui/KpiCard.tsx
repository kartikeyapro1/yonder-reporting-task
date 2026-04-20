import { TrendingUp, TrendingDown } from 'lucide-react'

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'flat'
}

export function KpiCard({ label, value, sub, trend }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <p className="text-2xl font-semibold text-gray-900 font-tabular tracking-tight">{value}</p>
        {trend && trend !== 'flat' && (
          <span className={`flex items-center ${
            trend === 'up' ? 'text-positive' : 'text-negative'
          }`}>
            {trend === 'up'
              ? <TrendingUp className="w-3.5 h-3.5" strokeWidth={2.5} />
              : <TrendingDown className="w-3.5 h-3.5" strokeWidth={2.5} />}
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-gray-400 mt-1.5">{sub}</p>}
    </div>
  )
}

