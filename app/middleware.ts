/**
 * middleware.ts
 *
 * Next.js middleware for route-level authentication.
 *
 * Runs on every request matching the configured paths.
 * When REQUIRE_AUTH=true:
 * - /internal/* routes redirect to /login if no staff session
 * - /api/admin/* returns 401 if no staff session
 * - /partner/* routes are token-gated (token is in the URL)
 *
 * When REQUIRE_AUTH is not set (default for development),
 * all routes are accessible without authentication.
 */

import { NextRequest, NextResponse } from 'next/server'
import { checkRouteAuth } from '@/lib/auth'

export function middleware(req: NextRequest) {
  const authResponse = checkRouteAuth(req)
  if (authResponse) return authResponse
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/internal/:path*',
    '/api/admin/:path*',
  ],
}
