/**
 * GET /api/admin/partners/[name]/commercials — Get commercial models
 * PUT /api/admin/partners/[name]/commercials — Replace all commercial models
 *
 * Body for PUT: { commercials: CommercialModel[] }
 */

import { NextResponse } from 'next/server'
import { getPartner, updateCommercials } from '@/lib/data/config-store'
import type { CommercialModel } from '@/lib/types'

interface Params {
  params: Promise<{ name: string }>
}

export async function GET(_req: Request, { params }: Params) {
  const { name } = await params
  const decoded = decodeURIComponent(name)
  const partner = getPartner(decoded)

  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
  }
  return NextResponse.json(partner.commercials)
}

export async function PUT(req: Request, { params }: Params) {
  const { name } = await params
  const decoded = decodeURIComponent(name)

  try {
    const body = await req.json()
    const commercials: CommercialModel[] = body.commercials ?? []

    // Validate each commercial model
    for (const c of commercials) {
      if (!c.type || !c.effective_from) {
        return NextResponse.json(
          { error: 'Each commercial model requires type and effective_from' },
          { status: 400 }
        )
      }
      const validTypes = ['cpa_new_repeat', 'pct_spend_new_repeat', 'blended_commission', 'fixed_fee']
      if (!validTypes.includes(c.type)) {
        return NextResponse.json(
          { error: `Invalid type "${c.type}". Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        )
      }
    }

    updateCommercials(decoded, commercials)
    return NextResponse.json({ ok: true, count: commercials.length })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
