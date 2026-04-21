# Yonder Reporting Platform

Internal analytics and partner-facing reporting platform for Yonder.

---

## Quick Start

```bash
cd app
npm install
npm run dev
```

App runs at **http://localhost:3000**.

---

## Environment Setup

Create `app/.env.local` with the following (copy-paste ready for local dev):

```env
# ─── Data Source ─────────────────────────────────────
# csv      = local CSV files in /data (default, no extra config needed)
# bigquery = Google BigQuery (requires credentials below)
DATA_SOURCE=csv

# ─── BigQuery (only needed when DATA_SOURCE=bigquery) ─
# GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
# BIGQUERY_PROJECT=your-gcp-project-id
# BIGQUERY_DATASET=yonder_reporting

# ─── Auth ─────────────────────────────────────────────
# Password for the internal dashboard. Must match on both server and middleware.
INTERNAL_SECRET=yonder2025
```

> **Important:** `INTERNAL_SECRET` must be set in `.env.local` for the internal login to work. The middleware defaults to an empty string (fail-closed) so without this env var, login will always fail.

---

## Credentials & Access

### Internal Dashboard (`/internal-login`)

| Field    | Value        |
|----------|--------------|
| Password | `yonder2025` |

Session cookie lasts **8 hours**. After login you are redirected to `/internal`.

### Partner-Facing Pages

Partners access their dashboards via magic-link tokens — no password required.

| Partner  | Token          | URL                              |
|----------|----------------|----------------------------------|
| Frive    | `f8a2d1e94c37` | `/partner/f8a2d1e94c37`         |
| Gopuff   | `4b7c3f2a8e51` | `/partner/4b7c3f2a8e51`         |

Report pages mirror the same token structure: `/report/f8a2d1e94c37`.

Internal staff (anyone with a valid `yonder_internal` cookie) can bypass partner auth and preview any partner page directly.

---

## Project Structure

```
/
├── app/                    # Next.js 15 app (the runnable application)
│   ├── app/                # Next.js App Router pages & API routes
│   │   ├── internal/       # Staff dashboard (auth-gated)
│   │   ├── internal-login/ # Staff login page
│   │   ├── partner/[id]/   # Partner-facing dashboard
│   │   ├── report/[id]/    # Printable partner report
│   │   └── api/auth/       # Login & magic-link API routes
│   ├── components/         # UI components (charts, cards, brand)
│   ├── lib/                # Data pipeline, reporting logic, config
│   │   ├── config/         # Partner mappings, commercials, periods
│   │   ├── data/           # CSV / BigQuery data sources
│   │   └── reporting/      # Metric calculation logic
│   └── .env.local          # Local env vars (not committed)
├── data/                   # Synthetic CSV data files
├── docs/                   # Architecture, assumptions, metrics docs
└── sql/                    # Reference SQL queries mirroring the TS pipeline
```

---

## Available Scripts

All commands run from the `app/` directory.

| Command         | Description                        |
|-----------------|------------------------------------|
| `npm run dev`   | Start dev server with Turbopack    |
| `npm run build` | Production build                   |
| `npm start`     | Start production server            |
| `npm run lint`  | Run ESLint                         |
| `npm run clean` | Delete `.next` build cache         |

---

## Data Sources

### CSV (default)

Place CSV files in `/data/`. The app expects:

- `Synthetic - transaction_new.csv` — transaction records
- `Synthetic - experience_visited.csv` — visit/experience records

No additional config needed; set `DATA_SOURCE=csv` (or omit — it's the default).

### BigQuery

Set `DATA_SOURCE=bigquery` and provide:

```env
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
BIGQUERY_PROJECT=your-gcp-project-id
BIGQUERY_DATASET=yonder_reporting
```

The service account needs `bigquery.dataViewer` on the dataset.

---

## Commercial Models

Revenue calculations are driven by `app/lib/config/partner-commercials.ts`.

| Partner | Model              | New Rate       | Repeat Rate    |
|---------|--------------------|----------------|----------------|
| Frive   | CPA (per visit)    | £20.00 / visit | £12.50 / visit |
| Gopuff  | % of spend         | 8% of spend    | 1% of spend    |

Revenue is only earned on **on-Yonder** transactions (`is_on_yonder = true`). Off-Yonder transactions appear in spend analytics but contribute £0 revenue.

---

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS, Recharts, Framer Motion
- **Data:** PapaParse (CSV) / Google BigQuery
- **Auth:** Cookie-based (HttpOnly, no third-party auth service)
- **Deployment:** Vercel (see `app/vercel.json`)
