'use client'

import { SpendTrendChart } from '@/components/charts/SpendTrendChart'
import { NewVsExistingChart } from '@/components/charts/NewVsExistingChart'
import { OnOffComparisonChart } from '@/components/charts/OnOffComparisonChart'
import { Download } from 'lucide-react'
import { YonderLogo } from '@/components/brand/YonderLogo'
import { FadeIn } from '@/components/motion'
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

function fmtPlain(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}m`
  if (n >= 1000) return `£${(n / 1000).toFixed(1)}k`
  return `£${Math.round(n)}`
}

function describeModel(model: CommercialModel): string {
  switch (model.type) {
    case 'cpa_new_repeat':
      return `CPA — £${model.cpa_new} per new customer · £${model.cpa_repeat} per repeat customer`
    case 'pct_spend_new_repeat':
      return `Commission — ${((model.pct_new ?? 0) * 100).toFixed(0)}% on new spend · ${((model.pct_repeat ?? 0) * 100).toFixed(0)}% on repeat spend`
    case 'blended_commission':
      return `Blended commission — ${((model.blended_rate ?? 0) * 100).toFixed(1)}% on all spend`
    case 'fixed_fee':
      return `Fixed fee — ${fmtPlain(model.fixed_monthly ?? 0)} per month`
    default:
      return model.type
  }
}

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-xs font-semibold text-ink-900">{title}</h2>
      {sub && <p className="text-xs text-ink-400 mt-0.5">{sub}</p>}
    </div>
  )
}

function DataRow({ label, value, highlight, large }: { label: string; value: string; highlight?: boolean; large?: boolean }) {
  return (
    <div className="flex items-baseline justify-between py-2.5 border-b border-sand-100 last:border-0">
      <span className="text-sm text-ink-400">{label}</span>
      <span className={`font-semibold font-tabular ${large ? 'text-base' : 'text-sm'} ${highlight ? 'text-coral' : 'text-ink-900'}`}>{value}</span>
    </div>
  )
}

import Link from 'next/link'

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

  const repeatRate = summary.total_transactions > 0
    ? (summary.repeat_transactions / summary.total_transactions) * 100
    : 0

  const hasOnOff = summary.on_months_count > 0 && summary.off_months_count > 0
  const incrementalPositive = summary.incremental_spend > 0
  const activeMonthCount = summary.on_months_count
  const inactiveMonthCount = summary.off_months_count

  // Partner-facing download link (uses slug, but token is available in URL param)
  const slug = summary.partner_name.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="min-h-screen bg-sand-50 print:bg-white">

      {/* ── Report header ─────────────────────────────────────────── */}
      <div className="bg-ink-950 text-white print:bg-ink-950">
        <div className="max-w-3xl mx-auto px-8 py-12">
          <div className="flex justify-end mb-4">
            <a
              href={`/api/partners/${slug}/export?format=html`}
              download
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-lg border border-white/20 bg-white/10 hover:bg-coral hover:text-white hover:border-coral transition-all duration-200"
            >
              <Download className="w-3 h-3" /> Download report
            </a>
          </div>

          <div className="flex items-start justify-between mb-8">
            <div>
              <div className="flex items-center gap-3 mb-5">
                <YonderLogo variant="light" size="sm" showWordmark={false} />
                <span className="text-white/40 text-xs font-medium">Yonder · Partner Report</span>
              </div>
              <h1 className="text-3xl font-display font-semibold tracking-display text-white">{summary.display_name}</h1>
              <p className="text-white/35 mt-1.5 text-sm">{summary.period_label}</p>
            </div>
            <div className="text-right text-[11px] text-white/25 shrink-0 mt-1">
              <p>Generated {generatedAt}</p>
              <p className="mt-0.5">Confidential</p>
            </div>
          </div>

          {/* Hero KPIs — editorial strip matching yonder.com partner stats */}
          <div className="flex divide-x divide-white/10 mt-8 pt-8 border-t border-white/10">
            {[
              {
                label: 'Per-month uplift',
                value: hasOnOff ? `${incrementalPositive ? '+' : ''}${fmt(summary.incremental_spend)}` : '—',
                accent: incrementalPositive,
              },
              { label: 'New Yonder members', value: summary.new_users.toLocaleString(), accent: false },
              { label: 'Avg. transaction', value: fmt(avgSpend), accent: false },
              { label: 'Members reached', value: summary.unique_users.toLocaleString(), accent: false },
            ].map((kpi) => (
              <div key={kpi.label} className="flex-1 px-6 first:pl-0 last:pr-0">
                <p className="text-white/35 text-[11px] mb-2">{kpi.label}</p>
                <p className={`text-2xl font-display font-semibold tracking-tight font-tabular ${kpi.accent ? 'text-coral-300' : 'text-white'}`}>{kpi.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Report body ───────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-8 py-10 space-y-12">

        {/* 1. Executive summary */}
        {summary.insights.length > 0 && (
          <FadeIn>
            <section>
              <SectionHeader title="Executive summary" />
              <div className="space-y-3">
                {summary.insights.map((insight, i) => (
                  <div key={i} className="flex gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-coral mt-[0.5em] shrink-0" />
                    <p className="text-[15px] text-ink-500 leading-relaxed">{insight}</p>
                  </div>
                ))}
              </div>
            </section>
          </FadeIn>
        )}

        {/* 2. Value delivered */}
        {hasOnOff && (
          <FadeIn>
            <section>
              <SectionHeader
                title="Value delivered through Yonder"
                sub="Spend during active Yonder periods compared to inactive months"
              />

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="rounded-2xl border border-coral-100 bg-coral-50/60 px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-coral opacity-40" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-coral" />
                    </span>
                    <p className="text-[11px] font-semibold text-coral">On Yonder</p>
                  </div>
                  <p className="text-xl font-semibold text-ink-900 font-tabular">{fmt(summary.avg_monthly_on_spend)}</p>
                  <p className="text-xs text-ink-400 mt-1">avg. monthly spend · {activeMonthCount} {activeMonthCount === 1 ? 'month' : 'months'}</p>
                </div>
                <div className="rounded-2xl border border-sand-200 bg-sand-100 px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full bg-ink-200 shrink-0" />
                    <p className="text-[11px] font-semibold text-ink-300">Off Yonder</p>
                  </div>
                  <p className="text-xl font-semibold text-ink-900 font-tabular">{fmt(summary.avg_monthly_off_spend)}</p>
                  <p className="text-xs text-ink-300 mt-1">
                    avg. monthly spend · {inactiveMonthCount} {inactiveMonthCount === 1 ? 'month' : 'months'}
                  </p>
                </div>
              </div>

              <div className={`rounded-2xl px-5 py-4 mb-5 flex items-center justify-between gap-4 ${
                incrementalPositive
                  ? 'bg-coral-50 border border-coral-100'
                  : 'bg-sand-100 border border-sand-200'
              }`}>
                <div>
                  <p className="text-[11px] font-semibold text-ink-400 mb-1 uppercase tracking-caps">Per-month spend uplift</p>
                  <p className={`text-2xl font-semibold tracking-tight ${incrementalPositive ? 'text-coral' : 'text-ink-400'}`}>
                    {incrementalPositive ? '+' : ''}{fmt(summary.incremental_spend)}
                  </p>
                </div>
                {incrementalPositive && (
                  <p className="text-xs text-ink-400 leading-relaxed max-w-[200px] text-right">
                    Avg. monthly spend difference: active vs inactive periods
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-200/60 bg-white px-5 pt-4 pb-3 shadow-card">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm bg-coral" />
                    <span className="text-[11px] text-ink-300">Active</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm bg-sand-200" />
                    <span className="text-[11px] text-ink-300">Inactive</span>
                  </div>
                </div>
                <OnOffComparisonChart data={summary.monthly_breakdown} />
                <p className="text-[11px] text-ink-300 mt-2">
                  Monthly settled spend. Coral bars indicate months when {summary.display_name} was active on the Yonder platform.
                </p>
              </div>
            </section>
          </FadeIn>
        )}

        {/* 3. Customer growth */}
        <FadeIn>
          <section>
            <SectionHeader title="Customer growth and loyalty" />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
              {[
                { label: 'New Yonder members', value: summary.new_users.toLocaleString() },
                { label: 'Repeat visit rate', value: `${Math.round(repeatRate)}%` },
                { label: 'New member spend', value: fmt(summary.new_spend_gbp) },
                { label: 'Returning member spend', value: fmt(summary.repeat_spend_gbp) },
              ].map(stat => (
                <div key={stat.label} className="rounded-2xl border border-gray-200/60 bg-white px-4 py-3 shadow-card">
                  <p className="text-[11px] font-semibold text-ink-300 mb-1 uppercase tracking-caps">{stat.label}</p>
                  <p className="text-lg font-semibold text-ink-900 font-tabular">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-200/60 bg-white px-5 pt-4 pb-3 shadow-card">
              <p className="text-xs font-semibold text-ink-600 mb-3">New vs returning customer spend by month</p>
              <NewVsExistingChart data={summary.monthly_breakdown} metric="spend" />
              <p className="text-[11px] text-ink-300 mt-2">
                New customers are Yonder members transacting with {summary.display_name} for the first time within the reporting window.
              </p>
            </div>
          </section>
        </FadeIn>

        {/* 4. Spend over time */}
        <FadeIn>
          <section>
            <SectionHeader title="Spend over time" sub="Monthly settled spend from Yonder members" />
            <div className="rounded-2xl border border-gray-200/60 bg-white px-5 pt-4 pb-3 shadow-card">
              <SpendTrendChart data={summary.monthly_breakdown} metric="spend" showOnOffBands={hasOnOff} />
              {hasOnOff && (
                <p className="text-[11px] text-ink-300 mt-2">
                  Shaded bands indicate months when {summary.display_name} was active on the Yonder platform.
                </p>
              )}
            </div>
          </section>
        </FadeIn>

        {/* 5. Commercial return */}
        <FadeIn>
          <section>
            <SectionHeader
            title="Commercial summary"
            sub="Your Yonder partnership investment this period, based on agreed commercial terms"
          />

            <div className="rounded-2xl border border-gray-200/60 bg-white p-5 mb-3 shadow-card">
              {commercials.map((model, i) => (
                <div key={i} className={i > 0 ? 'pt-3 mt-3 border-t border-sand-100' : ''}>
                  <p className="font-semibold text-ink-900 text-sm mb-0.5">{describeModel(model)}</p>
                  <p className="text-[11px] text-ink-300">
                    Effective {model.effective_from}{model.effective_to ? ` – ${model.effective_to}` : ' (current)'}
                  </p>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border border-gray-200/60 bg-white p-5 shadow-card">
              <DataRow label="First-time member commission" value={fmt(summary.new_revenue)} highlight />
              <DataRow label="Returning member commission" value={fmt(summary.repeat_revenue)} highlight />
              {summary.boost_revenue > 0 && (
                <DataRow label="Time-boost period commission" value={fmt(summary.boost_revenue)} highlight />
              )}
              {summary.enhanced_rate_transactions > 0 && (
                <DataRow
                  label={`Enhanced rate visits (${summary.enhanced_rate_transactions.toLocaleString()} transactions)`}
                  value={fmt(summary.enhanced_rate_spend_gbp)}
                />
              )}
              {summary.denied_experience_transactions > 0 && (
                <DataRow
                  label={`Card not linked — visits unable to redeem (${summary.denied_experience_transactions})`}
                  value="—"
                />
              )}
              <DataRow label="Total Yonder commission" value={fmt(summary.total_revenue)} highlight large />
              <DataRow label="Effective rate" value={`${revenueMargin.toFixed(2)}% of total card spend`} />
              {(summary.total_points_earned ?? 0) > 0 && (
                <DataRow
                  label={`Yonder points earned by members`}
                  value={(summary.total_points_earned ?? 0).toLocaleString()}
                />
              )}
            </div>
          </section>
        </FadeIn>

        {/* 6. Monthly breakdown */}
        <FadeIn>
          <section>
            <SectionHeader title="Monthly performance breakdown" />
            <div className="rounded-2xl border border-gray-200/60 bg-white overflow-hidden shadow-card">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-sand-100 bg-sand-50">
                    <th className="text-left px-5 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Month</th>
                    {hasOnOff && (
                      <th className="text-center px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Status</th>
                    )}
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Transactions</th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Spend</th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Commission</th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Points</th>
                    <th className="text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">New</th>
                    <th className="text-right px-5 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Customers</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.monthly_breakdown.map((m) => {
                    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                    const [y, mo] = m.year_month.split('-')
                    const label = `${months[parseInt(mo) - 1]} ${y}`
                    const isActive = m.is_on_yonder
                    return (
                      <tr
                        key={m.year_month}
                        className={`border-t border-sand-100 print:bg-transparent transition-colors ${
                          isActive ? 'bg-coral-50/30' : 'hover:bg-sand-50'
                        }`}
                      >
                        <td className="px-5 py-2.5 font-semibold text-ink-900">{label}</td>
                        {hasOnOff && (
                          <td className="px-4 py-2.5 text-center">
                            {isActive
                              ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-coral"><span className="w-1.5 h-1.5 rounded-full bg-coral inline-block" /> Active</span>
                              : <span className="text-ink-300 text-xs">—</span>
                            }
                          </td>
                        )}
                        <td className="px-4 py-2.5 text-right text-ink-400 font-tabular">{m.settled_transactions}</td>
                        <td className="px-4 py-2.5 text-right font-tabular text-ink-900">{fmt(m.total_spend_gbp)}</td>
                        <td className="px-4 py-2.5 text-right font-tabular text-coral font-semibold">{fmt(m.total_revenue)}</td>
                        <td className="px-4 py-2.5 text-right text-ink-400 font-tabular">{(m.total_points_earned ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-right text-ink-400 font-tabular">{m.new_transactions}</td>
                        <td className="px-5 py-2.5 text-right text-ink-400 font-tabular">{m.unique_users}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        </FadeIn>

        {/* 7. Methodology */}
        <FadeIn>
          <section className="border-t border-sand-200 pt-8">
            <h3 className="text-[11px] font-semibold text-ink-300 uppercase tracking-caps mb-3">Methodology &amp; notes</h3>
            <div className="space-y-1.5 text-[11px] text-ink-300 leading-relaxed">
              <p>· Only settled transactions are included in revenue calculations.</p>
              <p>· &quot;New member&quot; is defined as a Yonder member whose first settled transaction with this partner falls on or after the baseline date.</p>
              <p>· &quot;On Yonder&quot; periods cover full calendar months as defined in the partner active period configuration.</p>
              <p>· Incremental spend is the per-month normalised difference between avg. on-Yonder and avg. off-Yonder spend. No seasonality adjustment applied.</p>
              <p>· FX transactions are converted to GBP using the fx_rate field. Where absent, charged_amount (GBP) is used as fallback.</p>
              {summary.boost_transactions > 0 && (
                <p>· Boost revenue applies to transactions matched to time-based offer windows.</p>
              )}
            </div>
          </section>
        </FadeIn>

        <div className="flex items-center justify-between text-[11px] text-ink-300 pt-2 pb-4">
          <div className="flex items-center gap-3">
            <YonderLogo variant="dark" size="sm" showWordmark={false} />
            <span>© Yonder · Confidential · {generatedAt}</span>
          </div>
          <span className="text-ink-200">Prepared by Yonder</span>
        </div>
      </div>
    </div>
  )
}
