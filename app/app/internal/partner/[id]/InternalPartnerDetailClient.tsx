'use client'

import { useState, useMemo, useRef } from 'react'
import Link from 'next/link'
import { Download, Link2, Check, ArrowRight, ExternalLink, CalendarRange, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { KpiCard } from '@/components/ui/KpiCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { InsightCard } from '@/components/ui/InsightCard'
import { SpendTrendChart } from '@/components/charts/SpendTrendChart'
import { OnOffComparisonChart } from '@/components/charts/OnOffComparisonChart'
import { NewVsExistingChart } from '@/components/charts/NewVsExistingChart'
import { PARTNER_CONFIGS } from '@/lib/config/partner-commercials'
import { FadeIn, StaggerList, StaggerItem, ScaleIn } from '@/components/motion'
import CountUp from '@/components/ui/CountUp'
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

function fmtMonthLabel(ym: string) {
  const [y, m] = ym.split('-')
  const names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${names[parseInt(m) - 1]} ${y}`
}

type ChartTab = 'spend' | 'commission' | 'on-off' | 'new-repeat'

export function InternalPartnerDetailClient({ summary }: Props) {
  const [chartTab, setChartTab] = useState<ChartTab>('spend')
  const [linkState, setLinkState] = useState<'idle' | 'loading' | 'copied'>('idle')

  // Date range filter
  const months = summary.monthly_breakdown.map(m => m.year_month)
  const [fromMonth, setFromMonth] = useState(months[0] ?? '')
  const [toMonth, setToMonth] = useState(months[months.length - 1] ?? '')
  const isFiltered = fromMonth !== months[0] || toMonth !== months[months.length - 1]

  const filteredMonthly = useMemo(() => {
    return summary.monthly_breakdown.filter(
      m => m.year_month >= fromMonth && m.year_month <= toMonth
    )
  }, [summary.monthly_breakdown, fromMonth, toMonth])

  function resetRange() {
    setFromMonth(months[0] ?? '')
    setToMonth(months[months.length - 1] ?? '')
  }

  // Derived totals from filtered range
  const rangeSpend     = filteredMonthly.reduce((s, m) => s + m.total_spend_gbp, 0)
  const rangeRevenue   = filteredMonthly.reduce((s, m) => s + m.total_revenue, 0)
  const rangeTx        = filteredMonthly.reduce((s, m) => s + m.settled_transactions, 0)
  const rangeUsers     = filteredMonthly.reduce((s, m) => s + m.unique_users, 0)

  async function handleGenerateLink() {
    setLinkState('loading')
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerName: summary.partner_name }),
        credentials: 'same-origin',
      })
      if (!res.ok) throw new Error('Failed')
      const { url } = await res.json()
      await navigator.clipboard.writeText(url)
      setLinkState('copied')
      toast.success('Magic link copied to clipboard')
      setTimeout(() => setLinkState('idle'), 2500)
    } catch {
      setLinkState('idle')
    }
  }

  const token = PARTNER_CONFIGS.find(c => c.partner_name === summary.partner_name)?.partner_token ?? ''
  const hasOnOff = summary.on_months_count > 0 && summary.off_months_count > 0
  const incrementalPositive = summary.incremental_spend > 0
  const newPct = pct(summary.new_transactions, summary.total_transactions)
  const slug = summary.partner_name.toLowerCase().replace(/\s+/g, '-')

  // Chart drill-down — clicking a data point scrolls to + highlights that month in the table
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null)
  const tableRef = useRef<HTMLDivElement>(null)

  function handleMonthClick(month: string) {
    setSelectedMonth(prev => prev === month ? null : month)
    setTimeout(() => {
      tableRef.current?.querySelector(`[data-month="${month}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)
  }

  return (
    <main className="max-w-screen-xl mx-auto px-6 py-8">

      {/* Breadcrumb + actions */}
      <FadeIn y={16} duration={0.5}>
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-ink-300 mb-2">
              <Link href="/internal" className="hover:text-coral transition-colors duration-300">Partners</Link>
              <span className="text-ink-200">/</span>
              <span className="text-ink-500">{summary.display_name}</span>
            </div>
            <h1 className="text-3xl font-display font-semibold text-ink-900 tracking-display">{summary.display_name}</h1>
            <p className="text-sm text-ink-400 mt-1">{summary.period_label}</p>
          </div>
          <div className="flex gap-2.5">
            <a
              href={`/api/partners/${slug}/export?format=html`}
              download
              className="text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200/80 bg-white hover:bg-sand-50
                hover:border-coral/20 transition-all duration-300 text-ink-600 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" /> Export
            </a>
            <button
              onClick={handleGenerateLink}
              disabled={linkState === 'loading'}
              className="text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200/80 bg-white hover:bg-sand-50
                hover:border-coral/20 transition-all duration-300 text-ink-600
                disabled:opacity-50 disabled:cursor-wait flex items-center gap-1.5"
            >
              {linkState === 'loading' && (
                <svg className="animate-spin h-3.5 w-3.5 shrink-0" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                </svg>
              )}
              {linkState === 'copied'
                ? <><Check className="w-3.5 h-3.5" /> Copied!</>
                : <><Link2 className="w-3.5 h-3.5" /> Magic link</>}
            </button>
            <Link
              href={`/partner/${token}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium px-4 py-2.5 rounded-xl border border-gray-200/80 bg-white hover:bg-sand-50
                hover:border-coral/20 transition-all duration-300 text-ink-600 flex items-center gap-1.5"
            >
              Partner view <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={`/report/${token}`}
              className="text-sm font-medium px-4 py-2.5 rounded-xl bg-coral text-white
                hover:bg-coral-dark hover:shadow-glow-coral transition-all duration-300 flex items-center gap-1.5"
            >
              View report <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </FadeIn>

      {/* ── Date range filter ─────────────────────────────── */}
      {months.length > 1 && (
        <FadeIn delay={0.15}>
          <div className="flex items-center gap-3 mb-6 px-0.5">
            <CalendarRange className="w-3.5 h-3.5 text-ink-300 shrink-0" />
            <div className="flex items-center gap-2">
              <select
                value={fromMonth}
                onChange={e => { setFromMonth(e.target.value); if (e.target.value > toMonth) setToMonth(e.target.value) }}
                className="text-xs font-medium text-ink-600 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5
                  outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral/30 transition-all cursor-pointer"
              >
                {months.map(m => (
                  <option key={m} value={m}>{fmtMonthLabel(m)}</option>
                ))}
              </select>
              <span className="text-xs text-ink-300">–</span>
              <select
                value={toMonth}
                onChange={e => { setToMonth(e.target.value); if (e.target.value < fromMonth) setFromMonth(e.target.value) }}
                className="text-xs font-medium text-ink-600 bg-white border border-gray-200 rounded-lg px-2.5 py-1.5
                  outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral/30 transition-all cursor-pointer"
              >
                {months.map(m => (
                  <option key={m} value={m}>{fmtMonthLabel(m)}</option>
                ))}
              </select>
            </div>
            {isFiltered && (
              <button
                onClick={resetRange}
                className="flex items-center gap-1 text-xs text-ink-300 hover:text-coral transition-colors duration-200"
              >
                <RotateCcw className="w-3 h-3" /> Reset
              </button>
            )}
            {isFiltered && (
              <span className="text-[11px] text-coral font-medium bg-coral-50 px-2 py-0.5 rounded-full border border-coral-100">
                {filteredMonthly.length} of {months.length} months
              </span>
            )}
          </div>
        </FadeIn>
      )}

      {/* KPI strip */}
      <FadeIn delay={0.1}>
        <div className="flex divide-x divide-gray-100 border-y border-gray-100 mb-6">
          <div className="flex-1 px-6 py-5 first:pl-0">
            <KpiCard label="Member spend" value={fmt(isFiltered ? rangeSpend : summary.total_spend_gbp)} sub={isFiltered ? 'selected range' : undefined} />
          </div>
          <div className="flex-1 px-6 py-5">
            <KpiCard label="Commission" value={fmt(isFiltered ? rangeRevenue : summary.total_revenue)} sub={isFiltered ? 'selected range' : undefined} />
          </div>
          <div className="flex-1 px-6 py-5">
            <KpiCard label="Visits" value={(isFiltered ? rangeTx : summary.total_transactions).toLocaleString()} sub={isFiltered ? 'selected range' : undefined} />
          </div>
          <div className="flex-1 px-6 py-5 last:pr-0">
            <KpiCard label="Members" value={(isFiltered ? rangeUsers : summary.unique_users).toLocaleString()} sub={isFiltered ? 'selected range' : undefined} />
          </div>
        </div>
      </FadeIn>

      {/* Secondary KPI strip */}
      <FadeIn delay={0.15}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-5 border-b border-gray-100 mb-8 pb-6">
          <KpiCard
            label="Points earned"
            value={(summary.total_points_earned ?? 0).toLocaleString()}
            sub="by Yonder cardholders"
          />
          <KpiCard
            label="Experience engagement"
            value={`${((summary.experience_engagement_rate ?? 0) * 100).toFixed(0)}%`}
            sub={`${summary.experience_matched_transactions ?? 0} visits triggered reward`}
          />
          <KpiCard
            label="New members"
            value={summary.new_users.toLocaleString()}
            sub={`${((summary.new_transactions / summary.total_transactions) * 100).toFixed(0)}% of visits`}
          />
          <KpiCard
            label="Denied experiences"
            value={(summary.denied_experience_transactions ?? 0).toLocaleString()}
            sub="card not linked"
          />
        </div>
      </FadeIn>

      {/* Incremental spend callout */}
      {hasOnOff && (
        <ScaleIn delay={0.2}>
          <div className={`rounded-2xl border px-6 py-5 mb-8 flex items-start gap-4 ${
            incrementalPositive
              ? 'bg-coral-50/60 border-coral-100'
              : 'bg-sand-100 border-sand-200'
          }`}>
            <div className={`mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              incrementalPositive ? 'bg-positive/10 text-positive' : 'bg-ink-100 text-ink-300'
            }`}>
              <svg width="16" height="16" fill="none" viewBox="0 0 18 18">
                <path d="M3 13L7 9L10 12L15 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div className="flex-1">
              <p className="font-semibold text-ink-800 text-sm">Spend uplift — active Yonder months vs inactive</p>
              <div className="flex flex-wrap gap-8 mt-3 text-sm">
                <div>
                  <p className="text-[11px] text-ink-300 mb-0.5 uppercase tracking-caps">Avg / month (on Yonder)</p>
                  <p className="font-semibold text-ink-800 text-lg font-tabular">{fmt(summary.avg_monthly_on_spend)}</p>
                  <p className="text-[10px] text-ink-300">{summary.on_months_count} months</p>
                </div>
                <div>
                  <p className="text-[11px] text-ink-300 mb-0.5 uppercase tracking-caps">Avg / month (off Yonder)</p>
                  <p className="font-semibold text-ink-800 text-lg font-tabular">{fmt(summary.avg_monthly_off_spend)}</p>
                  <p className="text-[10px] text-ink-300">{summary.off_months_count} months</p>
                </div>
                <div>
                  <p className="text-[11px] text-ink-300 mb-0.5 uppercase tracking-caps">Monthly uplift</p>
                  <p className={`font-bold font-tabular text-xl ${incrementalPositive ? 'text-coral' : 'text-negative'}`}>
                    {incrementalPositive ? '+' : ''}{fmt(summary.incremental_spend)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </ScaleIn>
      )}

      {/* Charts + breakdown */}
      <FadeIn delay={0.3}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2">
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Performance trends</h3>
                <div className="flex gap-0.5 bg-sand-100 rounded-xl p-0.5" role="tablist" aria-label="Chart view">
                  {(['spend', 'commission', 'on-off', 'new-repeat'] as ChartTab[]).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setChartTab(tab)}
                      role="tab"
                      aria-selected={chartTab === tab}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${
                        chartTab === tab
                          ? 'bg-white text-ink-800 shadow-sm'
                          : 'text-ink-400 hover:text-ink-600'
                      }`}
                    >
                      {tab === 'on-off' ? 'On/Off' : tab === 'new-repeat' ? 'New/Return' : tab === 'commission' ? 'Commission' : 'Spend'}
                    </button>
                  ))}
                </div>
              </div>
              {chartTab === 'spend' && <SpendTrendChart data={filteredMonthly} metric="spend" showOnOffBands onMonthClick={handleMonthClick} selectedMonth={selectedMonth ?? undefined} />}
              {chartTab === 'commission' && <SpendTrendChart data={filteredMonthly} metric="revenue" onMonthClick={handleMonthClick} selectedMonth={selectedMonth ?? undefined} />}
              {chartTab === 'on-off' && <OnOffComparisonChart data={filteredMonthly} />}
              {chartTab === 'new-repeat' && <NewVsExistingChart data={filteredMonthly} metric="spend" onMonthClick={handleMonthClick} selectedMonth={selectedMonth ?? undefined} />}
              {selectedMonth && (
                <p className="text-[11px] text-ink-300 mt-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-coral inline-block" />
                  {fmtMonthLabel(selectedMonth)} highlighted in table
                  <button onClick={() => setSelectedMonth(null)} className="text-ink-300 hover:text-coral transition-colors ml-1">\u00d7 Clear</button>
                </p>
              )}
            </Card>
          </div>

          {/* Customer acquisition */}
          <div className="flex flex-col gap-4">
            <Card className="p-5">
              <h3 className="text-[11px] font-semibold text-ink-400 uppercase tracking-caps mb-4">Acquisition breakdown</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs text-ink-400 mb-1.5">
                    <span>First-time visits</span>
                    <span className="font-tabular font-semibold text-ink-600">{newPct}</span>
                  </div>
                  <div className="h-2 bg-sand-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-coral to-coral-light rounded-full transition-all duration-700"
                      style={{ width: newPct }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3">
                  <div className="bg-coral-50/60 rounded-xl p-3.5 border border-coral-100">
                    <p className="text-[11px] text-ink-400 mb-0.5">New</p>
                    <p className="font-semibold text-ink-800 text-lg font-tabular">{summary.new_transactions}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{fmt(summary.new_spend_gbp)} spend</p>
                    <p className="text-xs text-positive font-medium mt-0.5">{fmt(summary.new_revenue)} rev</p>
                  </div>
                  <div className="bg-sand-50 rounded-xl p-3.5 border border-sand-200">
                    <p className="text-[11px] text-ink-400 mb-0.5">Repeat</p>
                    <p className="font-semibold text-ink-800 text-lg font-tabular">{summary.repeat_transactions}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{fmt(summary.repeat_spend_gbp)} spend</p>
                    <p className="text-xs text-positive font-medium mt-0.5">{fmt(summary.repeat_revenue)} rev</p>
                  </div>
                </div>
              </div>
            </Card>

            {summary.boost_transactions > 0 && (
            <Card className="p-5">
              <h3 className="text-[11px] font-semibold text-ink-400 uppercase tracking-caps mb-3">Time-boost activity</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-ink-400">Boost transactions</span>
                  <Badge label="time boost" variant="boost" />
                </div>
                <p className="text-2xl font-semibold text-ink-800 font-tabular">{summary.boost_transactions}</p>
                <p className="text-xs text-ink-300">{fmt(summary.boost_spend_gbp)} spend · {fmt(summary.boost_revenue)} fee</p>
              </div>
            </Card>
            )}
          </div>
        </div>
      </FadeIn>

      {/* Insights */}
      {summary.insights.length > 0 && (
        <FadeIn delay={0.4}>
          <div className="mb-8">
            <h3 className="text-[11px] font-semibold text-ink-400 uppercase tracking-caps mb-3">Key findings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {summary.insights.map((insight, i) => (
                <InsightCard key={i} text={insight} />
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Monthly breakdown table */}
      <FadeIn delay={0.5}>
        <div ref={tableRef} className="overflow-hidden mb-12 rounded-2xl shadow-card bg-white border border-gray-100/80">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Monthly breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-sand-50/80">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Month</th>
                  {hasOnOff && <th className="text-center px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Status</th>}
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Transactions</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Spend</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Commission</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">New</th>
                  <th className="text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Repeat</th>
                  <th className="text-right px-6 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Customers</th>
                </tr>
              </thead>
              <tbody>
                {filteredMonthly.map((m) => {
                  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
                  const [y, mo] = m.year_month.split('-')
                  const label = `${months[parseInt(mo) - 1]} ${y}`
                  return (
                    <tr
                      key={m.year_month}
                      data-month={m.year_month}
                      className={`border-t border-gray-100/80 transition-colors duration-200 ${
                        selectedMonth === m.year_month
                          ? 'bg-coral-50/70 ring-1 ring-inset ring-coral/20'
                          : 'hover:bg-sand-50/60'
                      } ${
                        m.is_on_yonder && hasOnOff ? 'border-l-[3px] border-l-coral' : ''
                      }`}>
                      <td className="px-6 py-2.5 font-medium text-ink-800">{label}</td>
                      {hasOnOff && (
                      <td className="px-4 py-2.5 text-center">
                        <Badge label={m.is_on_yonder ? 'On' : 'Off'} variant={m.is_on_yonder ? 'active' : 'inactive'} />
                      </td>
                      )}
                      <td className="px-4 py-2.5 text-right text-ink-400 font-tabular">{m.settled_transactions}</td>
                      <td className="px-4 py-2.5 text-right font-tabular text-ink-800">{fmt(m.total_spend_gbp)}</td>
                      <td className="px-4 py-2.5 text-right font-tabular text-coral font-medium">{fmt(m.total_revenue)}</td>
                      <td className="px-4 py-2.5 text-right text-ink-400 font-tabular">{m.new_transactions}</td>
                      <td className="px-4 py-2.5 text-right text-ink-400 font-tabular">{m.repeat_transactions}</td>
                      <td className="px-6 py-2.5 text-right text-ink-400 font-tabular">{m.unique_users}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </FadeIn>
    </main>
  )
}
