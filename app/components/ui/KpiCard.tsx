'use client'

import { motion } from 'framer-motion'

interface KpiCardProps {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'flat'
  accent?: 'green' | 'blue' | 'amber' | 'purple'
  delay?: number
}

const accentClasses = {
  green: 'from-accent-green/10 to-accent-green/5 text-accent-green',
  blue: 'from-brand-100 to-brand-50 text-brand-600',
  amber: 'from-accent-amber/15 to-accent-amber/5 text-accent-amber',
  purple: 'from-accent-purple/10 to-accent-purple/5 text-accent-purple',
}

const trendIcons = {
  up: { icon: '↑', cls: 'text-accent-green' },
  down: { icon: '↓', cls: 'text-accent-red' },
  flat: { icon: '—', cls: 'text-ink-tertiary' },
}

export function KpiCard({ label, value, sub, trend, accent = 'blue', delay = 0 }: KpiCardProps) {
  const trendInfo = trend ? trendIcons[trend] : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
      className={`bg-gradient-to-br ${accentClasses[accent]} rounded-2xl p-5 border border-white/50 shadow-card`}
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-tertiary mb-2">{label}</p>
      <div className="flex items-end gap-2">
        <p className="text-3xl font-bold text-ink leading-none">{value}</p>
        {trendInfo && (
          <span className={`text-sm font-semibold pb-0.5 ${trendInfo.cls}`}>
            {trendInfo.icon}
          </span>
        )}
      </div>
      {sub && <p className="text-xs text-ink-secondary mt-1.5">{sub}</p>}
    </motion.div>
  )
}
