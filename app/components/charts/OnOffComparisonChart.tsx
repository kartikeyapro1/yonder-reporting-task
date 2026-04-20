'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts'
import type { PartnerMonthlyMetrics } from '@/lib/types'

interface OnOffComparisonChartProps {
  data: PartnerMonthlyMetrics[]
}

function formatMonth(ym: string): string {
  const [y, m] = ym.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m) - 1]} '${y.slice(2)}`
}

function formatGbp(v: number) {
  if (v >= 1000) return `£${(v / 1000).toFixed(1)}k`
  return `£${v.toFixed(0)}`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const item = payload[0]?.payload
  return (
    <div className="bg-white border border-surface-border rounded-xl shadow-card-hover px-3.5 py-2.5 text-sm">
      <p className="font-semibold text-ink mb-1">{formatMonth(label)}</p>
      <p className="text-ink-secondary">
        Spend: <span className="font-semibold text-ink">{formatGbp(item?.total_spend_gbp ?? 0)}</span>
      </p>
      <p className={`text-xs mt-0.5 ${item?.is_on_yonder ? 'text-accent-green' : 'text-ink-tertiary'}`}>
        {item?.is_on_yonder ? '● On Yonder' : '○ Off Yonder'}
      </p>
    </div>
  )
}

export function OnOffComparisonChart({ data }: OnOffComparisonChartProps) {
  const chartData = data.map(d => ({
    month: d.year_month,
    total_spend_gbp: d.total_spend_gbp,
    is_on_yonder: d.is_on_yonder,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
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
          tickFormatter={formatGbp}
          tick={{ fill: '#8a91a8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(61,94,255,0.04)' }} />
        <Bar dataKey="total_spend_gbp" name="Spend" radius={[4, 4, 0, 0]}>
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.is_on_yonder ? '#3d5eff' : '#d1d5e8'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
