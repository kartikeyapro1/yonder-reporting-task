/**
 * schema.ts
 *
 * Canonical field descriptions for both raw CSV schemas, derived from
 * the reporting_schema.xlsx data dictionary.
 *
 * These descriptions are the single source of truth for:
 * - Tooltip text shown on column headers in dashboards
 * - BigQuery column descriptions when creating/updating views
 * - Documentation and onboarding
 *
 * When the schema changes, update here first.
 */

// ─── experience_visited schema ───────────────────────────────────────────────

export const EXPERIENCE_VISITED_SCHEMA = {
  status: {
    description: 'Whether the experience can be redeemed',
    type: 'varchar',
    values: ['redeemable', 'not_redeemable'],
  },
  experience_id: {
    description: 'Unique Experience ID',
    type: 'uuid',
  },
  transaction_id: {
    description: 'Unique ID of the linked transaction',
    type: 'uuid',
  },
  user_id: {
    description: 'Unique User ID of the Yonder cardholder',
    type: 'uuid',
  },
  timestamp: {
    description: 'Timestamp of the transaction',
    type: 'timestamptz',
  },
  experience_description: {
    description: 'Name of the experience (raw, not cleaned)',
    type: 'varchar',
  },
  total_spend: {
    description: 'Amount spent at the experience in GBP',
    type: 'double precision',
  },
  enhanced_redemption_rate: {
    description: 'Whether the transaction qualified for an enhanced (boosted) cashback rate. Distinct from boost_type: a transaction can have enhanced_redemption_rate=true with no boost_type (standard enhanced cashback), or both fields set (time-based boost that also applied an enhanced rate). The pipeline tracks this separately from is_boost.',
    type: 'boolean',
  },
  boost_type: {
    description: 'The type of promotional boost applied — "time_based" means a scheduled offer window',
    type: 'varchar',
    values: ['time_based', ''],
  },
  match_status: {
    description: 'Whether this transaction was successfully matched to an experience. "match_denied" = matched but not eligible.',
    type: 'varchar',
    values: ['match', 'match_denied'],
  },
  required_link: {
    description: 'Whether the member had to activate a link to unlock the experience',
    type: 'boolean',
  },
  clean_description: {
    description: 'Canonical partner name (cleaned from raw experience_description)',
    type: 'varchar',
  },
} as const

// ─── transaction_new schema ───────────────────────────────────────────────────

export const TRANSACTION_SCHEMA = {
  merchant_id: {
    description: 'ID of the merchant (terminal location)',
    type: 'uuid',
  },
  state: {
    description: 'State of the transaction — only "settled" transactions are used in revenue calculations',
    type: 'varchar',
    values: ['settled', 'declined', 'pending'],
  },
  timestamp: {
    description: 'Timestamp the transaction occurred',
    type: 'timestamptz',
  },
  trans_currency: {
    description: 'Currency the transaction was made in (e.g. GBP, USD)',
    type: 'varchar',
  },
  transaction_id: {
    description: 'Unique transaction ID — joins to experience_visited.transaction_id',
    type: 'uuid',
  },
  type: {
    description: 'Transaction method',
    type: 'varchar',
    values: ['contactless', 'online', 'chip_and_pin'],
  },
  merchant_city: {
    description: 'City where the merchant is located',
    type: 'varchar',
  },
  merchant_category: {
    description: 'Aggregated category of the merchant (e.g. restaurant, delivery, travel)',
    type: 'varchar',
  },
  merchant_postcode: {
    description: 'Merchant postcode',
    type: 'varchar',
  },
  _3ds: {
    description: 'Whether the transaction was 3D Secure verified',
    type: 'boolean',
  },
  charged_amount: {
    description: 'Amount charged in GBP (always in GBP, used as fallback when fx_rate is missing)',
    type: 'double precision',
  },
  charged_currency: {
    description: 'Currency of the charged amount (should always be GBP for domestic cards)',
    type: 'varchar',
  },
  merchant_country: {
    description: 'Country where the merchant is located',
    type: 'varchar',
  },
  merchant_description: {
    description: 'Merchant name (cleaned by the card network)',
    type: 'varchar',
  },
  fx_rate: {
    description: 'FX rate used for conversion — expressed as foreign_currency_per_GBP. GBP amount = trans_amount / fx_rate',
    type: 'double precision',
  },
  trans_amount: {
    description: 'Transaction amount in the transaction currency (trans_currency)',
    type: 'double precision',
  },
  user_id: {
    description: 'Unique Yonder cardholder ID — joins across all tables',
    type: 'uuid',
  },
  points_earned: {
    description: 'Yonder points earned on this transaction',
    type: 'int',
  },
  mcc: {
    description: 'Merchant Category Code (ISO 18245) — 4-digit industry classification',
    type: 'int',
  },
  _wallet: {
    description: 'Digital wallet used (e.g. APPLE_PAY, GOOGLE_PAY, or blank for physical card)',
    type: 'varchar',
    values: ['APPLE_PAY', 'GOOGLE_PAY', ''],
  },
  raw_merchant_description: {
    description: 'Merchant name exactly as received from the card network — used for partner name matching',
    type: 'varchar',
  },
  terminal_id: {
    description: 'Merchant terminal ID — uniquely identifies a physical payment device',
    type: 'varchar',
  },
} as const

// ─── Metric descriptions (used for dashboard tooltips) ───────────────────────

/**
 * Human-readable descriptions for every computed metric shown in dashboards.
 * Use these for tooltip text — copy verbatim to avoid drift.
 */
export const METRIC_DESCRIPTIONS = {
  // ── Spend ────────────────────────────────────────────────
  total_spend_gbp: 'Total GBP spent at this partner by Yonder members, using their Yonder card. Only settled transactions are counted.',
  new_spend_gbp: 'Spend from members who visited this partner for the first time (on or after the partner baseline date).',
  repeat_spend_gbp: 'Spend from members who had visited this partner before.',
  on_yonder_spend: 'Spend that occurred during months when this partner was active on the Yonder platform.',
  off_yonder_spend: 'Spend that occurred during months when this partner was NOT active on Yonder.',
  avg_monthly_on_spend: 'Average monthly card spend while this partner was active on Yonder.',
  avg_monthly_off_spend: 'Average monthly card spend while this partner was NOT active on Yonder.',
  incremental_spend: 'The difference in average monthly spend between active and inactive Yonder months. Positive means Yonder drove more spend.',

  // ── Commission (Yonder's earnings) ───────────────────────
  total_revenue: "Yonder's total commission from this partner, calculated from the agreed commercial model (CPA or % of spend).",
  new_revenue: "Commission from first-time visits, calculated at the 'new customer' rate in the commercial agreement.",
  repeat_revenue: "Commission from returning visits, calculated at the 'repeat customer' rate.",
  boost_revenue: 'Commission from transactions that occurred during a time-based promotional boost window.',

  // ── Transactions ─────────────────────────────────────────
  total_transactions: 'Total number of settled card transactions at this partner by Yonder members.',
  new_transactions: 'Settled transactions from members on their first visit to this partner via Yonder.',
  repeat_transactions: 'Settled transactions from members who had previously visited this partner.',
  boost_transactions: 'Transactions that matched an active time-based promotional experience window.',

  // ── Members ──────────────────────────────────────────────
  unique_users: 'Number of distinct Yonder cardholders who made at least one settled transaction at this partner.',
  new_users: 'Cardholders whose first recorded visit to this partner falls within the reporting window (on or after baseline date).',
} as const

export type MetricKey = keyof typeof METRIC_DESCRIPTIONS
