/**
 * data-source.ts
 *
 * Abstract data source interface for the Yonder reporting pipeline.
 *
 * The pipeline is data-source agnostic: it only cares that raw transactions
 * and experience-visited records are provided in the canonical shapes.
 * Concrete implementations can read from CSV files (development/demo),
 * BigQuery (production), Supabase, or any other backing store.
 *
 * Usage:
 *   import { getDataSource } from '@/lib/data/data-source'
 *   const ds = getDataSource()
 *   const txns = ds.loadTransactions()
 *
 * The active implementation is selected via the DATA_SOURCE env var:
 *   DATA_SOURCE=csv      → CsvDataSource  (default)
 *   DATA_SOURCE=bigquery → BigQueryDataSource (requires credentials)
 */

import type { RawTransaction, RawExperienceVisited, PartnerConfig, PartnerActivePeriod } from '@/lib/types'
import type { PartnerMappingRule } from '@/lib/config/partner-mappings'

// ─── Interface ─────────────────────────────────────────────────────────────

export interface DataSource {
  /** Unique identifier for this data source (e.g. 'csv', 'bigquery'). */
  readonly name: string

  // ── Raw data ────────────────────────────────────────
  /** Load all raw transaction records. */
  loadTransactions(): RawTransaction[]

  /** Load all raw experience-visited records. */
  loadExperiences(): RawExperienceVisited[]

  // ── Config data (optionally externalised) ───────────
  /** Load partner configs. Falls back to in-memory defaults if not overridden. */
  loadPartnerConfigs(): PartnerConfig[]

  /** Load partner name mapping rules. Falls back to in-memory defaults. */
  loadPartnerMappings(): PartnerMappingRule[]

  /** Load partner active periods. Falls back to in-memory defaults. */
  loadActivePeriods(): PartnerActivePeriod[]
}

// ─── Singleton registry ─────────────────────────────────────────────────────

let _instance: DataSource | null = null

/**
 * Returns the active DataSource singleton.
 * Selects implementation based on process.env.DATA_SOURCE.
 */
export function getDataSource(): DataSource {
  if (_instance) return _instance

  const backend = process.env.DATA_SOURCE ?? 'csv'

  switch (backend) {
    case 'bigquery':
      // Lazy import to avoid bundling BQ client when not needed
      const { BigQueryDataSource } = require('@/lib/data/bigquery-source')
      _instance = new BigQueryDataSource()
      break

    case 'csv':
    default:
      const { CsvDataSource } = require('@/lib/data/csv-source')
      _instance = new CsvDataSource()
      break
  }

  return _instance!
}

/**
 * Reset the singleton (useful for testing or hot-reload).
 */
export function resetDataSource(): void {
  _instance = null
}
