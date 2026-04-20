-- =============================================================================
-- 01_partner_name_mapping.sql
--
-- Purpose: Normalise raw merchant descriptions to canonical partner names.
-- Output grain: one row per raw description variant, with canonical_partner_name.
--
-- IMPORTANT — SQL vs TypeScript parity:
--   The TypeScript pipeline (lib/config/partner-mappings.ts) uses regex patterns
--   (e.g. /^frive(\s+ltd)?$/i) which handle arbitrary whitespace and mixed case
--   in a single rule. This SQL table uses exhaustive exact-match enumeration with
--   UPPER(TRIM()) normalisation, which is equivalent for known variants but will
--   miss novel whitespace/encoding variants (e.g. "FRIVE  LTD" with two spaces).
--
--   For BigQuery production, upgrade the JOIN in 04_clean_transactions.sql to
--   use REGEXP_CONTAINS() — see the migration comment at the bottom of this file.
--   Until then, add an explicit row here for every new raw variant discovered.
-- =============================================================================

CREATE TABLE IF NOT EXISTS partner_name_mapping (
    raw_description_pattern  TEXT NOT NULL,
    canonical_partner_name   TEXT NOT NULL,
    notes                    TEXT
);

-- Seed data — mirrors the regex patterns in lib/config/partner-mappings.ts.
-- Column is upper-trimmed in the JOIN so casing here does not matter.
-- Add one row per distinct raw variant seen in production data.
INSERT INTO partner_name_mapping (raw_description_pattern, canonical_partner_name, notes) VALUES
  -- FRIVE: /^frive(\s+ltd)?$/i  and  /^the\s+frive$/i
  ('FRIVE',              'FRIVE', 'Base name'),
  ('FRIVE LTD',          'FRIVE', 'Legal entity suffix'),
  ('THE FRIVE',          'FRIVE', 'Venue prefix'),

  -- Gopuff: /^gopuff(\*delivery)?$/i  and  /^go\s+puff$/i
  ('GOPUFF',             'Gopuff', 'Base name'),
  ('GOPUFF*DELIVERY',    'Gopuff', 'Delivery suffix'),
  ('GO PUFF',            'Gopuff', 'Space variant'),

  -- Restaurant partners: /^<name>/i prefix matches (any suffix accepted in TS)
  -- SQL uses UPPER(TRIM()) exact match so we enumerate the specific variants seen.
  ('DISHOOM SHOREDITCH', 'Dishoom', NULL),
  ('DISHOOM KINGS CROSS','Dishoom', NULL),
  ('DISHOOM CARNABY',    'Dishoom', NULL),
  ('PIZZA PILGRIMS',     'Pizza Pilgrims', NULL),
  ('HONEST BURGERS',     'Honest Burgers', NULL),
  ('BARRAFINA',          'Barrafina', NULL),
  ('BAO SOHO',           'Bao', NULL),
  ('BURGER & LOBSTER',   'Burger & Lobster', NULL),
  ('FLAT IRON SOHO',     'Flat Iron', NULL),
  ('FLAT IRON COVENT GARDEN', 'Flat Iron', NULL),
  ('FRANCO MANCA',       'Franco Manca', NULL),
  ('GYMKHANA LONDON',    'Gymkhana', NULL),
  ('HOPPERS SOHO',       'Hoppers', NULL),
  ('PADELLA BOROUGH',    'Padella', NULL),
  ('THE BREAKFAST CLUB', 'The Breakfast Club', NULL);

-- =============================================================================
-- Usage in downstream SQL (current — exact match with UPPER/TRIM):
--
--   INNER JOIN partner_name_mapping m
--     ON UPPER(TRIM(COALESCE(t.raw_merchant_description, t.merchant_description)))
--        = m.raw_description_pattern
--
-- =============================================================================
-- BigQuery production upgrade — REGEXP_CONTAINS (mirrors TS regex exactly):
--
-- Step 1: Add a pattern_regex column alongside raw_description_pattern:
--   ALTER TABLE partner_name_mapping ADD COLUMN pattern_regex STRING;
--   UPDATE partner_name_mapping SET pattern_regex = CASE canonical_partner_name
--     WHEN 'FRIVE'   THEN r'(?i)^frive(\s+ltd)?$|^the\s+frive$'
--     WHEN 'Gopuff'  THEN r'(?i)^gopuff(\*delivery)?$|^go\s+puff$'
--     WHEN 'Dishoom' THEN r'(?i)^dishoom'
--     -- ... add remaining partners
--   END WHERE TRUE;
--
-- Step 2: Update the JOIN in 04_clean_transactions.sql:
--   INNER JOIN (
--     SELECT DISTINCT canonical_partner_name, pattern_regex
--     FROM partner_name_mapping
--     WHERE pattern_regex IS NOT NULL
--   ) m ON REGEXP_CONTAINS(
--     TRIM(COALESCE(t.raw_merchant_description, t.merchant_description)),
--     m.pattern_regex
--   )
--
-- This eliminates the need to enumerate every raw variant individually.
-- =============================================================================
