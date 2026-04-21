/**
 * lib/reporting/insights.ts
 *
 * Generates plain-English analyst notes from a PartnerSummaryMetrics object.
 * Separated from aggregation logic (partner-report-summary.ts) so each module
 * has a single responsibility.
 *
 * Copy is written in third-person analyst tone — suitable for both the internal
 * Yonder dashboard and partner-facing reports.
 */

import { fmtGbpFull } from '@/lib/utils/format'
import type { PartnerSummaryMetrics } from '@/lib/types'

type MetricsInput = Omit<PartnerSummaryMetrics, 'insights' | 'monthly_breakdown'>

export function generateInsights(metrics: MetricsInput): string[] {
  const fmt = fmtGbpFull
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

  // 1. Rewards uplift — most commercially important, shown first
  if (metrics.on_months_count > 0 && metrics.off_months_count > 0) {
    const upliftPct = metrics.avg_monthly_off_spend > 0
      ? ((metrics.avg_monthly_on_spend - metrics.avg_monthly_off_spend) / metrics.avg_monthly_off_spend) * 100
      : 0
    const sign = metrics.incremental_spend >= 0 ? '+' : ''
    if (upliftPct > 0) {
      insights.push(
        `During active Yonder reward periods, ${metrics.display_name} averaged ${fmt(metrics.avg_monthly_on_spend)} in monthly cardholder spend — a ${sign}${fmt(metrics.incremental_spend)} uplift (${Math.round(upliftPct)}% higher) compared to the ${metrics.off_months_count} inactive month${metrics.off_months_count !== 1 ? 's' : ''}.`
      )
    } else {
      insights.push(
        `Monthly cardholder spend averaged ${fmt(metrics.avg_monthly_on_spend)} during active Yonder periods and ${fmt(metrics.avg_monthly_off_spend)} during inactive periods across ${metrics.on_months_count + metrics.off_months_count} months.`
      )
    }
  } else if (metrics.on_yonder_spend > 0 && metrics.off_months_count === 0) {
    insights.push(
      `${fmt(metrics.on_yonder_spend)} in total cardholder spend was recorded at ${metrics.display_name} across ${metrics.on_months_count} active Yonder month${metrics.on_months_count !== 1 ? 's' : ''}. A baseline comparison period will be available once inactive months are observed.`
    )
  }

  // 2. Customer acquisition vs loyalty
  if (newPct > 0 && metrics.total_transactions > 0) {
    const repeatPct = 100 - newPct
    if (repeatPct > 50) {
      insights.push(
        `${repeatPct.toFixed(0)}% of visits to ${metrics.display_name} came from returning Yonder cardholders — ${metrics.repeat_transactions.toLocaleString()} repeat transactions, indicating the partnership is driving genuine loyalty rather than one-off footfall.`
      )
    } else {
      insights.push(
        `Yonder introduced ${metrics.new_users.toLocaleString()} first-time customers to ${metrics.display_name}, accounting for ${newPct.toFixed(0)}% of all transactions and ${fmt(metrics.new_spend_gbp)} in new-customer spend.`
      )
    }
  }

  // 3. Boost periods
  if (metrics.boost_transactions > 0) {
    const boostPct = (metrics.boost_transactions / metrics.total_transactions) * 100
    insights.push(
      `Time-limited reward boosts at ${metrics.display_name} drove ${metrics.boost_transactions.toLocaleString()} transactions (${boostPct.toFixed(0)}% of total visits), generating ${fmt(metrics.boost_spend_gbp)} in spend — evidence that promotional windows create measurable activity spikes.`
    )
  }

  // 4. Reward engagement
  if (metrics.experience_engagement_rate > 0) {
    const pct = (metrics.experience_engagement_rate * 100).toFixed(0)
    const denialNote = metrics.denied_experience_transactions > 0
      ? ` ${metrics.denied_experience_transactions} visit${metrics.denied_experience_transactions > 1 ? 's were' : ' was'} declined due to an unlinked card — improving in-app card linking would increase full programme participation.`
      : ''
    insights.push(
      `${pct}% of visits (${metrics.experience_matched_transactions.toLocaleString()}) successfully triggered a Yonder reward experience at ${metrics.display_name}, indicating strong programme participation.${denialNote}`
    )
  }

  // 5. Points / loyalty currency
  if (metrics.total_points_earned > 0) {
    const avgPts = metrics.total_transactions > 0
      ? Math.round(metrics.total_points_earned / metrics.total_transactions)
      : 0
    insights.push(
      `Yonder cardholders earned ${metrics.total_points_earned.toLocaleString()} points at ${metrics.display_name} — an average of ${avgPts.toLocaleString()} points per transaction, reinforcing ${metrics.display_name} as an active earner in the Yonder network.`
    )
  }

  // 6. Average basket size
  if (avgSpend > 0) {
    insights.push(
      `Average transaction value at ${metrics.display_name} was ${fmt(avgSpend)} across ${metrics.unique_users.toLocaleString()} unique cardholders.${revenuePerUser > 0 ? ` The partnership generated ${fmt(revenuePerUser)} of commission per cardholder acquired through Yonder.` : ''}`
    )
  }

  return insights
}
