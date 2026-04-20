-- =============================================================================
-- 04_clean_transactions.sql
--
-- Purpose: Produce the clean, normalised transaction table from raw data.
-- Output grain: one row per settled transaction with canonical partner name
--               and GBP-equivalent amount.
--
-- Steps:
--   1. Filter to settled transactions only
--   2. Join to partner_name_mapping to resolve canonical name
--   3. Convert FX amounts to GBP
--   4. Discard transactions with no partner mapping (non-partner spend)
--
-- Assumption: trans_amount is in trans_currency. When trans_currency != GBP,
-- fx_rate represents foreign_currency_per_GBP, so GBP amount = trans_amount / fx_rate.
-- If fx_rate is 0 or NULL, fall back to charged_amount (always in charged_currency,
-- which in domestic-card records equals GBP).
-- =============================================================================

CREATE OR REPLACE VIEW clean_transactions AS
SELECT
    t.transaction_id,
    t.user_id,
    t.merchant_id,
    m.canonical_partner_name                              AS partner_name,
    COALESCE(t.raw_merchant_description, t.merchant_description) AS raw_description,
    t.timestamp::TIMESTAMPTZ                              AS ts,
    TO_CHAR(t.timestamp::DATE, 'YYYY-MM')                AS year_month,
    -- FX normalisation to GBP
    CASE
      WHEN UPPER(t.trans_currency) = 'GBP'
        THEN t.trans_amount
      WHEN t.fx_rate IS NOT NULL AND t.fx_rate > 0
        THEN t.trans_amount / t.fx_rate
      ELSE t.charged_amount                               -- fallback to GBP charged amount
    END                                                   AS trans_amount_gbp,
    t.state,
    t.type                                                AS transaction_type
FROM transactions t
-- Normalise merchant description to canonical partner name
INNER JOIN partner_name_mapping m
  ON UPPER(TRIM(COALESCE(t.raw_merchant_description, t.merchant_description)))
     = UPPER(TRIM(m.raw_description_pattern))
WHERE
    t.state = 'settled'
;

-- Optional index hint for warehouse engines that support it:
-- CREATE INDEX ix_clean_transactions_partner_month ON clean_transactions (partner_name, year_month);
