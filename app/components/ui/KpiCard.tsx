'use client'

import { motion } from 'framer-motion'

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'flat'
  accent?: 'green' | 'coral' | 'amber' | 'purple' | 'neutral'
  dark?: boolean   // for internal dark surfaces
  delay?: number
}

const lightAccent = {
  green:   'border-accent-green/20 bg-white',
  coral:   'border-coral/20 bg-white',
  amber:   'border-accent-amber/20 bg-white',
  purple:  'border-accent-purple/20 bg-white',
  neutral: 'border-surface-border bg-white',
}

const lightValueColor = {
  green:   'text-accent-green',
  coral:   'text-coral',
  amber:   'text-accent-amber',
  purple:  'text-accent-purple',
  neutral: 'text-ink',
}

const darkAccent = {
  green:   'border-accent-green/20 bg-navy-800',
  coral:   'border-coral/20 bg-navy-800',
  amber:   'border-accent-amber/20 bg-navy-800',
  purple:  'border-accent-purple/20 bg-navy-800',
  neutral: 'border-navy-600 bg-navy-800',
}

const trendConfig = {
  up:   { icon: '↑', cls: 'text-accent-green' },
  down: { icon: '↓', cls: 'text-accent-red' },
  flat: { icon: '—', cls: 'text-ink-tertiary' },
}

export function KpiCard({ label, value, sub, trend, accent = 'neutral', dark = false, delay = 0 }: KpiCardProps) {
  const containerCls = dark ? darkAccent[accent] : lightAccent[accent]
  const valueCls = dark ? 'text-white' : lightValueColor[accent]
  const labelCls = dark ? 'text-navy-300' : 'text-ink-tertiary'
  const subCls   = dark ? 'text-navy-400' : 'text-ink-tertiary'
  const trendInfo = trend ? trendConfig[trend] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      className={`rounded-2xl border p-5 shadow-card-sm ${containerCls}`}
    >
      <p className={`text-[11px] font-semibold uppercase tracking-widest mb-2.5 ${labelCls}`}>
        {label}
      </p>
      <div className="flex items-end gap-2">
        <p className={`text-2xl font-bold leading-none font-tabular ${valueCls}`}>{value}</p>
        {trendInfo && (
          <span className={`text-sm font-semibold pb-0.5 ${trendInfo.cls}`}>
            {trendInfo.icon}
          </span>
        )}
      </div>
      {sub && <p className={`text-xs mt-1.5 ${subCls}`}>{sub}</p>}
    </motion.div>
  )
}

