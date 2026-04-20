/**
 * partner-report-summary.ts
 *
 * Produces the final rolled-up PartnerSummaryMetrics used by all dashboards.
 * Also generates plain-English insight copy from the metrics.
 *
 * INCREMENTAL SPEND CALCULATION:
 *   incremental_spend is the per-month average uplift attributable to the
 *   Yonder partnership, computed as:
 *
 *     avg_monthly_on_spend  = total on-Yonder spend  ÷ number of on-Yonder months
 *     avg_monthly_off_spend = total off-Yonder spend ÷ number of off-Yonder months
 *     incremental_spend     = avg_monthly_on_spend − avg_monthly_off_spend
 *
 *   This normalises for the fact that active and inactive periods may have
 *   different month counts. A positive number means Yonder members spend more
 *   per month when the partner is featured on the platform.
 *
 *   Fallback: if only one side has data (e.g. a new partner with no inactive
 *   months yet), incremental_spend = total on_spend − total off_spend (raw
 *   totals). This is surfaced as "all spend occurred during active periods"
 *   rather than as a per-month uplift figure in the UI.
 *
 *   Both on/off sides filter to post-baseline transactions only, so pre-deal
 *   history never contaminates the comparison.
 */

import { cache } from 'react'
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

  // 1. Rewards uplift — most commercially important insight, shown first
  if (metrics.on_months_count > 0 && metrics.off_months_count > 0) {
    const upliftPct = metrics.avg_monthly_off_spend > 0
      ? ((metrics.avg_monthly_on_spend - metrics.avg_monthly_off_spend) / metrics.avg_monthly_off_spend) * 100
      : 0
    const sign = metrics.incremental_spend >= 0 ? '+' : ''
    if (upliftPct > 0) {
      insights.push(
        `When your Yonder rewards were live, customers spent ${formatGbp(metrics.avg_monthly_on_spend)} per month on average — a ${sign}${formatGbp(metrics.incremental_spend)} uplift (${Math.round(upliftPct)}% more) compared to the ${metrics.off_months_count} months when rewards were inactive.`
      )
    } else {
      insights.push(
        `Monthly spend averaged ${formatGbp(metrics.avg_monthly_on_spend)} during active reward periods and ${formatGbp(metrics.avg_monthly_off_spend)} during inactive periods across ${metrics.on_months_count + metrics.off_months_count} months.`
      )
    }
  } else if (metrics.on_yonder_spend > 0 && metrics.off_months_count === 0) {
    insights.push(
      `${formatGbp(metrics.on_yonder_spend)} in total customer spend was recorded during ${metrics.on_months_count} active Yonder month${metrics.on_months_count !== 1 ? 's' : ''}. A comparison period will be available once inactive months are observed.`
    )
  }

  // 2. Customer acquisition vs loyalty
  if (newPct > 0 && metrics.total_transactions > 0) {
    const repeatPct = 100 - newPct
    if (repeatPct > 50) {
      insights.push(
        `${repeatPct.toFixed(0)}% of visits came from returning customers — ${metrics.repeat_transactions.toLocaleString()} transactions from people who chose to come back. Yonder is building genuine loyalty, not just first-time footfall.`
      )
    } else {
      insights.push(
        `Yonder introduced ${metrics.new_users.toLocaleString()} first-time customers to ${metrics.display_name}, representing ${newPct.toFixed(0)}% of all transactions and ${formatGbp(metrics.new_spend_gbp)} in new-customer spend.`
      )
    }
  }

  // 3. Boost periods
  if (metrics.boost_transactions > 0) {
    const boostPct = (metrics.boost_transactions / metrics.total_transactions) * 100
    insights.push(
      `Time-limited reward boosts drove ${metrics.boost_transactions.toLocaleString()} transactions (${boostPct.toFixed(0)}% of total visits), generating ${formatGbp(metrics.boost_spend_gbp)} in spend — demonstrating that featured promotional windows create measurable spikes in customer activity.`
    )
  }

  // 4. Reward engagement
  if (metrics.experience_engagement_rate > 0) {
    const pct = (metrics.experience_engagement_rate * 100).toFixed(0)
    const denialNote = metrics.denied_experience_transactions > 0
      ? ` ${metrics.denied_experience_transactions} visit${metrics.denied_experience_transactions > 1 ? 's were' : ' was'} declined because the card wasn't linked to the Yonder app — a reminder that in-app linking drives full programme participation.`
      : ''
    insights.push(
      `${pct}% of visits (${metrics.experience_matched_transactions.toLocaleString()}) successfully triggered a Yonder reward experience — confirming strong programme participation among your customers.${denialNote}`
    )
  }

  // 5. Points / loyalty currency
  if (metrics.total_points_earned > 0) {
    const avgPts = metrics.total_transactions > 0 ? Math.round(metrics.total_points_earned / metrics.total_transactions) : 0
    insights.push(
      `Yonder members earned ${metrics.total_points_earned.toLocaleString()} points visiting ${metrics.display_name} — an average of ${avgPts.toLocaleString()} points per transaction. Points are a key driver of repeat visits across the Yonder network.`
    )
  }

  // 6. Average basket size
  if (avgSpend > 0) {
    insights.push(
      `Yonder members spent an average of ${formatGbp(avgSpend)} per visit across ${metrics.unique_users.toLocaleString()} unique customers. ${revenuePerUser > 0 ? `The partnership generated ${formatGbp(revenuePerUser)} of value per customer acquired through Yonder.` : ''}`
    )
  }

  return insights
}

