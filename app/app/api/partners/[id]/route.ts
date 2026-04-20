/**
 * GET /api/partners/[id]
 * Returns full report summary for a single partner (by canonical name slug).
 */

import { NextResponse } from 'next/server'
import { getPartnerReportSummary } from '@/lib/reporting/partner-report-summary'
import { PARTNER_CONFIGS } from '@/lib/config/partner-commercials'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params

  // Find partner by slug (lowercased name)
  const config = PARTNER_CONFIGS.find(
    c => c.partner_name.toLowerCase().replace(/\s+/g, '-') === id
  )

  if (!config) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
  }

  const summary = getPartnerReportSummary(config.partner_name)
  if (!summary) {
    return NextResponse.json({ error: 'No data for partner' }, { status: 404 })
  }

  return NextResponse.json(summary)
}
