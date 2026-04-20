-- =============================================================================
-- 05_partner_user_first_seen.sql
--
-- Purpose: Identify the first transaction each user made with each partner.
-- Output grain: one row per (partner_name, user_id).
--
-- Used downstream to classify new vs repeat customers.
--
-- Assumption: first-seen is determined across all of history (not just within
-- the reporting window). If a user has pre-baseline transactions they are
-- treated as "existing" customers throughout the reporting period.
-- =============================================================================

CREATE OR REPLACE VIEW partner_user_first_seen AS
SELECT
    partner_name,
    user_id,
    MIN(ts)                           AS first_transaction_date,
    MIN(year_month)                   AS first_year_month
FROM clean_transactions
GROUP BY
    partner_name,
    user_id
;

-- =============================================================================
-- New vs repeat classification logic:
--
-- A user-partner pair is classified as "new" for a given transaction if:
--   1. Their first_transaction_date is on or after the partner's baseline_date
--   2. AND the current transaction IS that first transaction
--
-- All other transactions by that user at that partner are "repeat".
--
-- Example join:
--
-- SELECT
--   ct.transaction_id,
--   ct.partner_name,
--   ct.user_id,
--   ct.ts,
--   CASE
--     WHEN fs.first_transaction_date >= pc.baseline_date
--      AND fs.first_transaction_date = ct.ts
--     THEN TRUE
--     ELSE FALSE
--   END AS is_new_customer
-- FROM clean_transactions ct
-- JOIN partner_user_first_seen fs
--   ON ct.partner_name = fs.partner_name AND ct.user_id = fs.user_id
-- JOIN partner_config pc
--   ON ct.partner_name = pc.partner_name
-- =============================================================================
