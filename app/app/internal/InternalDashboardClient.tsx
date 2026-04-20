'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/Badge'
import CountUp from '@/components/ui/CountUp'
import BlurText from '@/components/ui/BlurText'
import type { InternalDashboardRow } from '@/lib/types'

interface Props {
  rows: InternalDashboardRow[]
  totals: {
    totalSpend: number
    totalRevenue: number
    totalTx: number
    totalUsers: number
  }
}

function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}m`
  if (n >= 1000) return `£${(n / 1000).toFixed(1)}k`
  return `£${n.toFixed(0)}`
}

function fmtMonth(ym: string) {
  if (!ym) return '—'
  const [y, m] = ym.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m) - 1]} ${y}`
}

/** Animated stat for the hero area */
function HeroStat({
  label,
  value,
  countTo,
  prefix = '',
  suffix = '',
  separator = '',
  delay,
}: {
  label: string
  value: string
  countTo?: number
  prefix?: string
  suffix?: string
  separator?: string
  delay: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
      className="text-center"
    >
      <p className="text-3xl md:text-4xl font-bold text-white font-tabular tracking-tight">
        {countTo !== undefined ? (
          <>
            {prefix}
            <CountUp to={countTo} duration={2} delay={delay} separator={separator} />
            {suffix}
          </>
        ) : (
          value
        )}
      </p>
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/30 mt-2">{label}</p>
    </motion.div>
  )
}

