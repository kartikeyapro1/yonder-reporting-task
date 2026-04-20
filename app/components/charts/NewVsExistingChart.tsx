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
import { formatMonth, formatGbp, ChartTooltip, CHART_COLORS, AXIS_PROPS } from './shared'

interface NewVsExistingChartProps {
  data: PartnerMonthlyMetrics[]
  metric?: 'spend' | 'transactions'
  onMonthClick?: (month: string) => void
  selectedMonth?: string
}

export function NewVsExistingChart({ data, metric = 'spend', onMonthClick }: NewVsExistingChartProps) {
  const chartData = data.map(d => ({
    month: d.year_month,
    New: metric === 'spend' ? d.new_spend_gbp : d.new_transactions,
    Repeat: metric === 'spend' ? d.repeat_spend_gbp : d.repeat_transactions,
  }))

  const fmt = metric === 'spend' ? formatGbp : (v: number) => v.toString()

  const NvETooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <ChartTooltip
        active={active}
        label={formatMonth(label)}
        rows={payload.map((p: any) => ({
          label: p.name,
          value: fmt(Number(p.value)),
          color: p.color,
        }))}
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
        barCategoryGap="30%"
        onClick={onMonthClick ? (e: any) => { if (e?.activeLabel) onMonthClick(e.activeLabel) } : undefined}
        style={onMonthClick ? { cursor: 'pointer' } : undefined}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} strokeOpacity={0.7} vertical={false} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          {...AXIS_PROPS}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={fmt}
          {...AXIS_PROPS}
          width={52}
        />
        <Tooltip content={<NvETooltip />} />
        <Legend
          wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
          iconType="circle"
          iconSize={7}
        />
        <Bar dataKey="New" stackId="a" fill={CHART_COLORS.coral} radius={[0, 0, 0, 0]} animationDuration={1000} animationEasing="ease-out" />
        <Bar dataKey="Repeat" stackId="a" fill={CHART_COLORS.muted} radius={[6, 6, 0, 0]} animationDuration={1000} animationEasing="ease-out" />
      </BarChart>
    </ResponsiveContainer>
  )
}
