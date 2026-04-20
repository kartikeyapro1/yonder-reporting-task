/**
 * config-store.ts
 *
 * In-memory config store with JSON file persistence.
 *
 * In development / demo mode, config is seeded from the hardcoded TypeScript
 * constants (partner-commercials, partner-mappings, partner-periods) and any
 * admin-UI edits are persisted to a local JSON file so they survive restarts.
 *
 * In production, this would be replaced by Supabase/BigQuery tables.
 * The DataSource interface (data-source.ts) already supports this swap.
 *
 * File: /data/config.json (auto-created on first write)
 */

import fs from 'fs'
import path from 'path'
import type { PartnerConfig, PartnerActivePeriod, CommercialModel } from '@/lib/types'
import type { PartnerMappingRule } from '@/lib/config/partner-mappings'
import { PARTNER_CONFIGS as SEED_CONFIGS } from '@/lib/config/partner-commercials'
import { PARTNER_MAPPING_RULES as SEED_MAPPINGS } from '@/lib/config/partner-mappings'
import { PARTNER_ACTIVE_PERIODS as SEED_PERIODS } from '@/lib/config/partner-periods'

// ─── Persistence path ────────────────────────────────────────────────────────

const CONFIG_PATH = path.join(process.cwd(), '..', 'data', 'config.json')

interface PersistedConfig {
  partners: PartnerConfig[]
  mappings: SerializedMapping[]
  periods: PartnerActivePeriod[]
  _version: number
}

interface SerializedMapping {
  canonical: string
  patterns: string[] // stored as regex source strings
}

// ─── Store singleton ─────────────────────────────────────────────────────────

let _partners: PartnerConfig[] | null = null
let _mappings: PartnerMappingRule[] | null = null
let _periods: PartnerActivePeriod[] | null = null

function loadFromDisk(): PersistedConfig | null {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const raw = fs.readFileSync(CONFIG_PATH, 'utf-8')
      return JSON.parse(raw) as PersistedConfig
    }
  } catch {
    // Corrupt file — start fresh
  }
  return null
}

function saveToDisk(): void {
  const data: PersistedConfig = {
    partners: _partners ?? SEED_CONFIGS,
    mappings: (_mappings ?? SEED_MAPPINGS).map(m => ({
      canonical: m.canonical,
      patterns: m.patterns.map(p => p.source),
    })),
    periods: _periods ?? SEED_PERIODS,
    _version: 1,
  }
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(data, null, 2), 'utf-8')
}

function hydrateMappings(serialized: SerializedMapping[]): PartnerMappingRule[] {
  return serialized.map(s => ({
    canonical: s.canonical,
    patterns: s.patterns.map(p => new RegExp(p, 'i')),
  }))
}

function ensureLoaded(): void {
  if (_partners) return

  const disk = loadFromDisk()
  if (disk) {
    _partners = disk.partners
    _mappings = hydrateMappings(disk.mappings)
    _periods = disk.periods
  } else {
    // Seed from hardcoded constants + merge active_periods into configs
    _partners = SEED_CONFIGS.map(c => ({
      ...c,
      active_periods: SEED_PERIODS.filter(p => p.partner_name === c.partner_name),
    }))
    _mappings = [...SEED_MAPPINGS]
    _periods = [...SEED_PERIODS]
  }
}

// ─── Partner CRUD ────────────────────────────────────────────────────────────

export function getPartners(): PartnerConfig[] {
  ensureLoaded()
  return _partners!
}

export function getPartner(partnerName: string): PartnerConfig | undefined {
  ensureLoaded()
  return _partners!.find(p => p.partner_name === partnerName)
}

export function upsertPartner(config: PartnerConfig): PartnerConfig {
  ensureLoaded()
  const idx = _partners!.findIndex(p => p.partner_name === config.partner_name)
  if (idx >= 0) {
    _partners![idx] = config
  } else {
    _partners!.push(config)
  }
  saveToDisk()
  return config
}

export function deletePartner(partnerName: string): boolean {
  ensureLoaded()
  const before = _partners!.length
  _partners = _partners!.filter(p => p.partner_name !== partnerName)
  _periods = _periods!.filter(p => p.partner_name !== partnerName)
  if (_partners.length < before) {
    saveToDisk()
    return true
  }
  return false
}

// ─── Active Periods CRUD ─────────────────────────────────────────────────────

export function getActivePeriods(partnerName?: string): PartnerActivePeriod[] {
  ensureLoaded()
  if (partnerName) return _periods!.filter(p => p.partner_name === partnerName)
  return _periods!
}

export function setActivePeriods(partnerName: string, periods: PartnerActivePeriod[]): void {
  ensureLoaded()
  _periods = [
    ..._periods!.filter(p => p.partner_name !== partnerName),
    ...periods.map(p => ({ ...p, partner_name: partnerName })),
  ]
  // Also update the partner config's active_periods array
  const partner = _partners!.find(p => p.partner_name === partnerName)
  if (partner) {
    partner.active_periods = periods
  }
  saveToDisk()
}

// ─── Mappings CRUD ───────────────────────────────────────────────────────────

export function getMappings(): PartnerMappingRule[] {
  ensureLoaded()
  return _mappings!
}

export function setMappings(mappings: PartnerMappingRule[]): void {
  ensureLoaded()
  _mappings = mappings
  saveToDisk()
}

// ─── Commercials helpers ─────────────────────────────────────────────────────

export function updateCommercials(partnerName: string, commercials: CommercialModel[]): void {
  ensureLoaded()
  const partner = _partners!.find(p => p.partner_name === partnerName)
  if (partner) {
    partner.commercials = commercials
    saveToDisk()
  }
}

/**
 * Reset the in-memory cache (forces reload from disk on next access).
 * Useful after external changes or for testing.
 */
export function resetConfigStore(): void {
  _partners = null
  _mappings = null
  _periods = null
}
