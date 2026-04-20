/**
 * partner-periods.ts
 *
 * Structured config of when each partner was active on the Yonder platform.
 * This replaces hardcoded date logic in UI components.
 *
 * Assumption: a partner is "on Yonder" for the full calendar month whenever
 * a month is listed as active. Periods are inclusive of start_date and
 * (if set) exclusive of end_date at the day level.
 *
 * FRIVE active months in 2025: Jan, Mar, May, Jul, Oct, Dec
 * Gopuff: active continuously from Dec 2025 (their baseline)
 */

import type { PartnerActivePeriod } from '@/lib/types'

export const PARTNER_ACTIVE_PERIODS: PartnerActivePeriod[] = [
  // FRIVE — individual monthly periods in 2025
  { partner_name: 'FRIVE', start_date: '2025-01-01', end_date: '2025-02-01', label: 'Jan 2025' },
  { partner_name: 'FRIVE', start_date: '2025-03-01', end_date: '2025-04-01', label: 'Mar 2025' },
  { partner_name: 'FRIVE', start_date: '2025-05-01', end_date: '2025-06-01', label: 'May 2025' },
  { partner_name: 'FRIVE', start_date: '2025-07-01', end_date: '2025-08-01', label: 'Jul 2025' },
  { partner_name: 'FRIVE', start_date: '2025-10-01', end_date: '2025-11-01', label: 'Oct 2025' },
  { partner_name: 'FRIVE', start_date: '2025-12-01', end_date: '2026-01-01', label: 'Dec 2025' },

  // Gopuff — active from Dec 2025 onwards (no end date = currently active)
  { partner_name: 'Gopuff', start_date: '2025-12-01', end_date: null, label: 'Dec 2025 onwards' },
]

/**
 * Return true if a given Date falls within any active period for the partner.
 */
export function isOnYonder(partnerName: string, date: Date): boolean {
  const periods = PARTNER_ACTIVE_PERIODS.filter(p => p.partner_name === partnerName)
  for (const period of periods) {
    const start = new Date(period.start_date)
    const end = period.end_date ? new Date(period.end_date) : null
    if (date >= start && (end === null || date < end)) return true
  }
  return false
}

/**
 * Returns the active periods for a given partner.
 */
export function getActivePeriodsForPartner(partnerName: string): PartnerActivePeriod[] {
  return PARTNER_ACTIVE_PERIODS.filter(p => p.partner_name === partnerName)
}
