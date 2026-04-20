'use client'

import { motion } from 'framer-motion'

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'flat'
  accent?: 'green' | 'coral' | 'amber' | 'purple' | 'neutral'
  dark?: boolean
  delay?: number
}

const accentDot: Record<string, string> = {
  green:   'bg-accent-green',
  coral:   'bg-coral',
  amber:   'bg-accent-amber',
  purple:  'bg-accent-purple',
  neutral: 'bg-ink-tertiary',
}

const trendConfig = {
  up:   { icon: '↑', cls: 'text-accent-green bg-accent-green/10' },
  down: { icon: '↓', cls: 'text-accent-red bg-accent-red/10' },
  flat: { icon: '→', cls: 'text-ink-tertiary bg-surface-muted' },
}

export function KpiCard({ label, value, sub, trend, accent = 'neutral', dark = false, delay = 0 }: KpiCardProps) {
  const trendInfo = trend ? trendConfig[trend] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={{
        y: -2,
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      }}
      className={`group relative rounded-2xl border p-5 overflow-hidden transition-shadow duration-300 ${
        dark
          ? 'bg-surface-darkCard border-surface-darkBorder hover:shadow-deep'
          : 'bg-white border-surface-border shadow-card-sm hover:shadow-card'
      }`}
    >
      {/* Accent dot */}
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-1.5 h-1.5 rounded-full ${accentDot[accent]}`} />
        <p className={`text-[11px] font-semibold uppercase tracking-[0.08em] ${
          dark ? 'text-ink-muted' : 'text-ink-tertiary'
        }`}>
          {label}
        </p>
      </div>

      <div className="flex items-end justify-between gap-2">
        <p className={`text-2xl font-bold leading-none font-tabular tracking-tight ${
          dark ? 'text-white' : 'text-ink'
        }`}>
          {value}
        </p>
        {trendInfo && (
          <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${trendInfo.cls}`}>
            {trendInfo.icon}
          </span>
        )}
      </div>

      {sub && (
        <p className={`text-xs mt-2 ${dark ? 'text-ink-muted' : 'text-ink-tertiary'}`}>
          {sub}
        </p>
      )}

      {/* Subtle hover shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-shimmer" />
    </motion.div>
  )
}

