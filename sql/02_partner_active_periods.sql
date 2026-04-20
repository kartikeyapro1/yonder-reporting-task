-- =============================================================================
-- 02_partner_active_periods.sql
--
-- Purpose: Define when each partner was active on the Yonder platform.
-- Output grain: one row per active period per partner.
--
-- This table drives the on/off Yonder classification for all transaction-level
-- and aggregated reporting. It replaces hardcoded period logic in charts.
--
-- Assumption: a partner is "on Yonder" for the entire calendar month when
-- that month appears as an active period. Periods are inclusive of start_date
-- and exclusive of end_date (i.e. a standard half-open interval [start, end)).
-- =============================================================================

CREATE TABLE IF NOT EXISTS partner_active_periods (
    id           SERIAL PRIMARY KEY,
    partner_name TEXT        NOT NULL,
    start_date   DATE        NOT NULL,
    end_date     DATE,                 -- NULL = currently active
    label        TEXT,
    CONSTRAINT chk_dates CHECK (end_date IS NULL OR end_date > start_date)
);

-- FRIVE — active in Jan, Mar, May, Jul, Oct, Dec 2025
INSERT INTO partner_active_periods (partner_name, start_date, end_date, label) VALUES
  ('FRIVE', '2025-01-01', '2025-02-01', 'Jan 2025'),
  ('FRIVE', '2025-03-01', '2025-04-01', 'Mar 2025'),
  ('FRIVE', '2025-05-01', '2025-06-01', 'May 2025'),
  ('FRIVE', '2025-07-01', '2025-08-01', 'Jul 2025'),
  ('FRIVE', '2025-10-01', '2025-11-01', 'Oct 2025'),
  ('FRIVE', '2025-12-01', '2026-01-01', 'Dec 2025');

-- Gopuff — active from Dec 2025 onwards (no end date = ongoing)
INSERT INTO partner_active_periods (partner_name, start_date, end_date, label) VALUES
  ('Gopuff', '2025-12-01', NULL, 'Dec 2025 onwards');

-- =============================================================================
-- Helper: check if a given transaction date falls within an active period
--
-- SELECT
--   t.transaction_id,
--   CASE
--     WHEN EXISTS (
--       SELECT 1 FROM partner_active_periods p
--       WHERE p.partner_name = t.canonical_partner_name
--         AND t.ts >= p.start_date
--         AND (p.end_date IS NULL OR t.ts < p.end_date)
--     ) THEN TRUE
--     ELSE FALSE
--   END AS is_on_yonder
-- FROM clean_transactions t
-- =============================================================================
