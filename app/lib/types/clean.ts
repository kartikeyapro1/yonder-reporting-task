// Normalised / clean layer — fx-adjusted, partner-resolved, typed

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
  merchant_category: string      // e.g. eating_out | groceries | transport | general
  points_earned: number          // Yonder points awarded for this transaction
}

export interface PartnerUserFirstSeen {
  partner_name: string
  user_id: string
  first_transaction_date: Date
  first_year_month: string
}
