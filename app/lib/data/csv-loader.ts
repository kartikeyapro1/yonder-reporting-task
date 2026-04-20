/**
 * csv-loader.ts
 *
 * Server-side CSV loading utilities.
 * Reads from the /data directory at the workspace root (one level above /app).
 * Uses Node.js fs — only call these from Server Components or API routes.
 */

import fs from 'fs'
import path from 'path'
import Papa from 'papaparse'
import type { RawTransaction, RawExperienceVisited } from '@/lib/types'

// The data directory lives at ../data relative to /app
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

let _transactions: RawTransaction[] | null = null
let _experiences: RawExperienceVisited[] | null = null

export function loadRawTransactions(): RawTransaction[] {
  if (!_transactions) {
    _transactions = readCsv<RawTransaction>('Synthetic - transaction_new.csv')
  }
  return _transactions
}

export function loadRawExperiences(): RawExperienceVisited[] {
  if (!_experiences) {
    _experiences = readCsv<RawExperienceVisited>('Synthetic - experience_visited.csv')
  }
  return _experiences
}
