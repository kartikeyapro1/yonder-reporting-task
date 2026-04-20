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
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: index * 0.07 }}
      className={`group flex gap-3.5 items-start rounded-xl px-4 py-4 transition-all duration-300 ${
        dark
          ? 'bg-white/[0.04] border border-white/[0.06] hover:bg-white/[0.07]'
          : 'bg-white border border-surface-border hover:shadow-card-sm hover:border-coral/20'
      }`}
    >
      <span className="mt-1.5 shrink-0">
        <span className={`block w-1.5 h-1.5 rounded-full transition-transform duration-300 group-hover:scale-125 ${
          dark ? 'bg-coral-light' : 'bg-coral'
        }`} />
      </span>
      <p className={`text-sm leading-relaxed ${
        dark ? 'text-white/70' : 'text-ink-secondary'
      }`}>{text}</p>
    </motion.div>
  )
}
