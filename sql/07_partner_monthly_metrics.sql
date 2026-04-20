-- =============================================================================
-- 07_partner_monthly_metrics.sql
--
-- Purpose: Aggregate transaction facts into monthly metrics per partner.
-- Output grain: one row per (partner_name, year_month).
--
-- This is the primary metrics table consumed by dashboards and reports.
-- =============================================================================

CREATE OR REPLACE VIEW partner_monthly_metrics AS
SELECT
    ptf.partner_name,
    ptf.year_month,
    -- Month is "on Yonder" if any transaction in it has is_on_yonder = TRUE
    BOOL_OR(ptf.is_on_yonder)                              AS is_on_yonder,

    -- Volume
    COUNT(ptf.transaction_id)                              AS total_transactions,
    SUM(ptf.trans_amount_gbp)                              AS total_spend_gbp,

    -- New vs repeat split
    COUNT(ptf.transaction_id) FILTER (WHERE ptf.is_new_customer)   AS new_transactions,
    SUM(ptf.trans_amount_gbp) FILTER (WHERE ptf.is_new_customer)   AS new_spend_gbp,
    COUNT(ptf.transaction_id) FILTER (WHERE NOT ptf.is_new_customer) AS repeat_transactions,
    SUM(ptf.trans_amount_gbp) FILTER (WHERE NOT ptf.is_new_customer) AS repeat_spend_gbp,

    -- Boost
    COUNT(ptf.transaction_id) FILTER (WHERE ptf.is_boost)  AS boost_transactions,
    SUM(ptf.trans_amount_gbp) FILTER (WHERE ptf.is_boost)  AS boost_spend_gbp,
    SUM(ptf.revenue_contribution) FILTER (WHERE ptf.is_boost) AS boost_revenue,

    -- Revenue
    SUM(ptf.revenue_contribution)                          AS total_revenue,
    SUM(ptf.revenue_contribution) FILTER (WHERE ptf.is_new_customer)    AS new_revenue,
    SUM(ptf.revenue_contribution) FILTER (WHERE NOT ptf.is_new_customer) AS repeat_revenue,

    -- Users
    COUNT(DISTINCT ptf.user_id)                            AS unique_users,
    COUNT(DISTINCT ptf.user_id) FILTER (WHERE ptf.is_new_customer) AS new_users

FROM partner_transaction_facts ptf
GROUP BY
    ptf.partner_name,
    ptf.year_month
ORDER BY
    ptf.partner_name,
    ptf.year_month
;
