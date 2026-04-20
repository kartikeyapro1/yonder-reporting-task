/**
 * csv-loader.ts
 *
 * Thin facade over the DataSource interface.
 * All downstream reporting modules import from here — they don't need to
 * know whether data comes from CSV files, BigQuery, or any other store.
 *
 * The active backend is controlled by the DATA_SOURCE env var.
 * See data-source.ts for the full interface.
 */

import { getDataSource } from '@/lib/data/data-source'
import type { RawTransaction, RawExperienceVisited } from '@/lib/types'

export function loadRawTransactions(): RawTransaction[] {
  return getDataSource().loadTransactions()
}

export function loadRawExperiences(): RawExperienceVisited[] {
  return getDataSource().loadExperiences()
}
