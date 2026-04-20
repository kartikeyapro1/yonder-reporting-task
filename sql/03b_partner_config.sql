-- =============================================================================
-- 03b_partner_config.sql
--
-- Purpose: Define per-partner configuration including baseline date.
-- Output grain: one row per partner.
--
-- This table is referenced by:
--   - 06_partner_transaction_facts.sql  (new/repeat classification via baseline_date)
--   - 08_partner_report_summary.sql     (scope aggregation to baseline onwards)
--
-- baseline_date: the first date from which Yonder claims new-customer credit.
--   Transactions before this date establish "pre-existing" customer status.
--   A user whose first-ever transaction with this partner pre-dates baseline_date
--   is always classified as a repeat customer throughout the reporting window.
-- =============================================================================

CREATE TABLE IF NOT EXISTS partner_config (
    partner_name    TEXT        NOT NULL PRIMARY KEY,
    display_name    TEXT        NOT NULL,
    category        TEXT        NOT NULL,
    baseline_date   DATE        NOT NULL,   -- first date Yonder reports from
    notes           TEXT
);

INSERT INTO partner_config (partner_name, display_name, category, baseline_date, notes) VALUES
  ('FRIVE',   'Frive',   'Food & Drink', '2025-01-01',
   'CPA model: £20 new, £12.50 repeat. Active months: Jan/Mar/May/Jul/Oct/Dec 2025.'),
  ('Gopuff',  'Gopuff',  'Delivery',     '2025-12-01',
   '% spend model: 8% new, 1% repeat. Active from Dec 2025 onwards.');

-- =============================================================================
-- Usage notes:
--
-- This table is intentionally kept separate from partner_commercials (03) to
-- allow multiple commercial models per partner over time without duplicating
-- the baseline date.
--
-- JOIN pattern used in 06 and 08:
--   JOIN partner_config pc ON ptf.partner_name = pc.partner_name
--   WHERE ptf.ts >= pc.baseline_date::TIMESTAMPTZ
-- =============================================================================
