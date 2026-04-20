/**
 * partner-transaction-facts.ts
 *
 * Enriched transaction-level fact table for a given partner.
 * Joins clean transactions with four classification dimensions:
 *
 * 1. ON / OFF YONDER
 *    A transaction is "on Yonder" if its settlement timestamp falls within any
 *    active period for that partner (lib/config/partner-periods.ts).
 *    Active periods are calendar-month windows [start_date, end_date) — half-open,
 *    so a period covering January 2025 runs 2025-01-01 ≤ ts < 2025-02-01.
 *    Revenue is only earned on on-Yonder transactions; off-Yonder transactions
 *    still appear in spend metrics but contribute £0 revenue.
 *
 * 2. NEW vs REPEAT CUSTOMER
 *    A user is classified as "new" on a transaction if ALL of:
 *      a. Their first-ever settled transaction with this partner is on or after
 *         the partner's baseline_date (pre-baseline users are always "repeat").
 *      b. This transaction IS that first transaction (exact timestamp match).
 *    Every subsequent transaction by the same user at the same partner is "repeat",
 *    even within the same month.
 *    Note: "new" is partner-scoped, not Yonder-membership-scoped. A user can be
 *    "new to FRIVE" while being a long-standing Yonder member.
 *
 * 3. BOOST (time_based)
 *    A transaction is boosted if experience_visited contains a row for that
 *    transaction_id where:
 *      - match_status = 'match'   (experience was successfully matched)
 *      - status = 'redeemable'    (experience was eligible for redemption)
 *      - boost_type = 'time_based' (a scheduled promotional window was active)
 *    All three conditions must hold. Boost applies on top of the standard
 *    commercial rate — it affects engagement metrics but does NOT change the
 *    revenue calculation (revenue follows the CPA/% model regardless of boost).
 *
 * 4. REVENUE CONTRIBUTION
 *    Only computed for on-Yonder transactions (off-Yonder → £0).
 *    FRIVE (CPA model):   new tx → £20.00,  repeat tx → £12.50
 *    Gopuff (% model):    new tx → 8% × spend,  repeat tx → 1% × spend
 *    The applicable commercial model is resolved by effective_from date, so
 *    rate changes mid-contract are handled automatically.
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
  // Filter rules (must satisfy ALL):
  //   1. match_status === 'match'      — experience was matched to this transaction
  //   2. status === 'redeemable'       — experience is eligible for redemption (not_redeemable excluded)
  // Both checks are required to stay consistent with the SQL layer
  // (06_partner_transaction_facts.sql WHERE match_status IN ('match'))
  const boostByTxId = new Map<string, { boost_type: string; enhanced_redemption_rate: boolean }>()
  // Also track ALL matched experience rows (including denied) for engagement/denial metrics
  const expMatchedTxIds = new Set<string>()   // any experience record exists for this tx
  const expDeniedTxIds = new Set<string>()    // experience was denied (required_link=True / match_denied)
  for (const exp of experiences) {
    if (!exp.transaction_id || exp.clean_description !== partnerName) continue
    expMatchedTxIds.add(exp.transaction_id)
    if (exp.match_status === 'match_denied' || exp.status === 'not_redeemable') {
      expDeniedTxIds.add(exp.transaction_id)
    }
    if (
      exp.match_status === 'match' &&
      exp.status === 'redeemable'
    ) {
      boostByTxId.set(exp.transaction_id, {
        boost_type: exp.boost_type ?? '',
        enhanced_redemption_rate: exp.enhanced_redemption_rate === 'true' || exp.enhanced_redemption_rate === 'True' || exp.enhanced_redemption_rate === 'TRUE' || exp.enhanced_redemption_rate === '1',
      })
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
      enhanced_redemption_rate: boostEntry?.enhanced_redemption_rate ?? false,
      is_experience_matched: expMatchedTxIds.has(tx.transaction_id),
      is_denied_experience: expDeniedTxIds.has(tx.transaction_id),
      commercial_model: model?.type ?? 'cpa_new_repeat',
      revenue_contribution: revenue,
      points_earned: tx.points_earned,
    } satisfies PartnerTransactionFact
  })

  return facts
})
