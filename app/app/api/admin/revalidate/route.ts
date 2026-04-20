/**
 * POST /api/admin/revalidate
 *
 * On-demand cache revalidation for partner report pages.
 * Call after updating partner config, importing new data, or triggering a report run.
 *
 * Body (all optional):
 *   { token?: string }  — revalidate a specific partner by token, or all if omitted
 *
 * Requires staff authentication.
 */

import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { requireStaffAuth } from '@/lib/auth'
import { PARTNER_CONFIGS } from '@/lib/config/partner-commercials'

export async function POST(req: Request) {
  const auth = await requireStaffAuth()
  if (auth instanceof NextResponse) return auth

  const body = await req.json().catch(() => ({}))
  const { token } = body as { token?: string }

  const revalidated: string[] = []

  if (token) {
    const partner = PARTNER_CONFIGS.find(c => c.partner_token === token)
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }
    revalidatePath(`/partner/${token}`)
    revalidatePath(`/report/${token}`)
    revalidated.push(partner.display_name)
  } else {
    // Revalidate all partner pages
    for (const p of PARTNER_CONFIGS) {
      revalidatePath(`/partner/${p.partner_token}`)
      revalidatePath(`/report/${p.partner_token}`)
      revalidated.push(p.display_name)
    }
    // Also revalidate the internal dashboard
    revalidatePath('/internal')
  }

  return NextResponse.json({
    revalidated,
    timestamp: new Date().toISOString(),
  })
}
