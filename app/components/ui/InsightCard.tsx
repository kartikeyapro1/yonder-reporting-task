'use client'

import { motion } from 'framer-motion'

interface InsightCardProps {
  text: string
  index?: number
}

export function InsightCard({ text, index = 0 }: InsightCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: index * 0.08 }}
      className="flex gap-3 items-start bg-brand-50 border border-brand-100 rounded-xl px-4 py-3"
    >
      <span className="mt-0.5 text-brand-500 shrink-0">
        <svg width="16" height="16" fill="none" viewBox="0 0 16 16">
          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M8 5v4M8 11v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
      <p className="text-sm text-ink-secondary leading-relaxed">{text}</p>
    </motion.div>
  )
}
