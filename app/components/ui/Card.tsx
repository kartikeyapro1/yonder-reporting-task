'use client'

import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  glass?: boolean
  dark?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', hoverable, glass, dark, onClick }: CardProps) {
  const base = dark
    ? 'bg-surface-darkCard rounded-2xl border border-surface-darkBorder'
    : glass
    ? 'glass rounded-2xl'
    : 'bg-white rounded-2xl shadow-card border border-surface-border'

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      whileHover={hoverable ? {
        y: -2,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 8px 32px rgba(0,0,0,0.08), 0 24px 64px rgba(0,0,0,0.06)',
        transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
      } : undefined}
      onClick={onClick}
      className={[
        base,
        hoverable ? 'cursor-pointer' : '',
        className,
      ].join(' ')}
    >
      {children}
    </motion.div>
  )
}
