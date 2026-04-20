/**
 * GET /api/partners
 * Returns the internal dashboard partner list with summary KPIs.
 */

import { NextResponse } from 'next/server'
import { requireStaffAuth } from '@/lib/auth'
import { getAllPartnerSummaries } from '@/lib/reporting/partner-report-summary'
import { getPartnerConfig } from '@/lib/config/partner-commercials'
import type { InternalDashboardRow } from '@/lib/types'

export async function GET() {
  const auth = await requireStaffAuth()
  if (auth instanceof NextResponse) return auth

  const summaries = getAllPartnerSummaries()

  const rows: InternalDashboardRow[] = summaries.map(s => {
    const monthly = s.monthly_breakdown
    const last = monthly[monthly.length - 1]
    const secondLast = monthly[monthly.length - 2]

    let trend: 'up' | 'down' | 'flat' = 'flat'
    if (last && secondLast) {
      const delta = last.total_revenue - secondLast.total_revenue
      if (delta > 0) trend = 'up'
      else if (delta < 0) trend = 'down'
    }

    return {
      partner_name: s.partner_name,
      display_name: s.display_name,
      category: getPartnerConfig(s.partner_name)?.category ?? 'Other',
      total_spend_gbp: s.total_spend_gbp,
      total_revenue: s.total_revenue,
      total_transactions: s.total_transactions,
      unique_users: s.unique_users,
      last_active_month: last?.year_month ?? '',
      is_currently_active: last?.is_on_yonder ?? false,
      revenue_trend: trend,
    }
  })

  return NextResponse.json(rows)
}
