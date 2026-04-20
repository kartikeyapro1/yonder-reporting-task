'use client'

import { motion } from 'framer-motion'
import { SpendTrendChart } from '@/components/charts/SpendTrendChart'
import { NewVsExistingChart } from '@/components/charts/NewVsExistingChart'
import type { PartnerSummaryMetrics, CommercialModel } from '@/lib/types'

interface Props {
  summary: PartnerSummaryMetrics
  commercials: CommercialModel[]
}

function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}m`
  if (n >= 1000) return `£${(n / 1000).toFixed(1)}k`
  return `£${n.toFixed(2)}`
}

function fmtRaw(n: number) {
  return `£${n.toFixed(2)}`
}

function describeModel(model: CommercialModel): string {
  switch (model.type) {
    case 'cpa_new_repeat':
      return `CPA — £${model.cpa_new} new customer · £${model.cpa_repeat} repeat customer`
    case 'pct_spend_new_repeat':
      return `Commission — ${((model.pct_new ?? 0) * 100).toFixed(0)}% on new spend · ${((model.pct_repeat ?? 0) * 100).toFixed(0)}% on repeat spend`
    case 'blended_commission':
      return `Blended commission — ${((model.blended_rate ?? 0) * 100).toFixed(1)}% on all spend`
    case 'fixed_fee':
      return `Fixed fee — ${fmt(model.fixed_monthly ?? 0)} /month`
    default:
      return model.type
  }
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-bold text-ink tracking-tight">{title}</h2>
      {sub && <p className="text-xs text-ink-tertiary mt-0.5">{sub}</p>}
    </div>
  )
}

function DataRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-surface-border last:border-0">
      <span className="text-sm text-ink-secondary">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? 'text-accent-green' : 'text-ink'}`}>{value}</span>
    </div>
  )
}

