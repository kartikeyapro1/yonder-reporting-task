'use client'

import { useId } from 'react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceArea,
} from 'recharts'
import type { PartnerMonthlyMetrics } from '@/lib/types'
import { formatMonth, formatGbp, ChartTooltip, CHART_COLORS, AXIS_PROPS } from './shared'

interface SpendTrendChartProps {
  data: PartnerMonthlyMetrics[]
  metric?: 'spend' | 'revenue' | 'transactions'
  showOnOffBands?: boolean
}

export function SpendTrendChart({ data, metric = 'spend', showOnOffBands }: SpendTrendChartProps) {
  const gradId = useId().replace(/:/g, '_')

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

  // Build contiguous on-Yonder bands for elegant shading
  type Band = { x1: string; x2: string }
  const bands: Band[] = []
  if (showOnOffBands) {
    let bandStart: string | null = null
    for (let i = 0; i < data.length; i++) {
      if (data[i].is_on_yonder && bandStart === null) {
        bandStart = data[i].year_month
      } else if (!data[i].is_on_yonder && bandStart !== null) {
        bands.push({ x1: bandStart, x2: data[i - 1].year_month })
        bandStart = null
      }
    }
    if (bandStart !== null) {
      bands.push({ x1: bandStart, x2: data[data.length - 1].year_month })
    }
  }

  const SpendTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <ChartTooltip
        active={active}
        label={formatMonth(label)}
        rows={payload.map((p: any) => ({
          label: p.name,
          value: typeof p.value === 'number' && p.name.includes('£')
            ? formatGbp(p.value)
            : p.value?.toLocaleString(),
          color: p.color,
        }))}
      />
    )
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={CHART_COLORS.coral} stopOpacity={0.18} />
            <stop offset="100%" stopColor={CHART_COLORS.coral} stopOpacity={0.01} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} strokeOpacity={0.6} vertical={false} />
        {bands.map((band, i) => (
          <ReferenceArea
            key={i}
            x1={band.x1}
            x2={band.x2}
            fill="rgba(232, 80, 58, 0.07)"
            stroke="none"
            ifOverflow="hidden"
          />
        ))}
        <XAxis
          dataKey="month"
          tickFormatter={formatMonth}
          {...AXIS_PROPS}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={yFmt}
          {...AXIS_PROPS}
          width={52}
        />
        <Tooltip content={<SpendTooltip />} />
        <Area
          type="monotone"
          dataKey={key}
          stroke={CHART_COLORS.coral}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
          activeDot={{ r: 4, fill: CHART_COLORS.coral, stroke: '#fff', strokeWidth: 2 }}
          animationDuration={1200}
          animationEasing="ease-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
