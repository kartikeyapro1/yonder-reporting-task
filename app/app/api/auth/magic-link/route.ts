/**
 * POST /api/auth/magic-link
 *
 * Generates a 48-hour HMAC-signed magic link for a partner.
 * Only accessible to internal staff (requires yonder_internal cookie).
 *
 * Request body:  { partnerName: string }
 * Response:      { url: string, expiresIn: string, partner: string }
 */

import { NextRequest, NextResponse } from 'next/server'
import { generateMagicToken } from '@/lib/auth/tokens'
import { PARTNER_CONFIGS } from '@/lib/config/partner-commercials'
import { COOKIE_INTERNAL, getInternalSecret } from '@/lib/auth/constants'

const INTERNAL_SECRET = getInternalSecret()

export async function POST(req: NextRequest) {
  // Only internal staff can generate links
  const internalKey = req.cookies.get(COOKIE_INTERNAL)?.value
  if (internalKey !== INTERNAL_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => null)
  const partnerName = body?.partnerName
  if (!partnerName) {
    return NextResponse.json({ error: 'partnerName is required' }, { status: 400 })
  }

  const config = PARTNER_CONFIGS.find(c => c.partner_name === partnerName)
  if (!config) {
    return NextResponse.json({ error: 'Unknown partner' }, { status: 404 })
  }

  const token = await generateMagicToken(partnerName)
  const baseUrl = req.nextUrl.origin

  return NextResponse.json({
    url: `${baseUrl}/api/auth/access?token=${token}`,
    expiresIn: '48 hours',
    partner: config.display_name,
  })
}
