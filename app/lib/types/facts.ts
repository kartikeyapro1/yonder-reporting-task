// Enriched per-transaction facts — used as the base for all metric aggregations

import type { CommercialModelType } from './config'

export interface PartnerTransactionFact {
  transaction_id: string
  partner_name: string
  user_id: string
  timestamp: Date
  year_month: string
  trans_amount_gbp: number
  is_settled: boolean
  is_new_customer: boolean       // true if this is within their first engagement month with this partner
  is_on_yonder: boolean          // true if tx falls within an active period
  is_boost: boolean              // true if matched to experience_visited with boost_type=time_based AND status=redeemable
  boost_type: string | null
  enhanced_redemption_rate: boolean  // true if experience_visited.enhanced_redemption_rate was true for this tx
  is_experience_matched: boolean  // true if any experience_visited record links to this transaction (redeemable or denied)
  is_denied_experience: boolean   // true if matched experience was denied (required_link=True, match_denied)
  commercial_model: CommercialModelType
  revenue_contribution: number
  points_earned: number           // Yonder points awarded for this transaction
}
