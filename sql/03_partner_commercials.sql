-- =============================================================================
-- 03_partner_commercials.sql
--
-- Purpose: Store commercial model configurations per partner.
-- Output grain: one row per commercial model effective period.
--
-- Supported model types:
--   cpa_new_repeat       — flat CPA fee per new / repeat transaction
--   pct_spend_new_repeat — percentage of spend for new / repeat customers
--   blended_commission   — single rate on all spend
--   fixed_fee            — fixed monthly fee (not computed per transaction)
--
-- Rates are stored as NUMERIC to avoid floating-point precision issues.
-- =============================================================================

CREATE TABLE IF NOT EXISTS partner_commercials (
    id                  SERIAL PRIMARY KEY,
    partner_name        TEXT        NOT NULL,
    model_type          TEXT        NOT NULL,   -- see model types above
    -- CPA fields
    cpa_new_gbp         NUMERIC(10,2),
    cpa_repeat_gbp      NUMERIC(10,2),
    -- Percentage fields (stored as decimal, e.g. 0.08 = 8%)
    pct_new             NUMERIC(6,4),
    pct_repeat          NUMERIC(6,4),
    -- Blended
    blended_rate        NUMERIC(6,4),
    -- Fixed fee
    fixed_monthly_gbp   NUMERIC(10,2),
    -- Validity window
    effective_from      DATE        NOT NULL,
    effective_to        DATE,                   -- NULL = current
    currency            CHAR(3)     NOT NULL DEFAULT 'GBP'
);

-- FRIVE: £20 CPA new, £12.50 CPA repeat (effective from Jan 2025)
INSERT INTO partner_commercials
    (partner_name, model_type, cpa_new_gbp, cpa_repeat_gbp, effective_from)
VALUES
    ('FRIVE', 'cpa_new_repeat', 20.00, 12.50, '2025-01-01');

-- Gopuff: 8% on new spend, 1% on repeat spend (effective from Dec 2025)
INSERT INTO partner_commercials
    (partner_name, model_type, pct_new, pct_repeat, effective_from)
VALUES
    ('Gopuff', 'pct_spend_new_repeat', 0.08, 0.01, '2025-12-01');

-- =============================================================================
-- Revenue computation logic per transaction:
--
-- SELECT
--   t.transaction_id,
--   c.model_type,
--   CASE c.model_type
--     WHEN 'cpa_new_repeat' THEN
--       CASE WHEN t.is_new_customer THEN c.cpa_new_gbp ELSE c.cpa_repeat_gbp END
--     WHEN 'pct_spend_new_repeat' THEN
--       CASE WHEN t.is_new_customer
--            THEN t.trans_amount_gbp * c.pct_new
--            ELSE t.trans_amount_gbp * c.pct_repeat
--       END
--     WHEN 'blended_commission' THEN t.trans_amount_gbp * c.blended_rate
--     ELSE 0
--   END AS revenue_contribution
-- FROM partner_transaction_facts t
-- JOIN partner_commercials c
--   ON t.partner_name = c.partner_name
--  AND t.ts >= c.effective_from
--  AND (c.effective_to IS NULL OR t.ts <= c.effective_to)
-- =============================================================================
