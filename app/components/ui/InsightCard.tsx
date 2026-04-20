'use client'

import { motion } from 'framer-motion'

interface InsightCardProps {
  text: string
  index?: number
  dark?: boolean
}

export function InsightCard({ text, index = 0, dark = false }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.08 }}
      className={`flex gap-3 items-start rounded-xl px-4 py-3.5 ${
        dark
          ? 'bg-navy-800 border border-navy-600'
          : 'bg-coral-subtle border border-coral/10'
      }`}
    >
      {/* Coral dot */}
      <span className="mt-1 shrink-0">
        <span className="block w-1.5 h-1.5 rounded-full bg-coral" />
      </span>
      <p className={`text-sm leading-relaxed ${
        dark ? 'text-navy-200' : 'text-ink-secondary'
      }`}>{text}</p>
    </motion.div>
  )
}
