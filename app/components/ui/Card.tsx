'use client'

import { motion } from 'framer-motion'

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', hoverable, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={hoverable ? { y: -2, boxShadow: '0 4px 24px 0 rgb(0 0 0 / 0.1)' } : undefined}
      onClick={onClick}
      className={[
        'bg-white rounded-2xl shadow-card border border-surface-border',
        hoverable ? 'cursor-pointer transition-shadow' : '',
        className,
      ].join(' ')}
    >
      {children}
    </motion.div>
  )
}
