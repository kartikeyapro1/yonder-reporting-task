-- =============================================================================
-- 06_partner_transaction_facts.sql
--
-- Purpose: Enriched transaction-level fact table per partner.
-- Output grain: one row per settled transaction.
--
-- Enrichments applied:
--   - on/off Yonder flag (from partner_active_periods)
--   - new vs repeat classification (from partner_user_first_seen)
--   - boost/time-based offer flag (from experience_visited)
--   - revenue contribution (from partner_commercials)
--
-- Revenue is only computed for on-Yonder transactions.
-- Off-Yonder transactions have revenue_contribution = 0.
-- =============================================================================

CREATE OR REPLACE VIEW partner_transaction_facts AS
WITH

-- Resolve new/repeat per transaction
new_repeat AS (
    SELECT
        ct.transaction_id,
        ct.partner_name,
        ct.user_id,
        ct.ts,
        ct.year_month,
        ct.trans_amount_gbp,
        -- New customer logic: first tx on/after baseline, and this IS that first tx
        CASE
          WHEN fs.first_transaction_date >= pc.baseline_date::DATE
           AND fs.first_transaction_date = ct.ts::DATE
          THEN TRUE
          ELSE FALSE
        END AS is_new_customer
    FROM clean_transactions ct
    JOIN partner_user_first_seen fs
      ON ct.partner_name = fs.partner_name AND ct.user_id = fs.user_id
    JOIN partner_config pc
      ON ct.partner_name = pc.partner_name
),

-- On/off Yonder classification
on_off AS (
    SELECT
        nr.transaction_id,
        CASE
          WHEN EXISTS (
            SELECT 1 FROM partner_active_periods p
            WHERE p.partner_name = nr.partner_name
              AND nr.ts >= p.start_date
              AND (p.end_date IS NULL OR nr.ts < p.end_date)
          ) THEN TRUE
          ELSE FALSE
        END AS is_on_yonder
    FROM new_repeat nr
),

-- Boost flag from experience_visited
boost_flags AS (
    SELECT
        ev.transaction_id,
        ev.boost_type,
        CASE WHEN ev.boost_type = 'time_based' THEN TRUE ELSE FALSE END AS is_boost,
        ev.enhanced_redemption_rate
    FROM experience_visited ev
    WHERE ev.match_status IN ('match')
      AND ev.status = 'redeemable'
      AND ev.boost_type IS NOT NULL
),

-- All experience records per transaction (for engagement + denial tracking)
experience_engagement AS (
    SELECT
        ev.transaction_id,
        TRUE                                                           AS is_experience_matched,
        CASE
          WHEN ev.match_status = 'match_denied'
            OR ev.status = 'not_redeemable'
          THEN TRUE ELSE FALSE
        END                                                            AS is_denied_experience
    FROM experience_visited ev
),

-- Commercial model — pick most recent effective model for each transaction date
applicable_model AS (
    SELECT DISTINCT ON (pc.partner_name, nr.transaction_id)
        nr.transaction_id,
        nr.partner_name,
        pc.model_type,
        pc.cpa_new_gbp,
        pc.cpa_repeat_gbp,
        pc.pct_new,
        pc.pct_repeat,
        pc.blended_rate
    FROM new_repeat nr
    JOIN partner_commercials pc
      ON nr.partner_name = pc.partner_name
     AND nr.ts >= pc.effective_from
     AND (pc.effective_to IS NULL OR nr.ts <= pc.effective_to)
    ORDER BY pc.partner_name, nr.transaction_id, pc.effective_from DESC
)

SELECT
    nr.transaction_id,
    nr.partner_name,
    nr.user_id,
    nr.ts,
    nr.year_month,
    nr.trans_amount_gbp,
    ct.points_earned,
    nr.is_new_customer,
    oo.is_on_yonder,
    COALESCE(bf.is_boost, FALSE)                        AS is_boost,
    bf.boost_type,
    COALESCE(bf.enhanced_redemption_rate, FALSE)        AS enhanced_redemption_rate,
    COALESCE(ee.is_experience_matched, FALSE)           AS is_experience_matched,
    COALESCE(ee.is_denied_experience, FALSE)            AS is_denied_experience,
    am.model_type                                       AS commercial_model,
    -- Revenue: only on on-Yonder transactions
    CASE
      WHEN oo.is_on_yonder = FALSE THEN 0
      WHEN am.model_type = 'cpa_new_repeat' THEN
        CASE WHEN nr.is_new_customer THEN am.cpa_new_gbp ELSE am.cpa_repeat_gbp END
      WHEN am.model_type = 'pct_spend_new_repeat' THEN
        CASE WHEN nr.is_new_customer
             THEN nr.trans_amount_gbp * am.pct_new
             ELSE nr.trans_amount_gbp * am.pct_repeat
        END
      WHEN am.model_type = 'blended_commission' THEN
        nr.trans_amount_gbp * am.blended_rate
      ELSE 0
    END                                                 AS revenue_contribution
FROM new_repeat nr
JOIN clean_transactions ct ON nr.transaction_id = ct.transaction_id
JOIN on_off oo             ON nr.transaction_id = oo.transaction_id
LEFT JOIN boost_flags bf        ON nr.transaction_id = bf.transaction_id
LEFT JOIN experience_engagement ee ON nr.transaction_id = ee.transaction_id
LEFT JOIN applicable_model am   ON nr.transaction_id = am.transaction_id
;
