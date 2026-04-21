/**
 * lib/auth/constants.ts
 *
 * Single source of truth for all auth cookie names and secrets used
 * across middleware, API routes, and server utilities.
 *
 * Import from here — never use magic strings elsewhere.
 */

/** HttpOnly cookie set after internal staff password login */
export const COOKIE_INTERNAL = 'yonder_internal'

/** HttpOnly cookie set after redeeming a partner magic link */
export const COOKIE_PARTNER = 'yonder_partner'

/** HttpOnly cookie set after staff email/password login (unused in favour of COOKIE_INTERNAL) */
export const COOKIE_STAFF = 'yonder_staff_session'

/** INTERNAL_SECRET read once at module load. Throws at startup if unset in production. */
export function getInternalSecret(): string {
  const s = process.env.INTERNAL_SECRET
  if (!s && process.env.NODE_ENV === 'production') {
    throw new Error(
      'INTERNAL_SECRET env var is required in production. ' +
      'Set it in Vercel environment variables.'
    )
  }
  // In dev, fall back to empty string — middleware fails closed (no access)
  // until the developer sets INTERNAL_SECRET in .env.local.
  return s ?? ''
}
