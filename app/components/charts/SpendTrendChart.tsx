'use client'

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts'
import type { PartnerMonthlyMetrics } from '@/lib/types'

interface SpendTrendChartProps {
  data: PartnerMonthlyMetrics[]
  metric?: 'spend' | 'revenue' | 'transactions'
  showOnOffBands?: boolean
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m) - 1]} ${y.slice(2)}`
}

function formatGbp(v: number) {
  if (v >= 1000) return `£${(v / 1000).toFixed(1)}k`
  return `£${v.toFixed(0)}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white/95 backdrop-blur-sm border border-surface-border rounded-xl shadow-float px-4 py-3 text-sm">
      <p className="font-semibold text-ink text-xs mb-1.5">{formatMonth(label)}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 text-ink-secondary">
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-xs">{p.name}</span>
          <span className="font-semibold text-ink text-xs ml-auto font-tabular">
            {typeof p.value === 'number' && p.name.includes('£')
              ? formatGbp(p.value)
              : p.value?.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

export function SpendTrendChart({ data, metric = 'spend', showOnOffBands }: SpendTrendChartProps) {
  const chartData = data.map(d => ({
    month: d.year_month,
    '£ Spend': d.total_spend_gbp,
    '£ Revenue': d.total_revenue,
    Transactions: d.settled_transactions,
    is_on_yonder: d.is_on_yonder,
  }))

  const key = metric === 'spend' ? '£ Spend'
    : metric === 'revenue' ? '£ Revenue'
    : 'Transactions'

  const yFmt = metric === 'transactions' ? (v: number) => v.toString() : formatGbp

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F04E37" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#F04E37" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eaecf4" strokeOpacity={0.7} vertical={false} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          tick={{ fill: '#8a91a8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={yFmt}
          tick={{ fill: '#8a91a8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        {showOnOffBands && data.map((d, i) =>
          d.is_on_yonder ? (
            <ReferenceLine
              key={i}
              x={d.year_month}
              stroke="#00c98c"
              strokeWidth={2}
              strokeDasharray="0"
              opacity={0.3}
            />
          ) : null
        )}
        <Area
          type="monotone"
          dataKey={key}
          stroke="#F04E37"
          strokeWidth={2.5}
          fill="url(#areaGrad)"
          dot={false}
          activeDot={{ r: 5, fill: '#F04E37', stroke: '#fff', strokeWidth: 2.5 }}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
