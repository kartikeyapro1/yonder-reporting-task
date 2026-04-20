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
  const d = payload[0]
  return (
    <div className="bg-white border border-surface-border rounded-xl shadow-card-hover px-3.5 py-2.5 text-sm">
      <p className="font-semibold text-ink mb-1">{formatMonth(label)}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-ink-secondary">
          <span className="font-medium" style={{ color: p.color }}>{p.name}: </span>
          {typeof p.value === 'number' && p.name.includes('£')
            ? formatGbp(p.value)
            : p.value?.toLocaleString()}
        </p>
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
            <stop offset="0%" stopColor="#3d5eff" stopOpacity={0.18} />
            <stop offset="100%" stopColor="#3d5eff" stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#eaecf4" vertical={false} />
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
          stroke="#3d5eff"
          strokeWidth={2}
          fill="url(#areaGrad)"
          dot={false}
          activeDot={{ r: 4, fill: '#3d5eff', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
