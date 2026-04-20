/**
 * auth.ts
 *
 * Authentication & authorization utilities for the Yonder reporting platform.
 *
 * Architecture:
 * - Internal routes (/internal/*) require staff authentication
 * - Partner routes (/partner/[token]) validate partner tokens
 * - Admin routes (/api/admin/*) require staff authentication
 * - Public report routes (/report/[token]) are token-gated (no login)
 *
 * In production, integrate with:
 * - NextAuth.js with Yonder's identity provider (Google Workspace SSO, etc.)
 * - Or Supabase Auth for both staff and partner portals
 *
 * For now, this provides a lightweight token-based system:
 * - Staff: checked via STAFF_SECRET cookie or Authorization header
 * - Partners: validated via the partner_token in the URL
 */

import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getPartnerByToken } from '@/lib/config/partner-commercials'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AuthSession {
  type: 'staff' | 'partner'
  /** For staff: email or identifier. For partner: partner_name. */
  identity: string
}

// ─── Staff auth ──────────────────────────────────────────────────────────────

const STAFF_COOKIE = 'yonder_staff_session'

/**
 * Check if the current request has a valid staff session.
 * In production, this would validate a JWT or session cookie against the IdP.
 *
 * For development: any value in the cookie is treated as a valid staff session.
 * Set REQUIRE_AUTH=false in .env.local to bypass auth entirely (default for dev).
 */
export async function getStaffSession(): Promise<AuthSession | null> {
  // In development, auth is optional unless REQUIRE_AUTH=true
  if (process.env.REQUIRE_AUTH !== 'true') {
    return { type: 'staff', identity: 'dev@yonder.com' }
  }

  const cookieStore = await cookies()
  const session = cookieStore.get(STAFF_COOKIE)
  if (session?.value) {
    return { type: 'staff', identity: session.value }
  }

  return null
}

/**
 * Require staff authentication — returns 401 if not authenticated.
 * Use in API route handlers.
 */
export async function requireStaffAuth(): Promise<AuthSession | NextResponse> {
  const session = await getStaffSession()
  if (!session) {
    return NextResponse.json(
      { error: 'Authentication required. Staff login needed.' },
      { status: 401 }
    )
  }
  return session
}

// ─── Partner auth ────────────────────────────────────────────────────────────

const PARTNER_COOKIE = 'yonder_partner_session'

/**
 * Validate a partner token and return the session.
 * Partner tokens are the opaque IDs used in /partner/[token] URLs.
 */
export function validatePartnerToken(token: string): AuthSession | null {
  const config = getPartnerByToken(token)
  if (!config) return null
  return { type: 'partner', identity: config.partner_name }
}

/**
 * Get the current partner session from cookies.
 * Used for the partner self-serve portal where they log in once.
 */
export async function getPartnerSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies()
  const session = cookieStore.get(PARTNER_COOKIE)
  if (session?.value) {
    // Validate the stored token is still valid
    return validatePartnerToken(session.value)
  }
  return null
}

// ─── Middleware helper ───────────────────────────────────────────────────────

/**
 * Route protection logic used by Next.js middleware.
 * Returns null if the request should proceed, or a Response to return.
 */
export function checkRouteAuth(req: NextRequest): NextResponse | null {
  const path = req.nextUrl.pathname

  // Skip auth check if REQUIRE_AUTH is not enabled
  if (process.env.REQUIRE_AUTH !== 'true') return null

  // Internal routes require staff session
  if (path.startsWith('/internal')) {
    const session = req.cookies.get(STAFF_COOKIE)
    if (!session?.value) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', path)
      return NextResponse.redirect(loginUrl)
    }
  }

  // Admin API routes require staff session
  if (path.startsWith('/api/admin')) {
    const session = req.cookies.get(STAFF_COOKIE)
    if (!session?.value) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
  }

  return null
}
