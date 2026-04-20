/**
 * partner-mappings.ts
 *
 * Canonical merchant name normalisation.
 * Maps raw merchant_description variants → canonical partner_name.
 *
 * Assumption: we rely on the `_wallet` / `raw_merchant_description` field
 * rather than merchant_description when present, falling back to
 * merchant_description. Matching is case-insensitive on the raw string.
 */

export interface PartnerMappingRule {
  canonical: string
  patterns: RegExp[]
}

export const PARTNER_MAPPING_RULES: PartnerMappingRule[] = [
  {
    canonical: 'FRIVE',
    patterns: [
      /^frive(\s+ltd)?$/i,
      /^the\s+frive$/i,
    ],
  },
  {
    canonical: 'Gopuff',
    patterns: [
      /^gopuff(\*delivery)?$/i,
      /^go\s+puff$/i,
    ],
  },
  {
    canonical: 'Dishoom',
    patterns: [/^dishoom/i],
  },
  {
    canonical: 'Pizza Pilgrims',
    patterns: [/^pizza\s+pilgrims/i],
  },
  {
    canonical: 'Honest Burgers',
    patterns: [/^honest\s+burgers/i],
  },
  {
    canonical: 'Barrafina',
    patterns: [/^barrafina/i],
  },
  {
    canonical: 'Bao',
    patterns: [/^bao\s+soho/i],
  },
  {
    canonical: 'Burger & Lobster',
    patterns: [/^burger\s+&\s+lobster/i],
  },
  {
    canonical: 'Flat Iron',
    patterns: [/^flat\s+iron/i],
  },
  {
    canonical: 'Franco Manca',
    patterns: [/^franco\s+manca/i],
  },
  {
    canonical: 'Gymkhana',
    patterns: [/^gymkhana/i],
  },
  {
    canonical: 'Hoppers',
    patterns: [/^hoppers/i],
  },
  {
    canonical: 'Padella',
    patterns: [/^padella/i],
  },
  {
    canonical: 'The Breakfast Club',
    patterns: [/^the\s+breakfast\s+club/i],
  },
]

/**
 * Normalise a raw merchant description to a canonical partner name.
 * Returns null if no mapping is found (non-partner transaction).
 */
export function normaliseMerchantDescription(raw: string): string | null {
  const trimmed = raw.trim()
  for (const rule of PARTNER_MAPPING_RULES) {
    for (const pattern of rule.patterns) {
      if (pattern.test(trimmed)) return rule.canonical
    }
  }
  return null
}
