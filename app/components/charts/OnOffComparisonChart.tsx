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
    <div className="bg-white/95 backdrop-blur-sm border border-surface-border rounded-xl shadow-float px-4 py-3 text-sm">
      <p className="font-semibold text-ink text-xs mb-1.5">{formatMonth(label)}</p>
      <p className="text-ink-secondary text-xs">
        Spend: <span className="font-semibold text-ink font-tabular">{formatGbp(item?.total_spend_gbp ?? 0)}</span>
      </p>
      <div className={`flex items-center gap-1.5 text-[11px] mt-1 ${item?.is_on_yonder ? 'text-accent-green' : 'text-ink-tertiary'}`}>
        <div className={`w-1.5 h-1.5 rounded-full ${item?.is_on_yonder ? 'bg-accent-green' : 'bg-ink-tertiary/40'}`} />
        {item?.is_on_yonder ? 'On Yonder' : 'Off Yonder'}
      </div>
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
          tickFormatter={formatGbp}
          tick={{ fill: '#8a91a8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(61,94,255,0.03)' }} />
        <Bar dataKey="total_spend_gbp" name="Spend" radius={[6, 6, 0, 0]} animationDuration={1000} animationEasing="ease-out">
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.is_on_yonder ? '#F04E37' : '#C5CBDA'}
              opacity={entry.is_on_yonder ? 1 : 0.7}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
