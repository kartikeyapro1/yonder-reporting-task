/**
 * partner-report-summary.ts
 *
 * Produces the final rolled-up PartnerSummaryMetrics used by all dashboards.
 * Also generates plain-English insight copy from the metrics.
 *
 * Incremental spend calculation (Scenario 1 / FRIVE):
 *   - "on Yonder" spend = total settled spend during active periods
 *   - "off Yonder" spend = total settled spend during inactive periods
 *   - incremental_spend = on_spend − off_spend (raw delta, not per-user normalised)
 *   - Assumes off-period spend represents organic baseline behaviour
 */

import { getPartnerMonthlyMetrics } from '@/lib/reporting/partner-monthly-metrics'
import { getPartnerTransactionFacts } from '@/lib/reporting/partner-transaction-facts'
import { getPartnerConfig } from '@/lib/config/partner-commercials'
import { PARTNER_CONFIGS } from '@/lib/config/partner-commercials'
import type { PartnerSummaryMetrics } from '@/lib/types'

function formatGbp(amount: number): string {
  return `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

function generateInsights(metrics: Omit<PartnerSummaryMetrics, 'insights' | 'monthly_breakdown'>): string[] {
  const insights: string[] = []

  const newPct = metrics.total_transactions > 0
    ? (metrics.new_transactions / metrics.total_transactions) * 100
    : 0

  const avgSpend = metrics.total_transactions > 0
    ? metrics.total_spend_gbp / metrics.total_transactions
    : 0

  const revenuePerUser = metrics.unique_users > 0
    ? metrics.total_revenue / metrics.unique_users
    : 0

  if (metrics.incremental_spend > 0) {
    insights.push(
      `During active months, spend was ${formatGbp(metrics.incremental_spend)} higher than during off-Yonder periods — demonstrating clear incremental uplift.`
    )
  }

  if (newPct > 30) {
    insights.push(
      `${newPct.toFixed(0)}% of transactions were from new customers, suggesting strong customer acquisition performance.`
    )
  } else if (newPct > 0) {
    insights.push(
      `${(100 - newPct).toFixed(0)}% of transactions came from returning customers, reflecting a loyal, repeat-visiting user base.`
    )
  }

  if (metrics.boost_transactions > 0) {
    const boostPct = (metrics.boost_transactions / metrics.total_transactions) * 100
    insights.push(
      `${boostPct.toFixed(0)}% of transactions occurred during time-boost periods, generating ${formatGbp(metrics.boost_revenue)} in boost-attributed revenue.`
    )
  }

  if (avgSpend > 0) {
    insights.push(`Average transaction value was ${formatGbp(avgSpend)}, with ${metrics.unique_users.toLocaleString()} unique customers transacting in this period.`)
  }

  if (revenuePerUser > 0) {
    insights.push(`Revenue per unique user was ${formatGbp(revenuePerUser)}.`)
  }

  return insights
}

let _cache: Map<string, PartnerSummaryMetrics> = new Map()

export function getPartnerReportSummary(partnerName: string): PartnerSummaryMetrics | null {
  if (_cache.has(partnerName)) return _cache.get(partnerName)!

  const config = getPartnerConfig(partnerName)
  if (!config) return null

  const monthly = getPartnerMonthlyMetrics(partnerName)
  const facts = getPartnerTransactionFacts(partnerName)

  const baseline = new Date(config.baseline_date)
  const inScope = monthly.filter(m => m.year_month >= config.baseline_date.slice(0, 7))

  const onFacts = facts.filter(f => f.is_settled && f.is_on_yonder && f.timestamp >= baseline)
  const offFacts = facts.filter(f => f.is_settled && !f.is_on_yonder && f.timestamp >= baseline)

  const on_spend = onFacts.reduce((s, f) => s + f.trans_amount_gbp, 0)
  const off_spend = offFacts.reduce((s, f) => s + f.trans_amount_gbp, 0)

  const settled = facts.filter(f => f.is_settled && f.timestamp >= baseline)
  const newFacts = settled.filter(f => f.is_new_customer)
  const repeatFacts = settled.filter(f => !f.is_new_customer)
  const boostFacts = settled.filter(f => f.is_boost)

  const lastMonth = inScope.length > 0 ? inScope[inScope.length - 1].year_month : config.baseline_date.slice(0, 7)
  const firstMonth = inScope.length > 0 ? inScope[0].year_month : lastMonth

  const partialMetrics = {
    partner_name: partnerName,
    display_name: config.display_name,
    period_label: firstMonth === lastMonth ? firstMonth : `${firstMonth} – ${lastMonth}`,

    total_transactions: settled.length,
    settled_transactions: settled.length,
    total_spend_gbp: settled.reduce((s, f) => s + f.trans_amount_gbp, 0),
    total_revenue: settled.reduce((s, f) => s + f.revenue_contribution, 0),

    new_transactions: newFacts.length,
    new_spend_gbp: newFacts.reduce((s, f) => s + f.trans_amount_gbp, 0),
    new_revenue: newFacts.reduce((s, f) => s + f.revenue_contribution, 0),
    repeat_transactions: repeatFacts.length,
    repeat_spend_gbp: repeatFacts.reduce((s, f) => s + f.trans_amount_gbp, 0),
    repeat_revenue: repeatFacts.reduce((s, f) => s + f.revenue_contribution, 0),

    boost_transactions: boostFacts.length,
    boost_spend_gbp: boostFacts.reduce((s, f) => s + f.trans_amount_gbp, 0),
    boost_revenue: boostFacts.reduce((s, f) => s + f.revenue_contribution, 0),

    unique_users: new Set(settled.map(f => f.user_id)).size,
    new_users: new Set(newFacts.map(f => f.user_id)).size,

    on_yonder_spend: on_spend,
    off_yonder_spend: off_spend,
    incremental_spend: on_spend - off_spend,
  }

  const summary: PartnerSummaryMetrics = {
    ...partialMetrics,
    monthly_breakdown: monthly,
    insights: generateInsights(partialMetrics),
  }

  _cache.set(partnerName, summary)
  return summary
}

export function getAllPartnerSummaries(): PartnerSummaryMetrics[] {
  return PARTNER_CONFIGS
    .map(c => getPartnerReportSummary(c.partner_name))
    .filter((s): s is PartnerSummaryMetrics => s !== null)
}