/** Featured partner card for the hub */
function FeaturedCard({ row, index }: { row: InternalDashboardRow; index: number }) {
  const router = useRouter()
  const slug = row.partner_name.toLowerCase().replace(/\s+/g, '-')
  const isUp = row.revenue_trend === 'up'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 + index * 0.07 }}
      whileHover={{ y: -4, transition: { duration: 0.25 } }}
      onClick={() => router.push(`/internal/partner/${slug}`)}
      className="group relative bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] hover:border-white/[0.12] rounded-2xl p-5 cursor-pointer transition-all duration-300 overflow-hidden"
    >
      {/* Coral accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-coral-gradient opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-coral-gradient flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-glow-coral/30">
            {row.display_name[0]}
          </div>
          <div>
            <p className="text-sm font-semibold text-white group-hover:text-coral-light transition-colors duration-200">
              {row.display_name}
            </p>
            <p className="text-[11px] text-white/30">{row.category}</p>
          </div>
        </div>
        <Badge label={row.is_currently_active ? 'Active' : 'Inactive'} variant={row.is_currently_active ? 'active' : 'inactive'} pulse={row.is_currently_active} />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/25 mb-0.5">Spend</p>
          <p className="text-sm font-bold text-white font-tabular">{fmt(row.total_spend_gbp)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/25 mb-0.5">Revenue</p>
          <p className="text-sm font-bold text-accent-green font-tabular">{fmt(row.total_revenue)}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider text-white/25 mb-0.5">Trend</p>
          <p className={`text-sm font-bold ${isUp ? 'text-accent-green' : row.revenue_trend === 'down' ? 'text-accent-red' : 'text-white/40'}`}>
            {isUp ? '↑ Up' : row.revenue_trend === 'down' ? '↓ Down' : '→ Flat'}
          </p>
        </div>
      </div>
    </motion.div>
  )
}

export function InternalDashboardClient({ rows, totals }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'table' | 'grid'>('table')

  const filtered = rows.filter(r =>
    r.display_name.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = rows.filter(r => r.is_currently_active).length
  const topPartners = [...rows]
    .filter(r => r.is_currently_active)
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 4)

  return (
    <div className="min-h-screen bg-navy-950">

      {/* ── Hero section with mesh gradient ────────────────────────── */}
      <div className="relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-navy-radial" />
        <div className="absolute inset-0 bg-hero-mesh opacity-60" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-coral/[0.03] blur-[120px] rounded-full" />

        <div className="relative max-w-screen-xl mx-auto px-6 pt-12 pb-14">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <BlurText
              text="Partner Analytics"
              className="text-3xl md:text-4xl font-bold text-white tracking-tight"
              animateBy="words"
              direction="top"
              delay={120}
              stepDuration={0.4}
            />
          </motion.div>

          {/* Hero stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            <HeroStat label="Total Spend" value={fmt(totals.totalSpend)} delay={0.1} />
            <HeroStat label="Revenue" value={fmt(totals.totalRevenue)} delay={0.15} />
            <HeroStat label="Transactions" value={totals.totalTx.toLocaleString()} countTo={totals.totalTx} separator="," delay={0.2} />
            <HeroStat label="Unique Users" value={totals.totalUsers.toLocaleString()} countTo={totals.totalUsers} separator="," delay={0.25} />
          </div>

          {/* Active / Total indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex items-center gap-3 mt-10 pt-6 border-t border-white/[0.06]"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-green opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-green" />
            </span>
            <span className="text-[13px] text-white/40">
              <span className="text-accent-green font-semibold">{activeCount}</span> of {rows.length} partners currently active
            </span>
          </motion.div>
        </div>
      </div>

      {/* ── Featured Partners Hub ─────────────────────────────────── */}
      {topPartners.length > 0 && (
        <div className="max-w-screen-xl mx-auto px-6 -mt-2 mb-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 rounded-full bg-coral-gradient" />
                <h2 className="text-sm font-semibold text-white/80">Featured Partners</h2>
              </div>
              <p className="text-[11px] text-white/20 uppercase tracking-wider">Top performers by revenue</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {topPartners.map((row, i) => (
                <FeaturedCard key={row.partner_name} row={row} index={i} />
              ))}
            </div>
          </motion.div>
        </div>
      )}

      {/* ── Partner table ─────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
          className="bg-white rounded-2xl shadow-card-lg overflow-hidden"
        >

          {/* Table toolbar */}
          <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-semibold text-ink">All Partners</h2>
              <span className="text-[11px] text-ink-tertiary bg-surface-muted px-2 py-0.5 rounded-md font-medium">
                {filtered.length}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search partners…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-56 text-[13px] pl-9 pr-3 py-2 rounded-xl border border-surface-border bg-surface-muted/50 outline-none focus:ring-2 focus:ring-coral/15 focus:border-coral/30 transition-all duration-200 placeholder:text-ink-tertiary"
                />
              </div>
              {/* View toggle */}
              <div className="flex bg-surface-muted rounded-lg p-0.5">
                {(['table', 'grid'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-3 py-1.5 rounded-md text-[11px] font-semibold uppercase tracking-wider transition-all duration-200 ${
                      view === v
                        ? 'bg-white text-ink shadow-sm'
                        : 'text-ink-tertiary hover:text-ink-secondary'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {view === 'table' ? (
              <motion.div
                key="table"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-surface-muted/50">
                      {['Partner', 'Category', 'Spend', 'Revenue', 'Txns', 'Users', 'Last Month', 'Status'].map((h, i) => (
                        <th
                          key={h}
                          className={`py-3 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-tertiary ${
                            i === 0 ? 'text-left px-6' : i <= 1 ? 'text-left px-4' : i >= 6 ? 'px-6' : 'text-right px-4'
                          }`}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-surface-muted flex items-center justify-center">
                              <svg className="w-5 h-5 text-ink-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            </div>
                            <p className="text-ink-tertiary text-sm">
                              {search ? `No partners match "${search}"` : 'No partner data available.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filtered.map((row, i) => {
                        const slug = row.partner_name.toLowerCase().replace(/\s+/g, '-')
                        const trendIcon = row.revenue_trend === 'up' ? '↑' : row.revenue_trend === 'down' ? '↓' : null
                        const trendCls  = row.revenue_trend === 'up' ? 'text-accent-green' : row.revenue_trend === 'down' ? 'text-accent-red' : ''

                        return (
                          <motion.tr
                            key={row.partner_name}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.025 }}
                            onClick={() => router.push(`/internal/partner/${slug}`)}
                            className="border-t border-surface-border/60 hover:bg-surface-hover cursor-pointer transition-colors duration-150 group"
                          >
                            <td className="px-6 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-navy-900 flex items-center justify-center text-white font-bold text-xs shrink-0 group-hover:bg-coral-gradient transition-all duration-300">
                                  {row.display_name[0]}
                                </div>
                                <span className="font-semibold text-ink group-hover:text-coral transition-colors duration-200">
                                  {row.display_name}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-ink-secondary text-xs">{row.category}</td>
                            <td className="px-4 py-3.5 text-right font-tabular text-ink font-medium">{fmt(row.total_spend_gbp)}</td>
                            <td className="px-4 py-3.5 text-right font-tabular">
                              <span className="text-accent-green font-semibold">{fmt(row.total_revenue)}</span>
                              {trendIcon && (
                                <span className={`ml-1.5 text-xs font-bold ${trendCls}`}>{trendIcon}</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right font-tabular text-ink-secondary">{row.total_transactions.toLocaleString()}</td>
                            <td className="px-4 py-3.5 text-right font-tabular text-ink-secondary">{row.unique_users.toLocaleString()}</td>
                            <td className="px-6 py-3.5 text-right text-ink-tertiary text-xs">{fmtMonth(row.last_active_month)}</td>
                            <td className="px-6 py-3.5">
                              <Badge
                                label={row.is_currently_active ? 'Active' : 'Inactive'}
                                variant={row.is_currently_active ? 'active' : 'inactive'}
                              />
                            </td>
                          </motion.tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </motion.div>
            ) : (
              /* Grid view */
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {filtered.map((row, i) => {
                  const slug = row.partner_name.toLowerCase().replace(/\s+/g, '-')
                  return (
                    <motion.div
                      key={row.partner_name}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      whileHover={{ y: -3, transition: { duration: 0.2 } }}
                      onClick={() => router.push(`/internal/partner/${slug}`)}
                      className="group border border-surface-border rounded-2xl p-5 cursor-pointer hover:shadow-card hover:border-coral/20 transition-all duration-300"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:bg-coral-gradient transition-all duration-300">
                          {row.display_name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-ink text-sm truncate group-hover:text-coral transition-colors">{row.display_name}</p>
                          <p className="text-[11px] text-ink-tertiary">{row.category}</p>
                        </div>
                        <Badge
                          label={row.is_currently_active ? 'Active' : 'Off'}
                          variant={row.is_currently_active ? 'active' : 'inactive'}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-ink-tertiary">Spend</p>
                          <p className="font-bold text-ink font-tabular text-sm">{fmt(row.total_spend_gbp)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] uppercase tracking-wider text-ink-tertiary">Revenue</p>
                          <p className="font-bold text-accent-green font-tabular text-sm">{fmt(row.total_revenue)}</p>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer count */}
          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-surface-border bg-surface-muted/50 text-xs text-ink-tertiary flex items-center justify-between">
              <span>Showing {filtered.length} of {rows.length} partners</span>
              <span className="text-ink-tertiary/50">Powered by Yonder</span>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
