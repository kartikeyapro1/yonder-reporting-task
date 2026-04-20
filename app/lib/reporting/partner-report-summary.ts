/**
 * partner-report-summary.ts
 *
 * Produces the final rolled-up PartnerSummaryMetrics used by all dashboards.
 * Also generates plain-English insight copy from the metrics.
 *
 * Incremental spend calculation (Scenario 1 / FRIVE):
 *   - "on Yonder" spend = total settled spend during active periods
 *   - "off Yonder" spend = total settled spend during inactive periods
 *   - Normalised to per-month averages before computing the delta
 *   - incremental_spend = avg_monthly_on − avg_monthly_off
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

  // Per-month on/off comparison (only when both sides have data)
  if (metrics.on_months_count > 0 && metrics.off_months_count > 0) {
    const sign = metrics.incremental_spend >= 0 ? '+' : ''
    insights.push(
      `Avg. monthly spend when rewards were active: ${formatGbp(metrics.avg_monthly_on_spend)} (${metrics.on_months_count} months). When inactive: ${formatGbp(metrics.avg_monthly_off_spend)} (${metrics.off_months_count} months). Per-month uplift: ${sign}${formatGbp(metrics.incremental_spend)}.`
    )
  } else if (metrics.on_yonder_spend > 0 && metrics.off_months_count === 0) {
    insights.push(
      `All recorded spend (${formatGbp(metrics.on_yonder_spend)}) occurred during active Yonder months — no inactive comparison period available yet.`
    )
  }

  if (newPct > 0 && metrics.total_transactions > 0) {
    insights.push(
      `${newPct.toFixed(0)}% of transactions (${metrics.new_transactions.toLocaleString()}) were first-time visits; ${(100 - newPct).toFixed(0)}% (${metrics.repeat_transactions.toLocaleString()}) from returning customers.`
    )
  }

  if (metrics.boost_transactions > 0) {
    const boostPct = (metrics.boost_transactions / metrics.total_transactions) * 100
    insights.push(
      `${metrics.boost_transactions.toLocaleString()} transactions (${boostPct.toFixed(0)}%) occurred during time-boost promotional windows, generating ${formatGbp(metrics.boost_spend_gbp)} in spend.`
    )
  }

  if (metrics.total_points_earned > 0) {
    const avgPts = metrics.total_transactions > 0 ? Math.round(metrics.total_points_earned / metrics.total_transactions) : 0
    insights.push(
      `Yonder members earned ${metrics.total_points_earned.toLocaleString()} points across all visits (avg. ${avgPts.toLocaleString()} pts per transaction).`
    )
  }

  if (metrics.experience_engagement_rate > 0) {
    const pct = (metrics.experience_engagement_rate * 100).toFixed(0)
    insights.push(
      `${pct}% of visits (${metrics.experience_matched_transactions.toLocaleString()}) triggered a Yonder reward experience.${metrics.denied_experience_transactions > 0 ? ` ${metrics.denied_experience_transactions} visit${metrics.denied_experience_transactions > 1 ? 's were' : ' was'} denied due to the card not being linked to the Yonder app.` : ''}`
    )
  }

  if (avgSpend > 0) {
    insights.push(`Average transaction value: ${formatGbp(avgSpend)} across ${metrics.unique_users.toLocaleString()} unique customers (${metrics.total_transactions.toLocaleString()} total transactions).`)
  }

  if (revenuePerUser > 0) {
    insights.push(`Revenue per customer: ${formatGbp(revenuePerUser)}.`)
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
