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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className="p-6 bg-white rounded-2xl border border-sand-border shadow-card-sm"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-ink-tertiary mb-2">{label}</p>
          <p className="text-3xl font-bold text-ink-warm">{value}</p>
      {sub && <p className="text-xs text-ink-secondary mt-1">{sub}</p>}
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
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-14"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-coral flex items-center justify-center text-white font-bold text-lg shadow-sm">
            {summary.display_name[0]}
          </div>
          <div>
            <p className="text-xs text-ink-tertiary font-medium uppercase tracking-wider">Yonder Partner Report</p>
            <h1 className="text-xl font-bold text-ink-warm">{summary.display_name}</h1>
          </div>
        </div>
        <p className="text-ink-secondary text-sm mb-2">{summary.period_label}</p>

        {/* Coral divider */}
        <div className="mt-6 h-px bg-gradient-to-r from-coral/40 via-coral/10 to-transparent" />
      </motion.div>

      {/* Summary headline numbers */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <MetricTile label="Total Spend" value={fmt(summary.total_spend_gbp)} delay={0.05} />
        <MetricTile label="Your Revenue" value={fmt(summary.total_revenue)} sub="via Yonder" delay={0.1} />
        <MetricTile label="Transactions" value={summary.total_transactions.toLocaleString()} delay={0.15} />
        <MetricTile label="Customers Reached" value={summary.unique_users.toLocaleString()} delay={0.2} />
      </div>

      {/* Value story */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-12"
      >
        <h2 className="text-base font-semibold text-ink mb-5">Performance at a glance</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-coral-subtle to-white rounded-2xl border border-coral/10 p-5">
            <p className="text-xs uppercase tracking-widest font-semibold text-coral mb-2">Avg. Transaction</p>
            <p className="text-2xl font-bold text-ink">{fmt(avgSpend)}</p>
            <p className="text-xs text-ink-tertiary mt-1">per visit</p>
          </div>
          <div className="bg-gradient-to-br from-accent-green/5 to-white rounded-2xl border border-accent-green/20 p-5">
            <p className="text-xs uppercase tracking-widest font-semibold text-accent-green mb-2">Repeat Rate</p>
            <p className="text-2xl font-bold text-ink">{repeatRate.toFixed(0)}%</p>
            <p className="text-xs text-ink-tertiary mt-1">of visits are returning customers</p>
          </div>
          {summary.boost_transactions > 0 && (
            <div className="bg-gradient-to-br from-accent-amber/10 to-white rounded-2xl border border-accent-amber/20 p-5">
              <p className="text-xs uppercase tracking-widest font-semibold text-accent-amber mb-2">Boost Revenue</p>
              <p className="text-2xl font-bold text-ink">{fmt(summary.boost_revenue)}</p>
              <p className="text-xs text-ink-tertiary mt-1">from time-boost periods</p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Spend trend */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="mb-12"
      >
        <h2 className="text-base font-semibold text-ink mb-5">Spend trend</h2>
        <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6">
          <SpendTrendChart data={summary.monthly_breakdown} metric="spend" showOnOffBands />
          <p className="text-xs text-ink-tertiary mt-3 text-center">
            Monthly spend across all Yonder members · highlighted months = active on Yonder
          </p>
        </div>
      </motion.section>

      {/* New vs Existing */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <h2 className="text-base font-semibold text-ink mb-5">New vs returning customers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6">
            <NewVsExistingChart data={summary.monthly_breakdown} metric="spend" />
          </div>
          <div className="bg-white rounded-2xl border border-surface-border shadow-card p-6 flex flex-col justify-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-coral shrink-0" />
              <div>
                <p className="text-xs text-ink-tertiary">New customer spend</p>
                <p className="font-bold text-ink">{fmt(summary.new_spend_gbp)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-navy-200 shrink-0" />
              <div>
                <p className="text-xs text-ink-tertiary">Returning customer spend</p>
                <p className="font-bold text-ink">{fmt(summary.repeat_spend_gbp)}</p>
              </div>
            </div>
            <p className="text-xs text-ink-tertiary leading-relaxed pt-2 border-t border-surface-border">
              New customers are those whose first transaction with {summary.display_name} via Yonder falls within the reporting window.
            </p>
          </div>
        </div>
      </motion.section>

      {/* Insights */}
      {summary.insights.length > 0 && (
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mb-12"
        >
          <h2 className="text-base font-semibold text-ink mb-4">What the data tells us</h2>
          <div className="space-y-2.5">
            {summary.insights.map((insight, i) => (
              <InsightCard key={i} text={insight} index={i} />
            ))}
          </div>
        </motion.section>
      )}

      {/* Footer */}
      <div className="pt-8 border-t border-surface-border flex items-center justify-between text-xs text-ink-tertiary">
        <span>Powered by Yonder · Confidential</span>
        <Link href={`/report/${slug}`} className="text-coral hover:text-coral-dark font-medium transition-colors">
          View full report →
        </Link>
      </div>
      </div>
    </main>
  )
}
