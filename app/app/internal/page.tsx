import { Header } from '@/components/layout/Header'
import { InternalDashboardClient } from './InternalDashboardClient'
import { getAllPartnerSummaries } from '@/lib/reporting/partner-report-summary'
import { getPartnerConfig } from '@/lib/config/partner-commercials'
import type { InternalDashboardRow } from '@/lib/types'

export const dynamic = 'force-dynamic'

export default function InternalDashboardPage() {
  const summaries = getAllPartnerSummaries()

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

  const totalSpend = rows.reduce((s, r) => s + r.total_spend_gbp, 0)
  const totalRevenue = rows.reduce((s, r) => s + r.total_revenue, 0)
  const totalTx = rows.reduce((s, r) => s + r.total_transactions, 0)
  const totalUsers = rows.reduce((s, r) => s + r.unique_users, 0)

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header section="internal" />
      <InternalDashboardClient
        rows={rows}
        totals={{ totalSpend, totalRevenue, totalTx, totalUsers }}
      />
    </div>
  )
}
