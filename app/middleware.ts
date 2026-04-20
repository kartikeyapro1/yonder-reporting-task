/**
 * middleware.ts
 *
 * Route-level authentication for the Yonder reporting platform.
 *
 * Guards:
 * - /internal/*  — require yonder_internal cookie (set via /internal-login)
 * - /partner/*   — require yonder_partner cookie matching the URL token
 *                  (set when redeeming a magic link via /api/auth/access)
 * - /report/*    — same partner cookie check as /partner/*
 *
 * Internal staff (yonder_internal cookie) can bypass partner route guards
 * so they can preview any partner page from the dashboard.
 *
 * No secrets are read in middleware — only cookie values are compared.
 * Secret validation happens in the API route handlers.
 */

import { NextRequest, NextResponse } from 'next/server'

// Intentionally no fallback — an unset secret means no cookie will ever match,
// so auth fails closed rather than open with a known default value.
// Set INTERNAL_SECRET in .env.local (dev) or Vercel env vars (prod).
const INTERNAL_SECRET = process.env.INTERNAL_SECRET ?? ''
const COOKIE_INTERNAL = 'yonder_internal'
const COOKIE_PARTNER  = 'yonder_partner'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── Internal dashboard ──────────────────────────────────────────────
  if (pathname.startsWith('/internal')) {
    const key = req.cookies.get(COOKIE_INTERNAL)?.value
    if (key !== INTERNAL_SECRET) {
      const url = req.nextUrl.clone()
      url.pathname = '/internal-login'
      url.searchParams.set('next', pathname)
      return NextResponse.redirect(url)
    }
    return NextResponse.next()
  }

  // ── Partner-facing routes ──────────────────────────────────────────
  if (pathname.startsWith('/partner/') || pathname.startsWith('/report/')) {
    // Internal staff can preview any partner page
    const internalKey = req.cookies.get(COOKIE_INTERNAL)?.value
    if (internalKey === INTERNAL_SECRET) return NextResponse.next()

    const tokenFromPath = pathname.split('/')[2]
    if (!tokenFromPath) return NextResponse.next()

    const partnerToken = req.cookies.get(COOKIE_PARTNER)?.value

    if (!partnerToken) {
      const url = req.nextUrl.clone()
      url.pathname = '/access/needed'
      return NextResponse.redirect(url)
    }

    if (partnerToken !== tokenFromPath) {
      const url = req.nextUrl.clone()
      url.pathname = '/access/denied'
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/internal/:path*',
    '/partner/:path*',
    '/report/:path*',
  ],
}

