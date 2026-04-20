# Assumptions & Limitations

This document records the key assumptions made during the design and
implementation of the Yonder reporting prototype. Each assumption is
flagged where it may affect interpretation of reported metrics.

---

## Data Assumptions

### 1. Settled Transactions Only
Only transactions with `state = 'settled'` are included in all metrics.
Pending, declined, reversed, and refunded transactions are excluded.

**Impact:** Metrics reflect confirmed, completed spend only. If refund rates
are significant this will overstate actual net spend.

### 2. FX Rate Interpretation
When `trans_currency ≠ GBP`, the GBP equivalent is computed as:

```
trans_amount_gbp = trans_amount / fx_rate
```

`fx_rate` is assumed to represent units of foreign currency per 1 GBP
(i.e. `fx_rate = 1.25` means £1 = 1.25 USD, so USD amount / 1.25 = GBP).

**Fallback:** If `fx_rate` is null or zero, `charged_amount` is used as the
GBP equivalent. `charged_amount` is assumed to always be in GBP.

**Impact:** FX conversion accuracy depends on the rate recorded at settlement
time. Multi-currency transactions make up a small proportion of partner spend
(domestic FRIVE/Gopuff transactions are expected to be GBP-only).

### 3. Merchant Name Normalisation
Merchant descriptions from the transaction feed are matched to canonical partner
names using case-insensitive regex patterns defined in `partner-mappings.ts`.

Known patterns for FRIVE: `FRIVE`, `FRIVE LTD`, `THE FRIVE`.  
Known patterns for Gopuff: `GOPUFF`, `GOPUFF*DELIVERY`, `GO PUFF`.

Transactions that do not match any pattern are **discarded** from partner
reporting (they appear in the raw data as non-partner spend).

**Risk:** New merchant description variants not covered by the patterns will be
silently excluded. Monitor `_unknown` transaction counts for data quality checks.

---

## New vs Repeat Customer Assumptions

### 4. New Customer = First Transaction On or After Baseline
A user is "new" for a given partner only if:
- Their first-ever transaction at that partner is on or after the partner's
  `baseline_date`, AND
- The current transaction IS that first transaction.

**Baseline dates:**
- FRIVE: 2025-01-01
- Gopuff: 2025-12-01

### 5. Pre-Baseline Users Are Always Repeat
If a user has a transaction at a partner before the baseline date, they are
treated as an **existing customer** from the very start of the reporting window.
Their first transaction in the reporting window will be classified as **repeat**.

**Rationale:** We cannot claim a CPA "new customer" fee for someone who was
already a customer of the partner before the partnership began.

**Impact:** New customer counts may be understated if many users transacted
with the partner before the Yonder integration went live.

### 6. New/Repeat Is Per Partner
A user can be "new" at FRIVE and simultaneously "repeat" at Gopuff. The
classification is entirely independent per partner.

---

## On/Off Yonder Assumptions

### 7. Active Periods Align to Calendar Month Boundaries
Active period `start_date` and `end_date` are set to the first day of the
relevant month. A period's end is the first day of the next month (half-open
interval `[start_date, end_date)`).

**Example:** FRIVE active in January 2025 → `start_date = 2025-01-01`, `end_date = 2025-02-01`.

### 8. Transaction Timestamp Used for On/Off Lookup
The transaction `timestamp` (settlement time) is compared against active period
intervals to determine on/off status. If settlement occurs after the period ends
(e.g. a late-settling transaction from the final day of an active month), it may
be classified as off-Yonder.

### 9. No Partial-Month Proration
Months are classified as fully on or fully off. If a partner went live mid-month,
all transactions in that month are treated as on-Yonder.

---

## Incremental Spend Assumptions

### 10. Raw Delta, No Seasonal Normalisation
`incremental_spend = on_yonder_spend − off_yonder_spend`

This is a **simple subtraction** of total spend across all on-Yonder months
versus all off-Yonder months. It does NOT:
- Normalise for number of months in each group
- Control for seasonality (December spend vs January spend)
- Account for underlying growth trends in the card network

**Implication:** For FRIVE, where active months alternate irregularly (Jan/Mar/
May/Jul/Oct/Dec on, Feb/Apr/Jun/Aug/Sep/Nov off), seasonal effects may
significantly distort the delta. For a more robust analysis, use a month-
matched comparison or time-series regression.

---

## Boost Assumptions

### 11. Boost Match via experience_visited
A transaction is flagged as "boost" if a record exists in `experience_visited`
with `boost_type = 'time_based'` and the `clean_description` matches the
canonical partner name.

Transactions are matched by `transaction_id`. If no matching record exists in
`experience_visited`, the transaction is treated as non-boost.

**Assumption:** The join between transaction data and experience_visited is
complete — i.e. all boost-triggered transactions have a corresponding record.
If experience_visited is incomplete, boost counts will be understated.

---

## Revenue Assumptions

### 12. Revenue = 0 for Off-Yonder Transactions
No revenue is attributed to any transaction in an off-Yonder period. This reflects
the contractual reality: Yonder only earns fees while the partner is live on the
platform.

### 13. Most-Recent Commercial Model Applies
If a partner has multiple commercial model records with different `effective_from`
dates, the model with the most recent `effective_from` date that is ≤ the
transaction date is applied. Future-dated models are not applied retroactively.

---

## General Caveats

- All data is synthetic. Real transaction volumes and amounts should not be inferred
  from this prototype.
- The reporting window is scoped to 2025. Future reporting periods will require
  updating `partner-periods.ts` (or the equivalent SQL table).
- This prototype does not implement authentication. In a production deployment,
  internal and partner views must be protected by appropriate access controls.