export const getPartnerReportSummary = cache(
  function _getPartnerReportSummary(partnerName: string): PartnerSummaryMetrics | null {
  const config = getPartnerConfig(partnerName)
  if (!config) return null

  const monthly = getPartnerMonthlyMetrics(partnerName)
  const facts = getPartnerTransactionFacts(partnerName)

  const baseline = new Date(config.baseline_date)
  const baselineYm = config.baseline_date.slice(0, 7)
  const inScope = monthly.filter(m => m.year_month >= baselineYm)

  const onFacts = facts.filter(f => f.is_settled && f.is_on_yonder && f.timestamp >= baseline)
  const offFacts = facts.filter(f => f.is_settled && !f.is_on_yonder && f.timestamp >= baseline)

  const on_spend = onFacts.reduce((s, f) => s + f.trans_amount_gbp, 0)
  const off_spend = offFacts.reduce((s, f) => s + f.trans_amount_gbp, 0)

  // Count distinct on/off months (post-baseline only)
  const on_months_count = inScope.filter(m => m.is_on_yonder).length
  const off_months_count = inScope.filter(m => !m.is_on_yonder).length
  const avg_monthly_on_spend = on_months_count > 0 ? on_spend / on_months_count : 0
  const avg_monthly_off_spend = off_months_count > 0 ? off_spend / off_months_count : 0

  const settled = facts.filter(f => f.is_settled && f.timestamp >= baseline)
  const newFacts = settled.filter(f => f.is_new_customer)
  const repeatFacts = settled.filter(f => !f.is_new_customer)
  const boostFacts = settled.filter(f => f.is_boost)
  const enhancedRateFacts = settled.filter(f => f.enhanced_redemption_rate)
  const experienceMatchedFacts = settled.filter(f => f.is_experience_matched)
  const deniedFacts = settled.filter(f => f.is_denied_experience)

  const lastMonth = inScope.length > 0 ? inScope[inScope.length - 1].year_month : baselineYm
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

    enhanced_rate_transactions: enhancedRateFacts.length,
    enhanced_rate_spend_gbp: enhancedRateFacts.reduce((s, f) => s + f.trans_amount_gbp, 0),

    experience_matched_transactions: experienceMatchedFacts.length,
    denied_experience_transactions: deniedFacts.length,
    experience_engagement_rate: settled.length > 0 ? experienceMatchedFacts.length / settled.length : 0,
    total_points_earned: settled.reduce((s, f) => s + f.points_earned, 0),

    unique_users: new Set(settled.map(f => f.user_id)).size,
    new_users: new Set(newFacts.map(f => f.user_id)).size,

    on_yonder_spend: on_spend,
    off_yonder_spend: off_spend,
    on_months_count,
    off_months_count,
    avg_monthly_on_spend,
    avg_monthly_off_spend,
    // Per-month normalised delta: only meaningful when both sides have data
    incremental_spend: (on_months_count > 0 && off_months_count > 0)
      ? avg_monthly_on_spend - avg_monthly_off_spend
      : on_spend - off_spend,
  }

  const summary: PartnerSummaryMetrics = {
    ...partialMetrics,
    // Only include post-baseline months in the breakdown
    monthly_breakdown: inScope,
    insights: generateInsights(partialMetrics),
  }

  return summary
})

export function getAllPartnerSummaries(): PartnerSummaryMetrics[] {
  return PARTNER_CONFIGS
    .map(c => getPartnerReportSummary(c.partner_name))
    .filter((s): s is PartnerSummaryMetrics => s !== null)
}
