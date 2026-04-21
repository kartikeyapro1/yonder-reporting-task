// Aggregated metrics types — monthly rollups and full partner summaries

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

  enhanced_rate_transactions: number   // transactions where enhanced_redemption_rate = true
  enhanced_rate_spend_gbp: number

  experience_matched_transactions: number  // transactions with any experience_visited record
  denied_experience_transactions: number   // transactions with a denied experience (required_link)
  total_points_earned: number              // sum of points_earned across all settled transactions

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

  enhanced_rate_transactions: number
  enhanced_rate_spend_gbp: number

  experience_matched_transactions: number
  denied_experience_transactions: number
  experience_engagement_rate: number       // experience_matched / total_transactions (0–1)
  total_points_earned: number

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
