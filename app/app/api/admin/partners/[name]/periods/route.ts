/**
 * GET /api/admin/partners/[name]/periods — Get active periods for a partner
 * PUT /api/admin/partners/[name]/periods — Replace all active periods for a partner
 *
 * Body for PUT: { periods: PartnerActivePeriod[] }
 */

import { NextResponse } from 'next/server'
import { getActivePeriods, setActivePeriods } from '@/lib/data/config-store'
import type { PartnerActivePeriod } from '@/lib/types'

interface Params {
  params: Promise<{ name: string }>
}

export async function GET(_req: Request, { params }: Params) {
  const { name } = await params
  const decoded = decodeURIComponent(name)
  const periods = getActivePeriods(decoded)
  return NextResponse.json(periods)
}

export async function PUT(req: Request, { params }: Params) {
  const { name } = await params
  const decoded = decodeURIComponent(name)

  try {
    const body = await req.json()
    const periods: PartnerActivePeriod[] = body.periods ?? []

    // Validate each period
    for (const p of periods) {
      if (!p.start_date) {
        return NextResponse.json({ error: 'Each period requires a start_date' }, { status: 400 })
      }
    }

    setActivePeriods(decoded, periods)
    return NextResponse.json({ ok: true, count: periods.length })
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}
