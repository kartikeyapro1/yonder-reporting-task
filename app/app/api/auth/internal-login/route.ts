/**
 * POST /api/auth/internal-login
 *
 * Validates the internal password and sets a HttpOnly session cookie.
 * The password is compared against INTERNAL_SECRET env var.
 *
 * Request body:  { password: string }
 * Response:      { ok: true } on success, { error: string } on failure
 */

import { NextRequest, NextResponse } from 'next/server'

const INTERNAL_SECRET = process.env.INTERNAL_SECRET
if (!INTERNAL_SECRET) {
  throw new Error(
    'INTERNAL_SECRET env var is required. ' +
    'Set it in .env.local (dev) or Vercel environment variables (prod).'
  )
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const { password } = body ?? {}

  if (!password || password !== INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  }

  const isSecure = req.nextUrl.protocol === 'https:'
  const response = NextResponse.json({ ok: true })

  response.cookies.set('yonder_internal', INTERNAL_SECRET!, {
    httpOnly: true,
    sameSite: 'strict',
    secure: isSecure,
    path: '/',
    maxAge: 8 * 60 * 60, // 8-hour session
  })

  return response
}
