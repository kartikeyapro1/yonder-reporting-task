'use client'

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import type { PartnerMonthlyMetrics } from '@/lib/types'
import { formatMonth, formatGbp, ChartTooltip, CHART_COLORS, AXIS_PROPS } from './shared'

interface OnOffComparisonChartProps {
  data: PartnerMonthlyMetrics[]
}

export function OnOffComparisonChart({ data }: OnOffComparisonChartProps) {
  const chartData = data.map(d => ({
    month: d.year_month,
    total_spend_gbp: d.total_spend_gbp,
    is_on_yonder: d.is_on_yonder,
  }))

  const OnOffTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    const item = payload[0]?.payload
    return (
      <ChartTooltip
        active={active}
        label={formatMonth(label)}
        rows={[
          {
            label: 'Spend',
            value: formatGbp(item?.total_spend_gbp ?? 0),
            color: item?.is_on_yonder ? CHART_COLORS.coral : CHART_COLORS.muted,
          },
          {
            label: item?.is_on_yonder ? 'Active on Yonder' : 'Inactive',
            value: '',
          },
        ]}
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} strokeOpacity={0.7} vertical={false} />
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          {...AXIS_PROPS}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={formatGbp}
          {...AXIS_PROPS}
          width={52}
        />
        <Tooltip content={<OnOffTooltip />} cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
        <Bar dataKey="total_spend_gbp" name="Spend" radius={[6, 6, 0, 0]} animationDuration={1000} animationEasing="ease-out">
          {chartData.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.is_on_yonder ? CHART_COLORS.coral : CHART_COLORS.muted}
              opacity={entry.is_on_yonder ? 1 : 0.7}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
