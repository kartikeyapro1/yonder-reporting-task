// Partner configuration types — commercial models, active periods, partner config

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
