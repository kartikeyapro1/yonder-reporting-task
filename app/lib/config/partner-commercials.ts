/**
 * partner-commercials.ts
 *
 * Structured commercial model config per partner.
 * Revenue logic reads from here — no per-component hardcoding.
 *
 * FRIVE:  £20 CPA new, £12.50 CPA repeat
 * Gopuff: 8% of spend for new, 1% of spend for repeat
 *
 * Assumption: "new" = first transaction with this partner on Yonder within
 * the reporting window (after baseline date). All subsequent transactions
 * by the same user at this partner are "repeat".
 */

import type { PartnerConfig, CommercialModel } from '@/lib/types'

export const PARTNER_CONFIGS: PartnerConfig[] = [
  {
    partner_name: 'FRIVE',
    display_name: 'Frive',
    category: 'Food & Drink',
    baseline_date: '2025-01-01',
    partner_token: 'f8a2d1e94c37',
    active_periods: [], // populated from partner-periods.ts at runtime
    commercials: [
      {
        type: 'cpa_new_repeat',
        cpa_new: 20.00,
        cpa_repeat: 12.50,
        currency: 'GBP',
        effective_from: '2025-01-01',
      },
    ],
  },
  {
    partner_name: 'Gopuff',
    display_name: 'Gopuff',
    category: 'Delivery',
    baseline_date: '2025-12-01',
    partner_token: '4b7c3f2a8e51',
    active_periods: [],
    commercials: [
      {
        type: 'pct_spend_new_repeat',
        pct_new: 0.08,
        pct_repeat: 0.01,
        currency: 'GBP',
        effective_from: '2025-12-01',
      },
    ],
  },
]

/**
 * Retrieve config for a partner by canonical name.
 */
export function getPartnerConfig(partnerName: string): PartnerConfig | undefined {
  return PARTNER_CONFIGS.find(c => c.partner_name === partnerName)
}

/**
 * Retrieve config by the opaque partner token (for partner-facing routes).
 */
export function getPartnerByToken(token: string): PartnerConfig | undefined {
  return PARTNER_CONFIGS.find(c => c.partner_token === token)
}

/**
 * Retrieve config by URL slug (for internal routes).
 */
export function getPartnerBySlug(slug: string): PartnerConfig | undefined {
  return PARTNER_CONFIGS.find(
    c => c.partner_name.toLowerCase().replace(/\s+/g, '-') === slug
  )
}

/**
 * Get the active commercial model for a partner at a given date.
 * Uses the most recent effective_from that is <= the given date.
 */
export function getCommercialModel(partnerName: string, atDate: Date): CommercialModel | undefined {
  const config = getPartnerConfig(partnerName)
  if (!config) return undefined

  const applicable = config.commercials
    .filter(c => new Date(c.effective_from) <= atDate)
    .filter(c => !c.effective_to || new Date(c.effective_to) >= atDate)
    .sort((a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime())

  return applicable[0]
}

/**
 * Compute revenue for a single settled transaction.
 * Returns 0 for non-settled transactions.
 */
export function computeRevenue(
  partnerName: string,
  transDate: Date,
  amountGbp: number,
  isNew: boolean,
): number {
  const model = getCommercialModel(partnerName, transDate)
  if (!model) return 0

  switch (model.type) {
    case 'cpa_new_repeat':
      return isNew ? (model.cpa_new ?? 0) : (model.cpa_repeat ?? 0)

    case 'pct_spend_new_repeat':
      return isNew
        ? amountGbp * (model.pct_new ?? 0)
        : amountGbp * (model.pct_repeat ?? 0)

    case 'blended_commission':
      return amountGbp * (model.blended_rate ?? 0)

    case 'fixed_fee':
      // Fixed fee is applied at month level, not per transaction
      return 0

    default:
      return 0
  }
}
