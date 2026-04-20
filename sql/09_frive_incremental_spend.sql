-- =============================================================================
-- 09_frive_incremental_spend.sql
--
-- Purpose: Scenario 1 — FRIVE incremental spend analysis.
-- Output grain: one row per calendar month with on/off flag and spend.
--
-- Shows exactly which months FRIVE was on/off Yonder, the spend in each,
-- and the resulting incremental delta. Suitable for direct partner sharing.
-- =============================================================================

WITH frive_monthly AS (
    SELECT
        pmm.year_month,
        pmm.is_on_yonder,
        pmm.total_transactions,
        pmm.total_spend_gbp,
        pmm.new_transactions,
        pmm.new_spend_gbp,
        pmm.repeat_transactions,
        pmm.repeat_spend_gbp,
        pmm.total_revenue,
        pmm.unique_users
    FROM partner_monthly_metrics pmm
    WHERE pmm.partner_name = 'FRIVE'
      AND pmm.year_month >= '2025-01'  -- FRIVE baseline
    ORDER BY pmm.year_month
),

on_summary AS (
    SELECT
        'on_yonder'                              AS period_type,
        COUNT(year_month)                        AS months_count,
        SUM(total_transactions)                  AS total_transactions,
        SUM(total_spend_gbp)                     AS total_spend,
        SUM(new_transactions)                    AS new_transactions,
        SUM(repeat_transactions)                 AS repeat_transactions,
        SUM(total_revenue)                       AS total_revenue
    FROM frive_monthly
    WHERE is_on_yonder = TRUE
),

off_summary AS (
    SELECT
        'off_yonder'                             AS period_type,
        COUNT(year_month)                        AS months_count,
        SUM(total_transactions)                  AS total_transactions,
        SUM(total_spend_gbp)                     AS total_spend,
        SUM(new_transactions)                    AS new_transactions,
        SUM(repeat_transactions)                 AS repeat_transactions,
        0                                        AS total_revenue   -- no revenue in off periods
    FROM frive_monthly
    WHERE is_on_yonder = FALSE
)

-- Monthly detail
SELECT
    fm.year_month,
    CASE WHEN fm.is_on_yonder THEN 'On Yonder' ELSE 'Off Yonder' END AS yonder_status,
    fm.total_transactions,
    ROUND(fm.total_spend_gbp, 2)        AS total_spend_gbp,
    fm.new_transactions,
    ROUND(fm.new_spend_gbp, 2)          AS new_spend_gbp,
    fm.repeat_transactions,
    ROUND(fm.repeat_spend_gbp, 2)       AS repeat_spend_gbp,
    ROUND(fm.total_revenue, 2)          AS revenue_earned,
    fm.unique_users
FROM frive_monthly fm

UNION ALL

-- Summary: on vs off comparison
SELECT
    'TOTAL — ON YONDER'  AS year_month,
    'Summary'            AS yonder_status,
    os.total_transactions,
    ROUND(os.total_spend, 2),
    os.new_transactions,
    NULL, os.repeat_transactions, NULL,
    ROUND(os.total_revenue, 2),
    NULL
FROM on_summary os

UNION ALL

SELECT
    'TOTAL — OFF YONDER' AS year_month,
    'Summary'            AS yonder_status,
    ofs.total_transactions,
    ROUND(ofs.total_spend, 2),
    ofs.new_transactions,
    NULL, ofs.repeat_transactions, NULL,
    ROUND(ofs.total_revenue, 2),
    NULL
FROM off_summary ofs

UNION ALL

-- Incremental delta row
SELECT
    'INCREMENTAL DELTA'  AS year_month,
    'Delta'              AS yonder_status,
    (SELECT total_transactions FROM on_summary)
      - (SELECT total_transactions FROM off_summary),
    ROUND(
      (SELECT total_spend FROM on_summary)
        - (SELECT total_spend FROM off_summary), 2
    ),
    NULL, NULL, NULL, NULL,
    ROUND((SELECT total_revenue FROM on_summary), 2),
    NULL
;
