-- =============================================================================
-- 08_partner_report_summary.sql
--
-- Purpose: Produce the final rolled-up summary per partner, including
--          incremental spend calculation (on vs off Yonder).
-- Output grain: one row per partner across the full reporting window.
--
-- Used by: automated partner reports, internal dashboard KPIs.
-- =============================================================================

CREATE OR REPLACE VIEW partner_report_summary AS
WITH

-- Aggregate all facts since baseline date
aggregated AS (
    SELECT
        ptf.partner_name,
        SUM(ptf.trans_amount_gbp)                                           AS total_spend_gbp,
        SUM(ptf.revenue_contribution)                                       AS total_revenue,
        COUNT(ptf.transaction_id)                                           AS total_transactions,

        -- New
        COUNT(ptf.transaction_id) FILTER (WHERE ptf.is_new_customer)       AS new_transactions,
        SUM(ptf.trans_amount_gbp)  FILTER (WHERE ptf.is_new_customer)      AS new_spend_gbp,
        SUM(ptf.revenue_contribution) FILTER (WHERE ptf.is_new_customer)   AS new_revenue,

        -- Repeat
        COUNT(ptf.transaction_id) FILTER (WHERE NOT ptf.is_new_customer)   AS repeat_transactions,
        SUM(ptf.trans_amount_gbp)  FILTER (WHERE NOT ptf.is_new_customer)  AS repeat_spend_gbp,
        SUM(ptf.revenue_contribution) FILTER (WHERE NOT ptf.is_new_customer) AS repeat_revenue,

        -- Boost
        COUNT(ptf.transaction_id) FILTER (WHERE ptf.is_boost)              AS boost_transactions,
        SUM(ptf.trans_amount_gbp)  FILTER (WHERE ptf.is_boost)             AS boost_spend_gbp,
        SUM(ptf.revenue_contribution) FILTER (WHERE ptf.is_boost)          AS boost_revenue,

        -- On vs Off Yonder
        SUM(ptf.trans_amount_gbp) FILTER (WHERE ptf.is_on_yonder)          AS on_yonder_spend,
        SUM(ptf.trans_amount_gbp) FILTER (WHERE NOT ptf.is_on_yonder)      AS off_yonder_spend,

        -- Users
        COUNT(DISTINCT ptf.user_id)                                        AS unique_users,
        COUNT(DISTINCT ptf.user_id) FILTER (WHERE ptf.is_new_customer)     AS new_users

    FROM partner_transaction_facts ptf
    JOIN partner_config pc ON ptf.partner_name = pc.partner_name
    WHERE ptf.ts >= pc.baseline_date::TIMESTAMPTZ
    GROUP BY ptf.partner_name
)

SELECT
    a.partner_name,
    a.total_spend_gbp,
    a.total_revenue,
    a.total_transactions,
    a.new_transactions,
    a.new_spend_gbp,
    a.new_revenue,
    a.repeat_transactions,
    a.repeat_spend_gbp,
    a.repeat_revenue,
    a.boost_transactions,
    a.boost_spend_gbp,
    a.boost_revenue,
    a.on_yonder_spend,
    a.off_yonder_spend,
    -- Incremental spend = on-Yonder minus off-Yonder (raw delta)
    COALESCE(a.on_yonder_spend, 0) - COALESCE(a.off_yonder_spend, 0) AS incremental_spend,
    a.unique_users,
    a.new_users
FROM aggregated a
;
