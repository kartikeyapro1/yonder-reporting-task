/**
 * lib/utils/format.ts
 *
 * Shared formatting utilities used across server and client code.
 * All functions are pure and side-effect free.
 */

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

/**
 * Format a GBP amount compactly: £1.2k, £3.4m, £99
 */
export function fmtGbp(n: number): string {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}m`
  if (n >= 1_000) return `£${(n / 1_000).toFixed(1)}k`
  return `£${n.toFixed(0)}`
}

/**
 * Format a GBP amount with full locale string: £1,234
 */
export function fmtGbpFull(n: number): string {
  return `£${n.toLocaleString('en-GB', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

/**
 * Format a number compactly: 1.2k, 3.4m, 99
 */
export function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}m`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`
  return n.toLocaleString()
}

/**
 * Format a "YYYY-MM" string as a human month label: "Jan 2025"
 */
export function fmtMonthLabel(ym: string): string {
  if (!ym) return '—'
  const [y, m] = ym.split('-')
  return `${MONTH_NAMES[parseInt(m) - 1]} ${y}`
}

/**
 * Format a percentage: fmtPct(3, 10) → "30%"
 */
export function fmtPct(numerator: number, denominator: number): string {
  if (denominator === 0) return '0%'
  return `${((numerator / denominator) * 100).toFixed(0)}%`
}
