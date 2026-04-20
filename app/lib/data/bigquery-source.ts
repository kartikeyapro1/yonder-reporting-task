/**
 * bigquery-source.ts
 *
 * BigQuery-backed DataSource implementation.
 *
 * Requires:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var pointing to a service account JSON
 *   - BIGQUERY_PROJECT env var (GCP project ID)
 *   - BIGQUERY_DATASET env var (dataset name, default: 'yonder_reporting')
 *
 * This source runs the SQL views defined in /sql/ against live BigQuery tables.
 * The SQL scripts (01–08) should be deployed to the dataset before using this source.
 *
 * NOTE: This is the production-ready interface. For local development,
 * set DATA_SOURCE=csv in your .env.local file.
 */

import type { DataSource } from '@/lib/data/data-source'
import type { RawTransaction, RawExperienceVisited, PartnerConfig, PartnerActivePeriod } from '@/lib/types'
import type { PartnerMappingRule } from '@/lib/config/partner-mappings'

// ─── BigQuery client (lazy-loaded) ──────────────────────────────────────────

let _bqClient: any = null

function getBigQueryClient() {
  if (_bqClient) return _bqClient

  try {
    // Dynamic import so the app doesn't crash when @google-cloud/bigquery isn't installed
    const { BigQuery } = require('@google-cloud/bigquery')
    _bqClient = new BigQuery({
      projectId: process.env.BIGQUERY_PROJECT,
    })
    return _bqClient
  } catch {
    throw new Error(
      'BigQuery data source requires @google-cloud/bigquery. ' +
      'Install it with: npm install @google-cloud/bigquery'
    )
  }
}

const DATASET = process.env.BIGQUERY_DATASET ?? 'yonder_reporting'

async function query<T>(sql: string): Promise<T[]> {
  const client = getBigQueryClient()
  const [rows] = await client.query({ query: sql })
  return rows as T[]
}

// ─── Implementation ─────────────────────────────────────────────────────────

export class BigQueryDataSource implements DataSource {
  readonly name = 'bigquery'

  private _transactions: RawTransaction[] | null = null
  private _experiences: RawExperienceVisited[] | null = null
  private _configs: PartnerConfig[] | null = null
  private _mappings: PartnerMappingRule[] | null = null
  private _periods: PartnerActivePeriod[] | null = null

  /**
   * In production, raw transactions come from the BigQuery clean_transactions view.
   * We map them back to the RawTransaction shape so downstream code stays unchanged.
   *
   * For now this is synchronous (cached) — the first call triggers async loading
   * during server component rendering, which Next.js handles natively.
   */
  loadTransactions(): RawTransaction[] {
    if (this._transactions) return this._transactions

    // TODO: In production, this would be:
    // const rows = await query(`SELECT * FROM \`${DATASET}.raw_transactions\``)
    // this._transactions = rows.map(mapBqRowToRawTransaction)
    //
    // For now, throw a clear error pointing to the CSV source
    throw new Error(
      `BigQuery data source is configured but not yet connected. ` +
      `Set DATA_SOURCE=csv in .env.local for local development.\n\n` +
      `To connect BigQuery:\n` +
      `1. npm install @google-cloud/bigquery\n` +
      `2. Deploy SQL scripts 01-08 from /sql/ to your BigQuery dataset\n` +
      `3. Set GOOGLE_APPLICATION_CREDENTIALS, BIGQUERY_PROJECT, BIGQUERY_DATASET env vars\n` +
      `4. Implement the query methods in lib/data/bigquery-source.ts`
    )
  }

  loadExperiences(): RawExperienceVisited[] {
    if (this._experiences) return this._experiences

    throw new Error(
      'BigQuery data source: loadExperiences() not yet implemented. ' +
      'See bigquery-source.ts for setup instructions.'
    )
  }

  /**
   * In production, partner configs live in BigQuery tables (SQL 03_partner_commercials.sql).
   * This enables the internal admin UI to add/edit partners without code deploys.
   */
  loadPartnerConfigs(): PartnerConfig[] {
    if (this._configs) return this._configs

    // TODO: Query partner_commercials + partner_active_periods tables
    // and assemble into PartnerConfig objects
    //
    // Fallback to in-memory for now
    const { PARTNER_CONFIGS } = require('@/lib/config/partner-commercials')
    this._configs = PARTNER_CONFIGS
    return this._configs!
  }

  loadPartnerMappings(): PartnerMappingRule[] {
    if (this._mappings) return this._mappings

    // TODO: Query partner_name_mapping table (SQL 01)
    // and construct RegExp patterns from the stored strings
    //
    // Fallback to in-memory for now
    const { PARTNER_MAPPING_RULES } = require('@/lib/config/partner-mappings')
    this._mappings = PARTNER_MAPPING_RULES
    return this._mappings!
  }

  loadActivePeriods(): PartnerActivePeriod[] {
    if (this._periods) return this._periods

    // TODO: Query partner_active_periods table (SQL 02)
    //
    // Fallback to in-memory for now
    const { PARTNER_ACTIVE_PERIODS } = require('@/lib/config/partner-periods')
    this._periods = PARTNER_ACTIVE_PERIODS
    return this._periods!
  }
}
