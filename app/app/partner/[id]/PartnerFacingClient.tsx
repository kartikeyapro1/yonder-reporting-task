'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { SpendTrendChart } from '@/components/charts/SpendTrendChart'
import { NewVsExistingChart } from '@/components/charts/NewVsExistingChart'
import { InsightCard } from '@/components/ui/InsightCard'
import type { PartnerSummaryMetrics } from '@/lib/types'

interface Props {
  summary: PartnerSummaryMetrics
}

function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}m`
  if (n >= 1000) return `£${(n / 1000).toFixed(1)}k`
  return `£${n.toFixed(0)}`
}

function MetricTile({
  label,
  value,
  sub,
  delay = 0,
}: {
  label: string
  value: string
  sub?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="p-6 bg-white rounded-2xl border border-surface-border shadow-card-sm hover:shadow-card transition-all duration-300"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-tertiary mb-2.5">{label}</p>
      <p className="text-3xl font-bold text-ink tracking-tight">{value}</p>
      {sub && <p className="text-xs text-ink-secondary mt-1.5">{sub}</p>}
    </motion.div>
  )
}

export function PartnerFacingClient({ summary }: Props) {
  const slug = summary.partner_name.toLowerCase().replace(/\s+/g, '-')

  const avgSpend = summary.total_transactions > 0
    ? summary.total_spend_gbp / summary.total_transactions
    : 0

  const repeatRate = summary.total_transactions > 0
    ? (summary.repeat_transactions / summary.total_transactions) * 100
    : 0

  return (
    <main className="min-h-screen bg-surface-warm">
      <div className="max-w-3xl mx-auto px-6 py-14">

        {/* Hero section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-3.5 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-coral-gradient flex items-center justify-center text-white font-bold text-lg shadow-glow-coral/20">
              {summary.display_name[0]}
            </div>
            <div>
              <p className="text-[11px] text-ink-tertiary font-semibold uppercase tracking-[0.12em]">Yonder Partner Report</p>
              <h1 className="text-xl font-bold text-ink tracking-tight">{summary.display_name}</h1>
            </div>
          </div>
          <p className="text-ink-secondary text-sm">{summary.period_label}</p>

          {/* Coral gradient divider */}
          <div className="mt-8 h-[2px] bg-gradient-to-r from-coral via-coral/30 to-transparent rounded-full" />
        </motion.div>

        {/* Summary headline numbers */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-14">
          <MetricTile label="Total Spend" value={fmt(summary.total_spend_gbp)} delay={0.05} />
          <MetricTile label="Yonder fee" value={fmt(summary.total_revenue)} sub="platform revenue" delay={0.1} />
          <MetricTile label="Transactions" value={summary.total_transactions.toLocaleString()} delay={0.15} />
          <MetricTile label="Customers Reached" value={summary.unique_users.toLocaleString()} delay={0.2} />
        </div>

        {/* Performance at a glance */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-1 h-5 rounded-full bg-coral-gradient" />
            <h2 className="text-base font-bold text-ink tracking-tight">Performance at a glance</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-coral-subtle to-white rounded-2xl border border-coral/[0.08] p-6 transition-shadow duration-300 hover:shadow-card"
            >
              <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-coral mb-2.5">Avg. Transaction</p>
              <p className="text-2xl font-bold text-ink">{fmt(avgSpend)}</p>
              <p className="text-xs text-ink-tertiary mt-1.5">per visit</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="bg-gradient-to-br from-accent-green/[0.04] to-white rounded-2xl border border-accent-green/15 p-6 transition-shadow duration-300 hover:shadow-card"
            >
              <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-accent-emerald mb-2.5">Repeat Rate</p>
              <p className="text-2xl font-bold text-ink">{repeatRate.toFixed(0)}%</p>
              <p className="text-xs text-ink-tertiary mt-1.5">of visits are returning customers</p>
            </motion.div>
            {summary.boost_transactions > 0 && (
              <motion.div
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="bg-gradient-to-br from-accent-amber/[0.06] to-white rounded-2xl border border-accent-amber/15 p-6 transition-shadow duration-300 hover:shadow-card"
              >
                <p className="text-[10px] uppercase tracking-[0.1em] font-bold text-accent-amber mb-2.5">Boost Revenue</p>
                <p className="text-2xl font-bold text-ink">{fmt(summary.boost_revenue)}</p>
                <p className="text-xs text-ink-tertiary mt-1.5">from time-boost periods</p>
              </motion.div>
            )}
          </div>
        </motion.section>

        {/* Spend trend */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-1 h-5 rounded-full bg-coral-gradient" />
            <h2 className="text-base font-bold text-ink tracking-tight">Spend trend</h2>
          </div>
          <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6">
            <SpendTrendChart data={summary.monthly_breakdown} metric="spend" showOnOffBands />
            <p className="text-[11px] text-ink-tertiary mt-4 text-center">
              Monthly spend across all Yonder members · highlighted months = active on Yonder
            </p>
          </div>
        </motion.section>

        {/* New vs Existing */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14"
        >
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-1 h-5 rounded-full bg-coral-gradient" />
            <h2 className="text-base font-bold text-ink tracking-tight">New vs returning customers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6">
              <NewVsExistingChart data={summary.monthly_breakdown} metric="spend" />
            </div>
            <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6 flex flex-col justify-center gap-5">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-coral shrink-0" />
                <div>
                  <p className="text-[11px] text-ink-tertiary uppercase tracking-wider">New customer spend</p>
                  <p className="font-bold text-ink text-lg">{fmt(summary.new_spend_gbp)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-navy-200 shrink-0" />
                <div>
                  <p className="text-[11px] text-ink-tertiary uppercase tracking-wider">Returning customer spend</p>
                  <p className="font-bold text-ink text-lg">{fmt(summary.repeat_spend_gbp)}</p>
                </div>
              </div>
              <p className="text-[11px] text-ink-tertiary leading-relaxed pt-3 border-t border-surface-border">
                New customers are those whose first transaction with {summary.display_name} via Yonder falls within the reporting window.
              </p>
            </div>
          </div>
        </motion.section>

        {/* Insights */}
        {summary.insights.length > 0 && (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="mb-14"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-1 h-5 rounded-full bg-coral-gradient" />
              <h2 className="text-base font-bold text-ink tracking-tight">Key findings</h2>
            </div>
            <div className="space-y-2.5">
              {summary.insights.map((insight, i) => (
                <InsightCard key={i} text={insight} index={i} />
              ))}
            </div>
          </motion.section>
        )}

        {/* Full report link */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="mb-12 flex items-center justify-between gap-6 py-5 border-t border-b border-surface-border"
        >
          <div>
            <p className="text-sm font-semibold text-ink">Full report available</p>
            <p className="text-xs text-ink-tertiary mt-0.5">Monthly breakdown, commercial model, and methodology</p>
          </div>
          <Link
            href={`/report/${slug}`}
            className="shrink-0 inline-flex items-center gap-2 bg-coral-gradient text-white font-semibold text-sm px-5 py-2.5 rounded-xl hover:shadow-glow-coral transition-all duration-300"
          >
            View full report →
          </Link>
        </motion.section>

        {/* Footer */}
        <div className="pt-6 border-t border-surface-border flex items-center justify-between text-[11px] text-ink-tertiary">
          <span>Powered by Yonder · Confidential</span>
          <Link href={`/report/${slug}`} className="text-coral hover:text-coral-dark font-medium transition-colors duration-200">
            View full report →
          </Link>
        </div>
      </div>
    </main>
  )
}
