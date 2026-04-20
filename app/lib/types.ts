// Core domain types for the Yonder reporting platform

// ─── Raw CSV shapes ─────────────────────────────────────────────────────────

export interface RawTransaction {
  merchant_id: string
  state: string
  timestamp: string
  trans_currency: string
  transaction_id: string
  type: string
  merchant_city: string
  merchant_category: string
  merchant_postcode: string
  _3ds: string
  charged_amount: string
  charged_currency: string
  merchant_country: string
  merchant_description: string
  fx_rate: string
  trans_amount: string
  user_id: string
  points_earned: string
  mcc: string
  _wallet: string
  raw_merchant_description: string
  terminal_id: string
}

export interface RawExperienceVisited {
  status: string
  experience_id: string
  transaction_id: string
  user_id: string
  timestamp: string
  experience_description: string
  total_spend: string
  enhanced_redemption_rate: string
  boost_type: string
  match_status: string
  required_link: string
  clean_description: string
}

// ─── Normalised / clean layer ────────────────────────────────────────────────

export interface CleanTransaction {
  transaction_id: string
  user_id: string
  merchant_id: string
  partner_name: string           // canonical, normalised
  raw_description: string
  timestamp: Date
  year_month: string             // "YYYY-MM"
  trans_amount_gbp: number       // fx-adjusted to GBP
  state: string                  // settled | declined | pending
  type: string                   // contactless | online | chip_and_pin
  is_settled: boolean
}

export interface PartnerUserFirstSeen {
  partner_name: string
  user_id: string
  first_transaction_date: Date
  first_year_month: string
}

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
  is_boost: boolean              // true if matched to experience_visited with time_based boost
  boost_type: string | null
  commercial_model: CommercialModelType
  revenue_contribution: number
}

// ─── Partner configuration types ────────────────────────────────────────────

export type CommercialModelType =
  | 'cpa_new_repeat'
  | 'pct_spend_new_repeat'
  | 'blended_commission'
  | 'fixed_fee'

export interface CommercialModel {
  type: CommercialModelType
  // CPA model
  cpa_new?: number
  cpa_repeat?: number
  // Percentage on spend model
  pct_new?: number       // 0–1 (e.g. 0.08 = 8%)
  pct_repeat?: number
  // Blended commission
  blended_rate?: number
  // Fixed fee
  fixed_monthly?: number
  currency: string
  effective_from: string   // ISO date
  effective_to?: string    // ISO date, undefined = current
}

export interface PartnerActivePeriod {
  partner_name: string
  start_date: string        // ISO date "YYYY-MM-DD"
  end_date: string | null   // null = still active
  label?: string
}

export interface PartnerConfig {
  partner_name: string
  display_name: string
  category: string
  baseline_date: string     // ISO date — first month to report from
  partner_token: string     // opaque URL token for partner-facing routes
  active_periods: PartnerActivePeriod[]
  commercials: CommercialModel[]
}

// ─── Aggregated metrics ──────────────────────────────────────────────────────

export interface PartnerMonthlyMetrics {
  partner_name: string
  year_month: string
  is_on_yonder: boolean

  total_transactions: number
  settled_transactions: number
  total_spend_gbp: number

  new_transactions: number
  new_spend_gbp: number
  repeat_transactions: number
  repeat_spend_gbp: number

  boost_transactions: number
  boost_spend_gbp: number
  boost_revenue: number

  total_revenue: number
  new_revenue: number
  repeat_revenue: number

  unique_users: number
  new_users: number
}

export interface PartnerSummaryMetrics {
  partner_name: string
  display_name: string
  period_label: string

  total_transactions: number
  settled_transactions: number
  total_spend_gbp: number
  total_revenue: number

  new_transactions: number
  new_spend_gbp: number
  new_revenue: number
  repeat_transactions: number
  repeat_spend_gbp: number
  repeat_revenue: number

  boost_transactions: number
  boost_spend_gbp: number
  boost_revenue: number

  unique_users: number
  new_users: number

  on_yonder_spend: number
  off_yonder_spend: number
  on_months_count: number
  off_months_count: number
  avg_monthly_on_spend: number    // on_yonder_spend / on_months_count
  avg_monthly_off_spend: number   // off_yonder_spend / off_months_count
  incremental_spend: number       // avg_monthly_on - avg_monthly_off (per-month normalised)

  monthly_breakdown: PartnerMonthlyMetrics[]

  // Insight copy, generated from metrics
  insights: string[]
}

export interface InternalDashboardRow {
  partner_name: string
  display_name: string
  category: string
  total_spend_gbp: number
  total_revenue: number
  total_transactions: number
  unique_users: number
  last_active_month: string
  is_currently_active: boolean
  revenue_trend: 'up' | 'down' | 'flat'
}
