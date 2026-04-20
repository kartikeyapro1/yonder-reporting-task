/**
 * csv-source.ts
 *
 * CSV-backed DataSource implementation.
 * Reads from the /data directory at the workspace root (one level above /app).
 * Uses Node.js fs + PapaParse — server-side only.
 *
 * This is the default data source for local development and the demo.
 */

import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import type { DataSource } from '@/lib/data/data-source'
import type { RawTransaction, RawExperienceVisited, PartnerConfig, PartnerActivePeriod } from '@/lib/types'
import type { PartnerMappingRule } from '@/lib/config/partner-mappings'
import { PARTNER_CONFIGS } from '@/lib/config/partner-commercials'
import { PARTNER_MAPPING_RULES } from '@/lib/config/partner-mappings'
import { PARTNER_ACTIVE_PERIODS } from '@/lib/config/partner-periods'

const DATA_DIR = path.join(process.cwd(), '..', 'data')

function readCsv<T>(filename: string): T[] {
  const filePath = path.join(DATA_DIR, filename)
  const content = fs.readFileSync(filePath, 'utf-8')
  const result = Papa.parse<T>(content, {
    header: true,
    skipEmptyLines: true,
  })
  return result.data
}

export class CsvDataSource implements DataSource {
  readonly name = 'csv'

  private _transactions: RawTransaction[] | null = null
  private _experiences: RawExperienceVisited[] | null = null

  loadTransactions(): RawTransaction[] {
    if (!this._transactions) {
      this._transactions = readCsv<RawTransaction>('Synthetic - transaction_new.csv')
    }
    return this._transactions
  }

  loadExperiences(): RawExperienceVisited[] {
    if (!this._experiences) {
      this._experiences = readCsv<RawExperienceVisited>('Synthetic - experience_visited.csv')
    }
    return this._experiences
  }

  loadPartnerConfigs(): PartnerConfig[] {
    return PARTNER_CONFIGS
  }

  loadPartnerMappings(): PartnerMappingRule[] {
    return PARTNER_MAPPING_RULES
  }

  loadActivePeriods(): PartnerActivePeriod[] {
    return PARTNER_ACTIVE_PERIODS
  }
}
