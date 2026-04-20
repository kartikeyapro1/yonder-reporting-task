'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'

interface HeaderProps {
  section?: 'internal' | 'partner' | 'report'
  partnerName?: string
  partnerSlug?: string
}

/** Yonder wordmark — matching the clean yonder.com style */
function YonderLogo({ variant = 'light' }: { variant?: 'light' | 'dark' | 'coral' }) {
  const textCls = variant === 'dark' ? 'text-white' : 'text-ink'
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-coral-gradient flex items-center justify-center shrink-0 shadow-sm">
        <span className="text-white text-[13px] font-black leading-none">Y</span>
      </div>
      <span className={`text-[15px] font-bold tracking-tight ${textCls}`}>
        Yonder
      </span>
    </div>
  )
}

export function Header({ section, partnerName, partnerSlug }: HeaderProps) {
  const isInternal = section === 'internal'

  if (isInternal) {
    return (
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="sticky top-0 z-40 bg-navy-900/95 backdrop-blur-xl border-b border-white/[0.06]"
      >
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/internal">
              <YonderLogo variant="dark" />
            </Link>
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/internal"
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-white/70 hover:text-white hover:bg-white/[0.06] transition-all duration-200"
              >
                Partners
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-white/30 uppercase tracking-[0.1em] bg-white/[0.05] border border-white/[0.08] px-3 py-1 rounded-full">
              Internal
            </span>
          </div>
        </div>
      </motion.header>
    )
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-surface-border/60"
    >
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/internal">
            <YonderLogo />
          </Link>
          {partnerName && (
            <div className="flex items-center gap-2.5 text-sm">
              <span className="text-surface-border/80">/</span>
              <span className="text-ink font-medium">{partnerName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {section === 'partner' && partnerSlug && (
            <Link
              href={`/report/${partnerSlug}`}
              className="group text-[13px] font-medium text-ink-secondary hover:text-coral transition-colors duration-200 flex items-center gap-1"
            >
              Full report
              <span className="inline-block transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
          )}
          {section === 'report' && (
            <span className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-[0.08em] bg-surface-muted border border-surface-border rounded-full px-3 py-1">
              Report
            </span>
          )}
        </div>
      </div>
    </motion.header>
  )
}