export function ReportPage({ summary, commercials }: Props) {
  const now = new Date()
  const generatedAt = now.toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric'
  })

  const avgSpend = summary.total_transactions > 0
    ? summary.total_spend_gbp / summary.total_transactions
    : 0

  const revenueMargin = summary.total_spend_gbp > 0
    ? (summary.total_revenue / summary.total_spend_gbp) * 100
    : 0

  const activeMonths = summary.monthly_breakdown.filter(m => m.is_on_yonder).length
  const totalMonths = summary.monthly_breakdown.length

  return (
    <div className="min-h-screen bg-white">
      {/* Report header bar */}
      <div className="bg-navy-gradient text-white">
        <div className="max-w-3xl mx-auto px-8 py-10">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-md bg-coral flex items-center justify-center">
                  <span className="text-white text-xs font-bold">Y</span>
                </div>
                <span className="text-white/70 text-sm font-medium">Yonder Partner Report</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{summary.display_name}</h1>
              <p className="text-white/60 mt-1 text-sm">{summary.period_label}</p>
            </div>
            <div className="text-right text-xs text-white/50">
              <p>Generated {generatedAt}</p>
              <p className="mt-0.5">Confidential</p>
            </div>
          </div>

          {/* Top-level headline */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { label: 'Total Spend', value: fmt(summary.total_spend_gbp) },
              { label: 'Revenue Earned', value: fmt(summary.total_revenue) },
              { label: 'Transactions', value: summary.total_transactions.toLocaleString() },
              { label: 'Customers', value: summary.unique_users.toLocaleString() },
            ].map((kpi, i) => (
              <motion.div
                key={kpi.label}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07 }}
                className="bg-white/10 rounded-xl px-4 py-3 border border-white/10"
              >
                <p className="text-white/50 text-xs uppercase tracking-wider mb-1">{kpi.label}</p>
                <p className="text-white text-xl font-bold">{kpi.value}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Report body */}
      <div className="max-w-3xl mx-auto px-8 py-12 space-y-12">

        {/* Executive summary */}
        <section>
          <SectionHeader title="Executive Summary" />
          <div className="bg-surface-muted rounded-2xl border border-surface-border p-6 space-y-3">
            {summary.insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06 }}
                className="flex gap-3 text-sm text-ink-secondary"
              >
                <span className="text-coral/80 mt-0.5 shrink-0">→</span>
                <p>{insight}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Commercial model */}
        <section>
          <SectionHeader title="Commercial Model" sub="Revenue methodology applied in this period" />
          <div className="bg-white rounded-2xl border border-surface-border p-6">
            {commercials.map((model, i) => (
              <div key={i} className="text-sm">
                <p className="font-semibold text-ink mb-1">{describeModel(model)}</p>
                <p className="text-ink-tertiary text-xs">Effective from {model.effective_from}{model.effective_to ? ` to ${model.effective_to}` : ''}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Transaction summary */}
        <section>
          <SectionHeader title="Transaction Summary" />
          <div className="bg-white rounded-2xl border border-surface-border p-6">
            <DataRow label="Total transactions" value={summary.total_transactions.toLocaleString()} />
            <DataRow label="Settled transactions" value={summary.settled_transactions.toLocaleString()} />
            <DataRow label="Total spend (GBP)" value={fmt(summary.total_spend_gbp)} />
            <DataRow label="Average transaction value" value={fmt(avgSpend)} />
            <DataRow label="Unique customers" value={summary.unique_users.toLocaleString()} />
            <DataRow label="New customers" value={summary.new_users.toLocaleString()} />
          </div>
        </section>

        {/* Revenue breakdown */}
        <section>
          <SectionHeader title="Revenue Breakdown" />
          <div className="bg-white rounded-2xl border border-surface-border p-6">
            <DataRow label="Total revenue" value={fmt(summary.total_revenue)} highlight />
            <DataRow label="Revenue from new customers" value={fmt(summary.new_revenue)} highlight />
            <DataRow label="Revenue from repeat customers" value={fmt(summary.repeat_revenue)} highlight />
            {summary.boost_revenue > 0 && (
              <DataRow label="Revenue from boost periods" value={fmt(summary.boost_revenue)} highlight />
            )}
            <DataRow label="Effective revenue margin" value={`${revenueMargin.toFixed(2)}%`} />
          </div>
        </section>

        {/* New vs repeat */}
        <section>
          <SectionHeader title="New vs Returning Customers" />
          <div className="bg-white rounded-2xl border border-surface-border p-6">
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-xs text-ink-tertiary uppercase tracking-wide mb-2">New</p>
                <p className="text-2xl font-bold text-ink">{summary.new_transactions}</p>
                <p className="text-xs text-ink-secondary mt-0.5">transactions · {fmt(summary.new_spend_gbp)} spend</p>
                <p className="text-xs text-accent-green font-semibold mt-0.5">{fmt(summary.new_revenue)} revenue</p>
              </div>
              <div>
                <p className="text-xs text-ink-tertiary uppercase tracking-wide mb-2">Repeat</p>
                <p className="text-2xl font-bold text-ink">{summary.repeat_transactions}</p>
                <p className="text-xs text-ink-secondary mt-0.5">transactions · {fmt(summary.repeat_spend_gbp)} spend</p>
                <p className="text-xs text-accent-green font-semibold mt-0.5">{fmt(summary.repeat_revenue)} revenue</p>
              </div>
            </div>
            <NewVsExistingChart data={summary.monthly_breakdown} metric="transactions" />
          </div>
        </section>

        {/* On/Off Yonder (Scenario 1 — only rendered if relevant) */}
        {(summary.on_yonder_spend > 0 || summary.off_yonder_spend > 0) && (
          <section>
            <SectionHeader title="On vs Off Yonder — Incremental Spend" sub="Comparing spend during active Yonder periods vs inactive periods" />
            <div className="bg-white rounded-2xl border border-surface-border p-6">
              <DataRow label="Spend during active (on Yonder) months" value={fmt(summary.on_yonder_spend)} />
              <DataRow label="Spend during inactive (off Yonder) months" value={fmt(summary.off_yonder_spend)} />
              <DataRow
                label="Incremental uplift"
                value={`${summary.incremental_spend >= 0 ? '+' : ''}${fmt(summary.incremental_spend)}`}
                highlight={summary.incremental_spend > 0}
              />
              <div className="mt-5">
                <SpendTrendChart data={summary.monthly_breakdown} metric="spend" showOnOffBands />
                <p className="text-xs text-ink-tertiary mt-2 text-center">
                  Blue highlighted = months on Yonder
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Boost period */}
        {summary.boost_transactions > 0 && (
          <section>
            <SectionHeader title="Time Boost Performance" sub="Transactions matched to time-boost offer windows" />
            <div className="bg-white rounded-2xl border border-surface-border p-6">
              <DataRow label="Boost transactions" value={summary.boost_transactions.toLocaleString()} />
              <DataRow label="Boost spend" value={fmt(summary.boost_spend_gbp)} />
              <DataRow label="Boost revenue" value={fmt(summary.boost_revenue)} highlight />
            </div>
          </section>
        )}

        {/* Spend trend chart */}
        <section>
          <SectionHeader title="Monthly Spend Trend" />
          <div className="bg-white rounded-2xl border border-surface-border p-6">
            <SpendTrendChart data={summary.monthly_breakdown} metric="spend" />
          </div>
        </section>

        {/* Monthly detail table */}
        <section>
          <SectionHeader title="Monthly Detail" />
          <div className="bg-white rounded-2xl border border-surface-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-muted">
                  <th className="text-left px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Month</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">On Yonder</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Txns</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Spend</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Revenue</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">New</th>
                </tr>
              </thead>
              <tbody>
                {summary.monthly_breakdown.map(m => {
                  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                  const [y, mo] = m.year_month.split('-')
                  const label = `${months[parseInt(mo) - 1]} ${y}`
                  return (
                    <tr key={m.year_month} className="border-t border-surface-border">
                      <td className="px-5 py-2.5 font-medium text-ink">{label}</td>
                      <td className="px-4 py-2.5 text-center text-xs">
                        {m.is_on_yonder
                          ? <span className="text-accent-green font-semibold">Yes</span>
                          : <span className="text-ink-tertiary">—</span>
                        }
                      </td>
                      <td className="px-4 py-2.5 text-right text-ink-secondary">{m.settled_transactions}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-ink">{fmt(m.total_spend_gbp)}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-accent-green font-semibold">{fmt(m.total_revenue)}</td>
                      <td className="px-5 py-2.5 text-right text-ink-secondary">{m.new_transactions}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Methodology footnotes */}
        <section className="border-t border-surface-border pt-8">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-ink-tertiary mb-3">Methodology & Notes</h3>
          <div className="space-y-1.5 text-xs text-ink-tertiary leading-relaxed">
            <p>· Only settled transactions are included in revenue calculations. Declined and pending transactions are excluded.</p>
            <p>· "New customer" is defined as a user whose first settled transaction with this partner falls on or after the baseline date for this partner.</p>
            <p>· "On Yonder" periods are defined in the partner active period configuration and cover full calendar months.</p>
            <p>· Incremental spend is the raw difference between on-Yonder and off-Yonder settled spend. No seasonality or volume normalisation has been applied.</p>
            <p>· FX transactions are converted to GBP using the fx_rate field in the transaction record (foreign units per GBP). Where fx_rate is absent, charged_amount (GBP) is used as fallback.</p>
            <p>· Boost revenue applies to transactions matched to time-based offer windows in the experience_visited dataset.</p>
          </div>
        </section>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-ink-tertiary pt-4">
          <span>© Yonder · Confidential · {generatedAt}</span>
          <span>Auto-generated report</span>
        </div>

      </div>
    </div>
  )
}
