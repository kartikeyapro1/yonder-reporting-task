/**
 * partner-user-first-seen.ts
 *
 * Determines the first time each user transacted with each partner.
 * Used to classify new vs repeat customers.
 *
 * Assumption: "new" is determined per partner, not globally.
 * A user is "new to FRIVE" on their first settled transaction with FRIVE,
 * regardless of when they joined Yonder or visited other partners.
 *
 * Baseline date matters: for revenue calculation, we only call someone
 * "new" if their first observed transaction is on or after the partner's
 * baseline_date. If a user has pre-baseline history we treat them as
 * existing customers from day one of the reporting period.
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
