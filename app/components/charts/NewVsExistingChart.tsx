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
} from 'recharts'
import type { PartnerMonthlyMetrics } from '@/lib/types'

interface NewVsExistingChartProps {
  data: PartnerMonthlyMetrics[]
  metric?: 'spend' | 'transactions'
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

export function NewVsExistingChart({ data, metric = 'spend' }: NewVsExistingChartProps) {
  const chartData = data.map(d => ({
    month: d.year_month,
    New: metric === 'spend' ? d.new_spend_gbp : d.new_transactions,
    Repeat: metric === 'spend' ? d.repeat_spend_gbp : d.repeat_transactions,
  }))

  const fmt = metric === 'spend' ? formatGbp : (v: number) => v.toString()

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
          tickFormatter={fmt}
          tick={{ fill: '#8a91a8', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip
          formatter={(value, name) => [fmt(Number(value)), String(name)]}
          labelFormatter={(label) => formatMonth(String(label))}
          contentStyle={{
            borderRadius: '12px',
            border: '1px solid #eaecf4',
            fontSize: '13px',
          }}
        />
        <Legend
          wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="New" stackId="a" fill="#3d5eff" radius={[0, 0, 0, 0]} />
        <Bar dataKey="Repeat" stackId="a" fill="#c0d2ff" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
