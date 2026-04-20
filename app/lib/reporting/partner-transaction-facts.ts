/**
 * partner-transaction-facts.ts
 *
 * Enriched transaction-level fact table for a given partner.
 * Joins clean transactions with:
 * - on/off Yonder status (from active periods config)
 * - new vs repeat classification (from first-seen logic)
 * - boost/time-based event flag (from experience_visited CSV)
 * - revenue contribution (from commercial model config)
 */

import { cache } from 'react'
import { getPartnerTransactions } from '@/lib/reporting/clean-transactions'
import { isOnYonder } from '@/lib/config/partner-periods'
import { getPartnerUserFirstSeen } from '@/lib/reporting/partner-user-first-seen'
import { computeRevenue, getCommercialModel, getPartnerConfig } from '@/lib/config/partner-commercials'
import { loadRawExperiences } from '@/lib/data/csv-loader'
import type { PartnerTransactionFact } from '@/lib/types'

export const getPartnerTransactionFacts = cache(
  function _getPartnerTransactionFacts(partnerName: string): PartnerTransactionFact[] {

  const transactions = getPartnerTransactions(partnerName)
  const experiences = loadRawExperiences()
  const config = getPartnerConfig(partnerName)
  const baseline = config ? new Date(config.baseline_date) : new Date('2000-01-01')

  // Build boost lookup: transaction_id → experience row (for this partner)
  // Only include records where match_status === 'match'; match_denied rows must be excluded
  // to stay consistent with the SQL layer (06_partner_transaction_facts.sql line: WHERE match_status IN ('match'))
  const boostByTxId = new Map<string, { boost_type: string }>()
  for (const exp of experiences) {
    if (exp.transaction_id && exp.clean_description === partnerName && exp.match_status === 'match') {
      boostByTxId.set(exp.transaction_id, { boost_type: exp.boost_type ?? '' })
    }
  }

  // Build first-seen index: userId → first transaction date
  const firstSeenList = getPartnerUserFirstSeen(partnerName)
  const firstSeenByUser = new Map(firstSeenList.map(e => [e.user_id, e]))

  const facts: PartnerTransactionFact[] = transactions.map(tx => {
    const firstSeen = firstSeenByUser.get(tx.user_id)

    // A user is "new" if:
    // 1. Their first transaction with this partner is on or after the baseline date
    // 2. AND this is that first transaction
    const isNew = (() => {
      if (!firstSeen) return true
      if (firstSeen.first_transaction_date < baseline) return false
      return firstSeen.first_transaction_date.getTime() === tx.timestamp.getTime()
    })()

    const boostEntry = boostByTxId.get(tx.transaction_id)
    const isBoost = !!boostEntry && boostEntry.boost_type === 'time_based'

    const onYonder = isOnYonder(partnerName, tx.timestamp)
    const revenue = onYonder
      ? computeRevenue(partnerName, tx.timestamp, tx.trans_amount_gbp, isNew)
      : 0

    const model = getCommercialModel(partnerName, tx.timestamp)

    return {
      transaction_id: tx.transaction_id,
      partner_name: partnerName,
      user_id: tx.user_id,
      timestamp: tx.timestamp,
      year_month: tx.year_month,
      trans_amount_gbp: tx.trans_amount_gbp,
      is_settled: tx.is_settled,
      is_new_customer: isNew,
      is_on_yonder: onYonder,
      is_boost: isBoost,
      boost_type: boostEntry?.boost_type ?? null,
      commercial_model: model?.type ?? 'cpa_new_repeat',
      revenue_contribution: revenue,
    } satisfies PartnerTransactionFact
  })

  return facts
})
