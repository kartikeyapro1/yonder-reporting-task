# Architecture Overview

## Data Flow

```
Raw CSV files
  ├── Synthetic - transaction_new.csv
  └── Synthetic - experience_visited.csv
         │
         ▼
  csv-loader.ts          (server-side, fs.readFileSync + PapaParse)
         │
         ▼
  clean-transactions.ts  (filter settled, normalise merchant name, FX → GBP)
         │
         ├──▶ partner-user-first-seen.ts  (per-partner first tx date per user)
         │
         ▼
  partner-transaction-facts.ts
         │    • joins clean transactions with first-seen (new/repeat)
         │    • looks up active periods (on/off Yonder)
         │    • matches experience_visited (boost flag)
         │    • computes revenue_contribution
         │
         ▼
  partner-monthly-metrics.ts   (GROUP BY partner + year_month)
         │
         ▼
  partner-report-summary.ts    (overall rollup + insights text)
         │
   ┌─────┴──────────────┬───────────────┐
   ▼                    ▼               ▼
Internal dashboard  Partner-facing   Automated
   /internal          /partner/[id]    /report/[id]
```

## App Directory Structure

```
app/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout, metadata, global CSS
│   ├── page.tsx                  # Redirects / → /internal
│   ├── globals.css               # Tailwind directives + base styles
│   │
│   ├── internal/                 # Internal Yonder staff views
│   │   ├── page.tsx              # Server Component — loads all partners
│   │   ├── InternalDashboardClient.tsx
│   │   └── partner/[id]/
│   │       ├── page.tsx          # Server Component — loads single partner
│   │       └── InternalPartnerDetailClient.tsx
│   │
│   ├── partner/[id]/             # Partner-facing clean view
│   │   ├── page.tsx
│   │   └── PartnerFacingClient.tsx
│   │
│   ├── report/[id]/              # Automated printable report
│   │   ├── page.tsx
│   │   └── ReportPage.tsx
│   │
│   └── api/
│       └── partners/
│           ├── route.ts          # GET /api/partners
│           └── [id]/route.ts     # GET /api/partners/[id]
│
├── components/
│   ├── ui/
│   │   ├── Card.tsx              # Framer Motion animated card
│   │   ├── KpiCard.tsx           # Gradient KPI metric card
│   │   ├── Badge.tsx             # Status badge
│   │   └── InsightCard.tsx       # Animated insight row
│   ├── charts/
│   │   ├── SpendTrendChart.tsx   # AreaChart — spend/revenue/transactions
│   │   ├── OnOffComparisonChart.tsx # BarChart — on vs off comparison
│   │   └── NewVsExistingChart.tsx   # Stacked BarChart — new/repeat split
│   └── layout/
│       └── Header.tsx            # Sticky frosted-glass navigation header
│
└── lib/
    ├── types.ts                  # All TypeScript interfaces
    ├── config/
    │   ├── partner-mappings.ts   # Merchant name normalisation rules
    │   ├── partner-periods.ts    # Active period config (on/off Yonder)
    │   └── partner-commercials.ts # Commercial model config + revenue calc
    ├── data/
    │   └── csv-loader.ts         # Server-side CSV loader with module cache
    └── reporting/
        ├── clean-transactions.ts
        ├── partner-user-first-seen.ts
        ├── partner-transaction-facts.ts
        ├── partner-monthly-metrics.ts
        └── partner-report-summary.ts
```

## SQL Reporting Layer

The `sql/` folder mirrors the TypeScript reporting layer as production-style
PostgreSQL-compatible SQL views. Each file corresponds to a stage:

> Note: `DISTINCT ON`, `BOOL_OR`, `FILTER (WHERE ...)`, and `SERIAL` are PostgreSQL-specific. BigQuery equivalents would use `QUALIFY ROW_NUMBER()`, `COUNTIF`, and `IDENTITY` columns respectively.

| File | Description |
|------|-------------|
| `01_partner_name_mapping.sql` | Reference table for merchant name → canonical partner |
| `02_partner_active_periods.sql` | Partner on/off Yonder calendar (half-open intervals) |
| `03_partner_commercials.sql` | Commercial model config + effective dates |
| `04_clean_transactions.sql` | Settled transactions normalised to GBP |
| `05_partner_user_first_seen.sql` | First transaction date per (partner, user) |
| `06_partner_transaction_facts.sql` | Enriched facts: on/off, new/repeat, boost, revenue |
| `07_partner_monthly_metrics.sql` | Monthly aggregation per partner |
| `08_partner_report_summary.sql` | Final rolled-up summary per partner |
| `09_frive_incremental_spend.sql` | FRIVE scenario: incremental spend analysis |
| `10_gopuff_automated_report.sql` | Gopuff scenario: % commission automated report |

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS 3.4 with custom design tokens |
| Charts | Recharts 2.x with custom tooltips |
| Animations | Framer Motion 11 |
| CSV parsing | PapaParse 5 (server-side) |
| Runtime | Node.js 24 |

## Design Decisions

**Server Components for data, Client Components for interactivity.**
All data fetching happens in Server Components (`page.tsx`). Interactive
components (charts, filters, tabs) are `'use client'` components that
receive pre-fetched data as props. This keeps the data layer server-only
(no CSV data leaks to the browser bundle).

**Module-level caching.** CSV files are read and parsed once; reporting
computations are cached in module-level `Map` instances. In production,
these would be replaced by a database query with appropriate TTLs.

**Strict TypeScript.** All data shapes are declared in `lib/types.ts`. No
`any` types are used in the reporting layer.
