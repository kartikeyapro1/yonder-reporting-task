import { unstable_cache } from 'next/cache'
import { Header } from '@/components/layout/Header'
import { InternalDashboardClient } from './InternalDashboardClient'
import { getAllPartnerSummaries } from '@/lib/reporting/partner-report-summary'
import { getPartnerConfig } from '@/lib/config/partner-commercials'
import { isOnYonder } from '@/lib/config/partner-periods'
import type { Metadata } from 'next'
import type { InternalDashboardRow } from '@/lib/types'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Partner Analytics',
}

/**
 * Cache the full summary computation for 1 hour across requests.
 * On Vercel this uses the Data Cache (CDN-backed, survives Lambda restarts).
 * Invalidate via: revalidateTag('partner-data') from an API route.
 */
const getCachedSummaries = unstable_cache(
  async () => getAllPartnerSummaries(),
  ['all-partner-summaries'],
  { revalidate: 3600, tags: ['partner-data'] }
)

export default async function InternalDashboardPage() {
  const summaries = await getCachedSummaries()

  // Current calendar month for determining active status
  const now = new Date()
  const currentMonth = now.toISOString().slice(0, 7) // "YYYY-MM"

  const rows: InternalDashboardRow[] = summaries.map(s => {
    const monthly = s.monthly_breakdown
    const last = monthly[monthly.length - 1]
    const secondLast = monthly[monthly.length - 2]

    let trend: 'up' | 'down' | 'flat' = 'flat'
    if (last && secondLast) {
      const delta = last.total_revenue - secondLast.total_revenue
      if (Math.abs(delta) < 0.01) trend = 'flat'
      else trend = delta > 0 ? 'up' : 'down'
    }

    // Check against current calendar, not last data month
    const isActive = isOnYonder(s.partner_name, new Date(`${currentMonth}-15`))

    return {
      partner_name: s.partner_name,
      display_name: s.display_name,
      category: getPartnerConfig(s.partner_name)?.category ?? 'Other',
      total_spend_gbp: s.total_spend_gbp,
      total_revenue: s.total_revenue,
      total_transactions: s.total_transactions,
      unique_users: s.unique_users,
      last_active_month: last?.year_month ?? '',
      is_currently_active: isActive,
      revenue_trend: trend,
    }
  })

  const totalSpend = rows.reduce((s, r) => s + r.total_spend_gbp, 0)
  const totalRevenue = rows.reduce((s, r) => s + r.total_revenue, 0)
  const totalTx = rows.reduce((s, r) => s + r.total_transactions, 0)
  // Note: this sums per-partner uniques — may overcount users shared across partners
  const totalUsers = rows.reduce((s, r) => s + r.unique_users, 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Header section="internal" />
      <InternalDashboardClient
        rows={rows}
        totals={{ totalSpend, totalRevenue, totalTx, totalUsers }}
      />
    </div>
  )
}
