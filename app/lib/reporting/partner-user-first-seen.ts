/**
 * partner-user-first-seen.ts
 *
 * Determines the first time each user transacted with each partner.
 * This is the foundation for new-vs-repeat customer classification.
 *
 * RULES:
 *   1. First-seen is per-partner, not global. A user can be "new to FRIVE"
 *      and simultaneously "repeat at Gopuff".
 *   2. Only settled transactions are considered (clean_transactions already
 *      filters to state = 'settled').
 *   3. Baseline gate: if a user's earliest transaction with a partner
 *      pre-dates the partner's baseline_date, they are treated as an
 *      existing customer for the entire reporting window — even if we only
 *      observe them once. This prevents pre-existing loyalty from inflating
 *      new-customer counts.
 *   4. "New" applies only to the single transaction that IS the first seen.
 *      Every subsequent transaction — even on the same day — is "repeat".
 *
 * IMPLEMENTATION NOTE:
 *   The map is built once per request from all clean transactions (across all
 *   partners) so that calling getPartnerUserFirstSeen() for multiple partners
 *   within the same server render does not re-scan the transaction list.
 */

import { cache } from 'react'
import { getCleanTransactions } from '@/lib/reporting/clean-transactions'
import { getPartnerConfig } from '@/lib/config/partner-commercials'
import type { PartnerUserFirstSeen } from '@/lib/types'

/**
 * buildFirstSeenMap wrapped with cache() so the full scan runs once
 * per request regardless of how many partners are requested.
 */
const buildFirstSeenMap = cache(function _buildFirstSeenMap(): Map<string, PartnerUserFirstSeen[]> {
  const map = new Map<string, PartnerUserFirstSeen[]>()
  const transactions = getCleanTransactions()

  // Group earliest transaction per (partner, user) pair
  const earliest = new Map<string, { date: Date; yearMonth: string }>()

  for (const tx of transactions) {
    const key = `${tx.partner_name}::${tx.user_id}`
    const existing = earliest.get(key)
    if (!existing || tx.timestamp < existing.date) {
      earliest.set(key, { date: tx.timestamp, yearMonth: tx.year_month })
    }
  }

  for (const [key, { date, yearMonth }] of earliest.entries()) {
    const [partner_name, user_id] = key.split('::')
    const list = map.get(partner_name) ?? []
    list.push({
      partner_name,
      user_id,
      first_transaction_date: date,
      first_year_month: yearMonth,
    })
    map.set(partner_name, list)
  }

  return map
})

export function getPartnerUserFirstSeen(partnerName: string): PartnerUserFirstSeen[] {
  return buildFirstSeenMap().get(partnerName) ?? []
}

/**
 * Returns true if the given user's first transaction with this partner
 * is at or after the partner's baseline_date (i.e. they are genuinely new
 * within the reporting window, not a pre-existing customer).
 */
export function isNewCustomer(partnerName: string, userId: string, txDate: Date): boolean {
  const config = getPartnerConfig(partnerName)
  if (!config) return false

  const baseline = new Date(config.baseline_date)
  const map = buildFirstSeenMap()
  const entries = map.get(partnerName) ?? []
  const entry = entries.find(e => e.user_id === userId)

  if (!entry) return true // never seen before = new

  // If their first transaction pre-dates the baseline, treat as existing
  if (entry.first_transaction_date < baseline) return false

  // They're new if this transaction IS their first transaction
  return entry.first_transaction_date.getTime() === txDate.getTime()
    && entry.first_year_month === `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`
}
