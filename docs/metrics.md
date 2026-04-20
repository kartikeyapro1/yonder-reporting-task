# Metrics & KPI Definitions

This document defines every metric surfaced in the Yonder reporting dashboards
and automated partner reports. All monetary values are in **GBP**.

---

## Core Metrics

### Total Spend (GBP)
Sum of transaction amounts in GBP across all settled transactions within the
reporting window.

$$\text{Total Spend} = \sum_{i} \text{trans\_amount\_gbp}_i$$

**Includes:** all settled partner transactions from the baseline date onwards.  
**Excludes:** declined/pending transactions, non-partner spend.

---

### Total Revenue (GBP)
Sum of `revenue_contribution` across settled on-Yonder transactions.
Revenue is always 0 for off-Yonder transactions regardless of model.

$$\text{Total Revenue} = \sum_{i \in \text{on-Yonder}} \text{revenue\_contribution}_i$$

---

### Total Transactions
Count of settled transactions (distinct `transaction_id` rows after cleaning).

---

### Unique Users
Count of distinct `user_id` values in the transaction set.

---

### Average Transaction Value (ATV)

$$\text{ATV} = \frac{\text{Total Spend}}{\text{Total Transactions}}$$

---

## New vs Repeat Customer Metrics

### New Customer Definition
A user is classified as **new** for a given transaction if **all** of the following are true:
1. Their first transaction with that partner is on or after the partner's baseline date.
2. The current transaction **is** that first transaction (i.e. `ts = first_transaction_date`).

All other transactions by that user at that partner are classified as **repeat**.

> A user who made their first Gopuff transaction before 2025-12-01 will always be
> classified as a repeat customer for all Gopuff transactions in the reporting window.

### New Spend / Repeat Spend
Sum of `trans_amount_gbp` for new and repeat transactions respectively.

### New Revenue / Repeat Revenue
Sum of `revenue_contribution` for new and repeat transactions respectively.
Revenue per transaction differs by commercial model (see below).

### New User Rate

$$\text{New User Rate} = \frac{\text{New Users}}{\text{Total Unique Users}}$$

### Repeat Rate

$$\text{Repeat Rate} = \frac{\text{Repeat Transactions}}{\text{Total Transactions}}$$

---

## Incremental Spend

The incremental spend metric quantifies the **uplift in customer spend**
attributable to a partner being listed on the Yonder platform.

$$\text{Incremental Spend} = \text{On-Yonder Spend} - \text{Off-Yonder Spend}$$

**On-Yonder Spend:** total spend in calendar months when the partner had an
active period on Yonder.

**Off-Yonder Spend:** total spend in calendar months when the partner had no
active period on Yonder.

**Interpretation:**
- Positive: customers spent more when the partner was on Yonder.
- Negative: spend was higher in off-Yonder months (may indicate seasonal effects
  or short on-Yonder periods coinciding with low-spend months — interpret with caution).
- Not comparable across partners with different numbers of on/off months.

> This is a **raw delta**, not a controlled experiment. No normalisation for
> number of months or seasonal effects is currently applied.

---

## Boost Metrics

A transaction is flagged as **boost** when a matching record exists in
`experience_visited` with:
- `clean_description` matching the canonical partner name
- `boost_type = 'time_based'`

### Boost Transactions
Count of transactions flagged as boost.

### Boost Spend (GBP)
Sum of spend on boost-flagged transactions.

### Boost Revenue (GBP)
Sum of revenue contribution on boost-flagged transactions.

### Boost Uplift Estimate
Not currently computed. To estimate: compare ATV in boost vs non-boost periods.

---

## Commercial Model Revenue Formulas

Revenue is only earned on **on-Yonder, settled** transactions.

### CPA (Cost Per Acquisition) — FRIVE model
Fixed fee per transaction:
- **New customer transaction:** £20.00
- **Repeat customer transaction:** £12.50

$$\text{Revenue} = \begin{cases} £20 & \text{if new customer} \\ £12.50 & \text{if repeat customer} \end{cases}$$

### % Spend Commission — Gopuff model
Percentage of transaction amount:
- **New customer transaction:** 8% of spend
- **Repeat customer transaction:** 1% of spend

$$\text{Revenue} = \begin{cases} 0.08 \times \text{trans\_amount\_gbp} & \text{if new customer} \\ 0.01 \times \text{trans\_amount\_gbp} & \text{if repeat customer} \end{cases}$$

### Blended Commission
Single percentage applied to all transactions regardless of new/repeat status:

$$\text{Revenue} = \text{blended\_rate} \times \text{trans\_amount\_gbp}$$

### Revenue per User

$$\text{Revenue per User} = \frac{\text{Total Revenue}}{\text{Unique Users}}$$

---

## On/Off Yonder Classification

A transaction is classified as **on Yonder** if the transaction timestamp falls
within a half-open interval `[start_date, end_date)` for that partner in
`partner_active_periods`. If `end_date` is null the period is treated as ongoing.

A **calendar month** is classified as **on Yonder** if any transaction in that
month is on-Yonder. This is consistent with the active period configuration
where periods align to calendar month boundaries.
