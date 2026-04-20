/**
 * POST /api/auth/login — Staff login endpoint
 *
 * In production, this would validate credentials against an identity provider.
 * For development, it accepts any @yonder.com email and sets a session cookie.
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const body = await req.json()
  const { email, password } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  // In production: validate against IdP (Google Workspace, Okta, etc.)
  // For development: accept any @yonder.com email
  const isValid = email.endsWith('@yonder.com') || process.env.REQUIRE_AUTH !== 'true'

  if (!isValid) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }

  const cookieStore = await cookies()
  cookieStore.set('yonder_staff_session', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return NextResponse.json({ ok: true, email })
}
