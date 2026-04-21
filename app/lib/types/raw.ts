// Raw CSV row shapes — direct mappings from PapaParse output

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
