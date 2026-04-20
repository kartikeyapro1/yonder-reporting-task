-- =============================================================================
-- 10_gopuff_automated_report.sql
--
-- Purpose: Scenario 2 — Gopuff automated partner report query.
-- Output grain: summary row + monthly breakdown for Gopuff from Dec 2025.
--
-- Commercial model: 8% on new spend, 1% on repeat spend.
-- Baseline: December 2025.
-- =============================================================================

WITH gopuff_facts AS (
    SELECT
        ptf.transaction_id,
        ptf.user_id,
        ptf.ts,
        ptf.year_month,
        ptf.trans_amount_gbp,
        ptf.is_new_customer,
        ptf.is_on_yonder,
        ptf.is_boost,
        ptf.boost_type,
        ptf.revenue_contribution
    FROM partner_transaction_facts ptf
    WHERE ptf.partner_name = 'Gopuff'
      AND ptf.ts >= '2025-12-01'
),

-- Monthly rollup
monthly AS (
    SELECT
        gf.year_month,
        COUNT(gf.transaction_id)                                         AS total_transactions,
        ROUND(SUM(gf.trans_amount_gbp), 2)                               AS total_spend_gbp,
        ROUND(SUM(gf.revenue_contribution), 2)                           AS total_revenue,

        COUNT(gf.transaction_id) FILTER (WHERE gf.is_new_customer)       AS new_transactions,
        ROUND(SUM(gf.trans_amount_gbp) FILTER (WHERE gf.is_new_customer), 2) AS new_spend_gbp,
        ROUND(SUM(gf.revenue_contribution) FILTER (WHERE gf.is_new_customer), 2) AS new_revenue,

        COUNT(gf.transaction_id) FILTER (WHERE NOT gf.is_new_customer)   AS repeat_transactions,
        ROUND(SUM(gf.trans_amount_gbp) FILTER (WHERE NOT gf.is_new_customer), 2) AS repeat_spend_gbp,
        ROUND(SUM(gf.revenue_contribution) FILTER (WHERE NOT gf.is_new_customer), 2) AS repeat_revenue,

        COUNT(gf.transaction_id) FILTER (WHERE gf.is_boost)              AS boost_transactions,
        ROUND(SUM(gf.trans_amount_gbp) FILTER (WHERE gf.is_boost), 2)    AS boost_spend_gbp,
        ROUND(SUM(gf.revenue_contribution) FILTER (WHERE gf.is_boost), 2) AS boost_revenue,

        COUNT(DISTINCT gf.user_id)                                       AS unique_users,
        COUNT(DISTINCT gf.user_id) FILTER (WHERE gf.is_new_customer)     AS new_users
    FROM gopuff_facts gf
    GROUP BY gf.year_month
    ORDER BY gf.year_month
),

-- Overall summary
summary AS (
    SELECT
        'Gopuff'                                     AS partner_name,
        '2025-12 onwards'                            AS period,
        SUM(m.total_transactions)                    AS total_transactions,
        SUM(m.total_spend_gbp)                       AS total_spend_gbp,
        SUM(m.total_revenue)                         AS total_revenue,
        SUM(m.new_transactions)                      AS new_transactions,
        SUM(m.new_spend_gbp)                         AS new_spend_gbp,
        SUM(m.new_revenue)                           AS new_revenue,
        SUM(m.repeat_transactions)                   AS repeat_transactions,
        SUM(m.repeat_spend_gbp)                      AS repeat_spend_gbp,
        SUM(m.repeat_revenue)                        AS repeat_revenue,
        SUM(m.boost_transactions)                    AS boost_transactions,
        SUM(m.boost_revenue)                         AS boost_revenue,
        SUM(m.unique_users)                          AS total_unique_users,
        SUM(m.new_users)                             AS total_new_users
    FROM monthly m
)

-- Output summary row first, then monthly detail
SELECT 'SUMMARY' AS row_type, s.* FROM summary s

UNION ALL

SELECT 'MONTHLY' AS row_type, NULL, m.year_month, m.* FROM monthly m
;
