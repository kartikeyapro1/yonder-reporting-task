/**
 * GET /api/auth/access?token=<magic_token>
 *
 * Redeems a magic link token. On success:
 * - Sets a HttpOnly yonder_partner cookie scoped to the partner's token
 * - Redirects to the partner's /partner/[token] page
 *
 * On failure (invalid / expired token):
 * - Redirects to /access/denied
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifyMagicToken } from '@/lib/auth/tokens'
import { PARTNER_CONFIGS } from '@/lib/config/partner-commercials'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return NextResponse.redirect(new URL('/access/denied', req.url))
  }

  const payload = await verifyMagicToken(token)
  if (!payload) {
    return NextResponse.redirect(new URL('/access/denied', req.url))
  }

  const config = PARTNER_CONFIGS.find(c => c.partner_name === payload.partner)
  if (!config) {
    return NextResponse.redirect(new URL('/access/denied', req.url))
  }

  const isSecure = req.nextUrl.protocol === 'https:'
  const destination = new URL(`/partner/${config.partner_token}`, req.url)

  const response = NextResponse.redirect(destination)
  response.cookies.set('yonder_partner', config.partner_token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    path: '/',
    maxAge: 48 * 60 * 60, // 48 hours — matches token expiry
  })
  return response
}
