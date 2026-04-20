/**
 * partner-monthly-metrics.ts
 *
 * Aggregates transaction facts into monthly buckets per partner.
 * Output is used by trend charts and the monthly breakdown table.
 */

import { cache } from 'react'
import { getPartnerTransactionFacts } from '@/lib/reporting/partner-transaction-facts'
import type { PartnerMonthlyMetrics, PartnerTransactionFact } from '@/lib/types'

export const getPartnerMonthlyMetrics = cache(
  function _getPartnerMonthlyMetrics(partnerName: string): PartnerMonthlyMetrics[] {
  const facts = getPartnerTransactionFacts(partnerName)

  const byMonth = new Map<string, PartnerTransactionFact[]>()
  for (const f of facts) {
    const bucket = byMonth.get(f.year_month) ?? []
    bucket.push(f)
    byMonth.set(f.year_month, bucket)
  }

  const result: PartnerMonthlyMetrics[] = []

  for (const [year_month, monthFacts] of byMonth.entries()) {
    const settled = monthFacts.filter(f => f.is_settled)
    const onYonder = settled.some(f => f.is_on_yonder)

    const newFacts = settled.filter(f => f.is_new_customer)
    const repeatFacts = settled.filter(f => !f.is_new_customer)
    const boostFacts = settled.filter(f => f.is_boost)

    const uniqueUsers = new Set(settled.map(f => f.user_id)).size
    const newUsers = new Set(newFacts.map(f => f.user_id)).size

    result.push({
      partner_name: partnerName,
      year_month,
      is_on_yonder: onYonder,

      total_transactions: monthFacts.length,
      settled_transactions: settled.length,
      total_spend_gbp: settled.reduce((s, f) => s + f.trans_amount_gbp, 0),

      new_transactions: newFacts.length,
      new_spend_gbp: newFacts.reduce((s, f) => s + f.trans_amount_gbp, 0),
      repeat_transactions: repeatFacts.length,
      repeat_spend_gbp: repeatFacts.reduce((s, f) => s + f.trans_amount_gbp, 0),

      boost_transactions: boostFacts.length,
      boost_spend_gbp: boostFacts.reduce((s, f) => s + f.trans_amount_gbp, 0),
      boost_revenue: boostFacts.reduce((s, f) => s + f.revenue_contribution, 0),

      total_revenue: settled.reduce((s, f) => s + f.revenue_contribution, 0),
      new_revenue: newFacts.reduce((s, f) => s + f.revenue_contribution, 0),
      repeat_revenue: repeatFacts.reduce((s, f) => s + f.revenue_contribution, 0),

      unique_users: uniqueUsers,
      new_users: newUsers,
    })
  }

  const sorted = result.sort((a, b) => a.year_month.localeCompare(b.year_month))
  return sorted
  }
)


