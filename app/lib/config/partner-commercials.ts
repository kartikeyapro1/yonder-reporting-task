/**
 * partner-commercials.ts
 *
 * Structured commercial model config per partner.
 * Revenue logic reads from here — no per-component hardcoding.
 *
 * Supported commercial models:
 *
 * cpa_new_repeat  (FRIVE)
 *   A fixed Cost Per Acquisition paid per settled, on-Yonder transaction.
 *   cpa_new    = £20.00  → paid when a user's first visit to this partner is on/after baseline_date
 *   cpa_repeat = £12.50  → paid for every subsequent settled visit by the same user
 *   Revenue is earned per transaction, regardless of transaction amount.
 *   Example: user visits FRIVE 3 times post-baseline → £20 + £12.50 + £12.50 = £45.00
 *
 * pct_spend_new_repeat  (Gopuff)
 *   A percentage of transaction spend, with different rates for new vs repeat.
 *   pct_new    = 8%  → 0.08 × trans_amount_gbp for first-visit transactions
 *   pct_repeat = 1%  → 0.01 × trans_amount_gbp for returning-visit transactions
 *   Revenue scales with spend, so a £50 first visit generates £4.00.
 *   Example: £50 new visit + £30 repeat visit → £4.00 + £0.30 = £4.30
 *
 * Effective date: each CommercialModel entry has an effective_from date.
 * getCommercialModel() picks the most recent model where effective_from ≤ txDate,
 * enabling mid-contract rate changes without code deploys.
 *
 * Revenue is ONLY earned on on-Yonder transactions (is_on_yonder = true).
 * Off-Yonder transactions appear in spend analytics but contribute £0 revenue.
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

// ─── Lookup caches ───────────────────────────────────────────────────────────
// Built once at module load. O(1) for all hot-path lookups.

const _byName  = new Map<string, PartnerConfig>(PARTNER_CONFIGS.map(c => [c.partner_name, c]))
const _byToken = new Map<string, PartnerConfig>(PARTNER_CONFIGS.map(c => [c.partner_token, c]))
const _bySlug  = new Map<string, PartnerConfig>(
  PARTNER_CONFIGS.map(c => [c.partner_name.toLowerCase().replace(/\s+/g, '-'), c])
)

/**
 * Retrieve config for a partner by canonical name.
 */
export function getPartnerConfig(partnerName: string): PartnerConfig | undefined {
  return _byName.get(partnerName)
}

/**
 * Retrieve config by the opaque partner token (for partner-facing routes).
 */
export function getPartnerByToken(token: string): PartnerConfig | undefined {
  return _byToken.get(token)
}

/**
 * Retrieve config by URL slug (for internal routes).
 */
export function getPartnerBySlug(slug: string): PartnerConfig | undefined {
  return _bySlug.get(slug)
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
