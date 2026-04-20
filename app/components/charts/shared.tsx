/**
 * @module components/charts/shared
 *
 * Shared utilities for Recharts components.
 * - Consistent tooltip styling via ChartTooltip
 * - Shared formatters for GBP, months, etc.
 */

'use client'

/* ── Formatters ──────────────────────────────────────────────── */

export function formatMonth(ym: string): string {
  const [y, m] = ym.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m) - 1]} '${y.slice(2)}`
}

export function formatGbp(v: number): string {
  if (v >= 1_000_000) return `£${(v / 1_000_000).toFixed(1)}M`
  if (v >= 1000) return `£${(v / 1000).toFixed(1)}k`
  return `£${v.toFixed(0)}`
}

/* ── Tooltip ─────────────────────────────────────────────────── */

interface TooltipRow {
  label: string
  value: string
  color?: string
}

interface ChartTooltipProps {
  active?: boolean
  label?: string
  rows: TooltipRow[]
}

/**
 * Shared premium tooltip — glass background, micro shadow.
 * Wrap Recharts `<Tooltip content={...} />` with this component.
 */
export function ChartTooltip({ active, label, rows }: ChartTooltipProps) {
  if (!active || rows.length === 0) return null
  return (
    <div className="glass rounded-xl border border-gray-200/60 shadow-float px-4 py-3 text-sm pointer-events-none">
      {label && (
        <p className="font-medium text-ink-700 text-xs mb-2">{label}</p>
      )}
      <div className="space-y-1">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2 text-gray-500 text-xs">
            {row.color && (
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: row.color }} />
            )}
            <span>{row.label}</span>
            <span className="font-semibold text-ink-800 ml-auto font-tabular">{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Chart style constants ───────────────────────────────────── */

export const CHART_COLORS = {
  coral:     '#E8503A',
  coralMid:  '#FF8A76',
  muted:     '#D1D1CC',
  gridLine:  '#E5E5E1',
  tickText:  '#A8A8A3',
} as const

export const AXIS_PROPS = {
  tick: { fill: CHART_COLORS.tickText, fontSize: 11 },
  axisLine: false as const,
  tickLine: false as const,
}
