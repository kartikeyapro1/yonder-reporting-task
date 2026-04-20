'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { InsightCard } from '@/components/ui/InsightCard'
import { SpendTrendChart } from '@/components/charts/SpendTrendChart'
import { OnOffComparisonChart } from '@/components/charts/OnOffComparisonChart'
import { NewVsExistingChart } from '@/components/charts/NewVsExistingChart'
import type { PartnerSummaryMetrics } from '@/lib/types'

interface Props {
  summary: PartnerSummaryMetrics
}

function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}m`
  if (n >= 1000) return `£${(n / 1000).toFixed(1)}k`
  return `£${n.toFixed(0)}`
}

function pct(a: number, b: number) {
  if (b === 0) return '0%'
  return `${((a / b) * 100).toFixed(0)}%`
}

type ChartTab = 'spend' | 'revenue' | 'on-off' | 'new-repeat'

export function InternalPartnerDetailClient({ summary }: Props) {
  const [chartTab, setChartTab] = useState<ChartTab>('spend')

  const slug = summary.partner_name.toLowerCase().replace(/\s+/g, '-')
  const hasOnOff = summary.on_yonder_spend > 0 || summary.off_yonder_spend > 0
  const incrementalPositive = summary.incremental_spend > 0

  return (
    <main className="max-w-screen-xl mx-auto px-6 py-10">

      {/* Breadcrumb + actions */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-ink-tertiary mb-1">
            <Link href="/internal" className="hover:text-ink-secondary transition-colors">Partners</Link>
            <span>/</span>
            <span>{summary.display_name}</span>
          </div>
          <h1 className="text-2xl font-bold text-ink tracking-tight">{summary.display_name}</h1>
          <p className="text-ink-secondary text-sm mt-0.5">{summary.period_label}</p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/partner/${slug}`}
            className="text-sm font-medium px-4 py-2 rounded-xl border border-surface-border bg-white hover:bg-surface-muted transition-colors"
          >
            Partner view →
          </Link>
          <Link
            href={`/report/${slug}`}
            className="text-sm font-medium px-4 py-2 rounded-xl bg-coral text-white hover:bg-coral-dark transition-colors"
          >
            View report
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <KpiCard label="Total Spend" value={fmt(summary.total_spend_gbp)} accent="neutral" delay={0} />
        <KpiCard label="Total Revenue" value={fmt(summary.total_revenue)} accent="green" delay={0.05} />
        <KpiCard label="Transactions" value={summary.total_transactions.toLocaleString()} accent="purple" delay={0.1} />
        <KpiCard label="Unique Users" value={summary.unique_users.toLocaleString()} accent="amber" delay={0.15} />
      </div>

      {/* Incremental spend callout (Scenario 1) */}
      {hasOnOff && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`rounded-2xl border px-6 py-5 mb-8 flex items-start gap-4 ${
            incrementalPositive
              ? 'bg-accent-green/5 border-accent-green/20'
              : 'bg-surface-muted border-surface-border'
          }`}
        >
          <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            incrementalPositive ? 'bg-accent-green/15 text-accent-green' : 'bg-surface-border text-ink-tertiary'
          }`}>
            <svg width="18" height="18" fill="none" viewBox="0 0 18 18">
              <path d="M3 13L7 9L10 12L15 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-ink text-sm mb-0.5">Incremental Spend Analysis</p>
            <div className="flex flex-wrap gap-8 mt-2 text-sm">
              <div>
                <p className="text-xs text-ink-tertiary uppercase tracking-wide mb-0.5">On Yonder</p>
                <p className="font-bold text-ink">{fmt(summary.on_yonder_spend)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-tertiary uppercase tracking-wide mb-0.5">Off Yonder</p>
                <p className="font-bold text-ink">{fmt(summary.off_yonder_spend)}</p>
              </div>
              <div>
                <p className="text-xs text-ink-tertiary uppercase tracking-wide mb-0.5">Incremental Delta</p>
                <p className={`font-bold ${incrementalPositive ? 'text-accent-green' : 'text-accent-red'}`}>
                  {incrementalPositive ? '+' : ''}{fmt(summary.incremental_spend)}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Charts + breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-ink text-sm">Trends</h3>
              <div className="flex gap-1 bg-surface-muted rounded-lg p-0.5">
                {(['spend', 'revenue', 'on-off', 'new-repeat'] as ChartTab[]).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setChartTab(tab)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                      chartTab === tab
                        ? 'bg-white text-ink shadow-sm'
                        : 'text-ink-tertiary hover:text-ink-secondary'
                    }`}
                  >
                    {tab === 'on-off' ? 'On/Off' : tab === 'new-repeat' ? 'New/Repeat' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            {chartTab === 'spend' && <SpendTrendChart data={summary.monthly_breakdown} metric="spend" showOnOffBands />}
            {chartTab === 'revenue' && <SpendTrendChart data={summary.monthly_breakdown} metric="revenue" />}
            {chartTab === 'on-off' && <OnOffComparisonChart data={summary.monthly_breakdown} />}
            {chartTab === 'new-repeat' && <NewVsExistingChart data={summary.monthly_breakdown} metric="spend" />}
          </Card>
        </div>

        {/* New vs Existing breakdown */}
        <div className="flex flex-col gap-4">
          <Card className="p-5">
            <h3 className="font-semibold text-ink text-sm mb-4">New vs Existing</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-ink-tertiary mb-1">
                  <span>New customers</span>
                  <span>{pct(summary.new_transactions, summary.total_transactions)}</span>
                </div>
                <div className="h-1.5 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-coral rounded-full transition-all"
                    style={{ width: pct(summary.new_transactions, summary.total_transactions) }}
                  />
                </div>
              </div>
                <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-coral-subtle rounded-xl p-3">
                  <p className="text-xs text-ink-tertiary mb-1">New</p>
                  <p className="font-bold text-ink text-base">{summary.new_transactions}</p>
                  <p className="text-xs text-ink-secondary">{fmt(summary.new_spend_gbp)} spend</p>
                  <p className="text-xs text-accent-green font-medium mt-0.5">{fmt(summary.new_revenue)} rev</p>
                </div>
                <div className="bg-surface-muted rounded-xl p-3">
                  <p className="text-xs text-ink-tertiary mb-1">Repeat</p>
                  <p className="font-bold text-ink text-base">{summary.repeat_transactions}</p>
                  <p className="text-xs text-ink-secondary">{fmt(summary.repeat_spend_gbp)} spend</p>
                  <p className="text-xs text-accent-green font-medium mt-0.5">{fmt(summary.repeat_revenue)} rev</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-ink text-sm mb-3">Boost Activity</h3>
            {summary.boost_transactions > 0 ? (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-ink-secondary">Boost txns</span>
                  <Badge label="time boost" variant="boost" />
                </div>
                <p className="text-2xl font-bold text-ink">{summary.boost_transactions}</p>
                <p className="text-xs text-ink-tertiary">{fmt(summary.boost_spend_gbp)} spend · {fmt(summary.boost_revenue)} revenue</p>
              </div>
            ) : (
              <p className="text-sm text-ink-tertiary">No boost transactions in period.</p>
            )}
          </Card>
        </div>
      </div>

      {/* Insights */}
      {summary.insights.length > 0 && (
        <div className="mb-8">
          <h3 className="font-semibold text-ink text-sm mb-3">Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {summary.insights.map((insight, i) => (
              <InsightCard key={i} text={insight} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Monthly breakdown table */}
      <Card className="overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border">
          <h3 className="font-semibold text-ink text-sm">Monthly Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-muted">
                <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Month</th>
                <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Status</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Txns</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Spend</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Revenue</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">New</th>
                <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Repeat</th>
                <th className="text-right px-6 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Users</th>
              </tr>
            </thead>
            <tbody>
              {summary.monthly_breakdown.map((m, i) => {
                const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                const [y, mo] = m.year_month.split('-')
                const label = `${months[parseInt(mo) - 1]} ${y}`
                return (
                  <tr key={m.year_month} className="border-t border-surface-border hover:bg-surface-muted/50 transition-colors">
                    <td className="px-6 py-3 font-medium text-ink">{label}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        label={m.is_on_yonder ? 'On' : 'Off'}
                        variant={m.is_on_yonder ? 'active' : 'inactive'}
                      />
                    </td>
                    <td className="px-4 py-3 text-right text-ink-secondary">{m.settled_transactions}</td>
                    <td className="px-4 py-3 text-right font-mono text-ink">{fmt(m.total_spend_gbp)}</td>
                    <td className="px-4 py-3 text-right font-mono text-accent-green font-semibold">{fmt(m.total_revenue)}</td>
                    <td className="px-4 py-3 text-right text-ink-secondary">{m.new_transactions}</td>
                    <td className="px-4 py-3 text-right text-ink-secondary">{m.repeat_transactions}</td>
                    <td className="px-6 py-3 text-right text-ink-secondary">{m.unique_users}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </main>
  )
}
