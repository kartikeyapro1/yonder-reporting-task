/**
 * clean-transactions.ts
 *
 * Produces the clean_transactions reporting layer from raw CSV data.
 *
 * Steps:
 * 1. Discard non-settled transactions (state !== 'settled')
 * 2. Normalise merchant description to canonical partner name
 * 3. Convert FX amounts to GBP (trans_amount * fx_rate if currency != GBP)
 * 4. Parse timestamps to Date objects
 *
 * Assumption: trans_amount is always in trans_currency.
 * When trans_currency != GBP, the fx_rate column contains the GBP conversion
 * factor so GBP amount = trans_amount / fx_rate (rate is expressed as
 * foreign_currency_per_gbp). If fx_rate is absent or zero, we use
 * charged_amount as fallback (which is always in charged_currency and in
 * practice = GBP for domestic cards).
 */

import { cache } from 'react'
import { normaliseMerchantDescription } from '@/lib/config/partner-mappings'
import { loadRawTransactions } from '@/lib/data/csv-loader'
import type { CleanTransaction } from '@/lib/types'

function toGbp(transAmount: number, transCurrency: string, fxRate: number, chargedAmount: number): number {
  if (transCurrency === 'GBP') return transAmount
  if (fxRate > 0) return transAmount / fxRate
  return chargedAmount // fallback
}

/**
 * getCleanTransactions — wrapped with React.cache() for two reasons:
 * 1. Deduplicates calls within a single server request (multiple components
 *    can call this without re-parsing the CSV).
 * 2. Cache is request-scoped, not process-scoped — prevents memory leaks
 *    and stale data on long-running servers or serverless environments.
 */
export const getCleanTransactions = cache(function _getCleanTransactions(): CleanTransaction[] {
  const raw = loadRawTransactions()

  return raw
    .filter(r => r.state === 'settled')
    .map(r => {
      const rawDesc = (r.raw_merchant_description || r.merchant_description || '').trim()
      const partner = normaliseMerchantDescription(rawDesc)

      const transAmount = parseFloat(r.trans_amount) || 0
      const chargedAmount = parseFloat(r.charged_amount) || 0
      const fxRate = parseFloat(r.fx_rate) || 0
      const trans_amount_gbp = toGbp(transAmount, r.trans_currency, fxRate, chargedAmount)

      const timestamp = new Date(r.timestamp)
      const year_month = `${timestamp.getFullYear()}-${String(timestamp.getMonth() + 1).padStart(2, '0')}`

      return {
        transaction_id: r.transaction_id,
        user_id: r.user_id,
        merchant_id: r.merchant_id,
        partner_name: partner ?? '_unknown',
        raw_description: rawDesc,
        timestamp,
        year_month,
        trans_amount_gbp,
        state: r.state,
        type: r.type,
        is_settled: r.state === 'settled',
      } satisfies CleanTransaction
    })
    .filter(t => t.partner_name !== '_unknown') // only keep recognised partner transactions
})

/** Filter to a specific partner's clean transactions. */
export const getPartnerTransactions = cache(
  function _getPartnerTransactions(partnerName: string): CleanTransaction[] {
    return getCleanTransactions().filter(t => t.partner_name === partnerName)
  }
)
