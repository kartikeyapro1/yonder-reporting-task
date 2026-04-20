-- =============================================================================
-- 01_partner_name_mapping.sql
--
-- Purpose: Normalise raw merchant descriptions to canonical partner names.
-- Output grain: one row per raw description variant, with canonical_partner_name.
--
-- This is intended as a reference/lookup table or a CTE used by downstream
-- models. In production this would be maintained as a seed table or dbt model.
-- =============================================================================

CREATE TABLE IF NOT EXISTS partner_name_mapping (
    raw_description_pattern  TEXT NOT NULL,
    canonical_partner_name   TEXT NOT NULL,
    notes                    TEXT
);

-- Seed data — add rows here as new merchant variants are discovered
INSERT INTO partner_name_mapping (raw_description_pattern, canonical_partner_name, notes) VALUES
  ('FRIVE',              'FRIVE', 'Exact match'),
  ('FRIVE LTD',          'FRIVE', 'Legal entity variant'),
  ('THE FRIVE',          'FRIVE', 'Venue prefix variant'),
  ('Frive',              'FRIVE', 'Mixed-case variant'),
  ('frive',              'FRIVE', 'Lowercase variant'),
  ('Gopuff',             'Gopuff', 'Exact match'),
  ('GOPUFF',             'Gopuff', 'Uppercase variant'),
  ('Go Puff',            'Gopuff', 'Space variant'),
  ('GOPUFF*DELIVERY',    'Gopuff', 'Delivery suffix variant'),
  ('Dishoom Shoreditch', 'Dishoom', NULL),
  ('Pizza Pilgrims',     'Pizza Pilgrims', NULL),
  ('Honest Burgers',     'Honest Burgers', NULL),
  ('Barrafina',          'Barrafina', NULL),
  ('Bao Soho',           'Bao', NULL),
  ('Burger & Lobster',   'Burger & Lobster', NULL),
  ('Flat Iron Soho',     'Flat Iron', NULL),
  ('Franco Manca',       'Franco Manca', NULL),
  ('Gymkhana London',    'Gymkhana', NULL),
  ('Hoppers Soho',       'Hoppers', NULL),
  ('Padella Borough',    'Padella', NULL),
  ('The Breakfast Club', 'The Breakfast Club', NULL);

-- =============================================================================
-- Usage as CTE in downstream SQL:
--
-- WITH normalised AS (
--   SELECT
--     t.transaction_id,
--     t.user_id,
--     COALESCE(m.canonical_partner_name, t.merchant_description) AS partner_name,
--     t.trans_amount,
--     t.timestamp
--   FROM transactions t
--   LEFT JOIN partner_name_mapping m
--     ON UPPER(TRIM(COALESCE(t.raw_merchant_description, t.merchant_description)))
--        = UPPER(TRIM(m.raw_description_pattern))
-- )
-- =============================================================================
