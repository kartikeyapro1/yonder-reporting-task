/**
 * POST /api/auth/logout — Clear staff session cookie
 */

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('yonder_staff_session')
  return NextResponse.json({ ok: true })
}
