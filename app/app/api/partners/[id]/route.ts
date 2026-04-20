/**
 * GET /api/partners/[id]
 * Returns full report summary for a single partner (by canonical name slug).
 */

import { NextResponse } from 'next/server'
import { requireStaffAuth } from '@/lib/auth'
import { getPartnerReportSummary } from '@/lib/reporting/partner-report-summary'
import { getPartnerBySlug } from '@/lib/config/partner-commercials'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: Params) {
  const auth = await requireStaffAuth()
  if (auth instanceof NextResponse) return auth

  const { id } = await params

  const config = getPartnerBySlug(id)

  if (!config) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
  }

  const summary = getPartnerReportSummary(config.partner_name)
  if (!summary) {
    return NextResponse.json({ error: 'No data for partner' }, { status: 404 })
  }

  return NextResponse.json(summary)
}
