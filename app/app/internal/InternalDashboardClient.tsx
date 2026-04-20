'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { KpiCard } from '@/components/ui/KpiCard'
import { Badge } from '@/components/ui/Badge'
import type { InternalDashboardRow } from '@/lib/types'

interface Props {
  rows: InternalDashboardRow[]
  totals: {
    totalSpend: number
    totalRevenue: number
    totalTx: number
    totalUsers: number
  }
}

function fmt(n: number) {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}m`
  if (n >= 1000) return `£${(n / 1000).toFixed(1)}k`
  return `£${n.toFixed(0)}`
}

function fmtMonth(ym: string) {
  if (!ym) return '—'
  const [y, m] = ym.split('-')
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[parseInt(m) - 1]} ${y}`
}

export function InternalDashboardClient({ rows, totals }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = rows.filter(r =>
    r.display_name.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="max-w-screen-xl mx-auto px-6 py-10">

      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ink tracking-tight">Partner Analytics</h1>
        <p className="text-ink-secondary text-sm mt-1">All-partner view across the Yonder platform. Click any partner to drill into detail.</p>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <KpiCard label="Total Spend" value={fmt(totals.totalSpend)} accent="blue" delay={0} />
        <KpiCard label="Total Revenue" value={fmt(totals.totalRevenue)} accent="green" delay={0.05} />
        <KpiCard label="Transactions" value={totals.totalTx.toLocaleString()} accent="purple" delay={0.1} />
        <KpiCard label="Unique Users" value={totals.totalUsers.toLocaleString()} accent="amber" delay={0.15} />
      </div>

      {/* Partner table */}
      <div className="bg-white rounded-2xl shadow-card border border-surface-border overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between gap-4">
          <h2 className="font-semibold text-ink text-sm">Partners</h2>
          <input
            type="text"
            placeholder="Search partners…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-56 text-sm px-3 py-1.5 rounded-lg border border-surface-border bg-surface-muted outline-none focus:ring-2 focus:ring-brand-200 transition"
          />
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="bg-surface-muted">
              <th className="text-left px-6 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Partner</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Category</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Spend</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Revenue</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Txns</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Users</th>
              <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Last Month</th>
              <th className="px-6 py-3 text-xs font-semibold uppercase tracking-wide text-ink-tertiary">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((row, i) => {
              const slug = row.partner_name.toLowerCase().replace(/\s+/g, '-')
              return (
                <motion.tr
                  key={row.partner_name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => router.push(`/internal/partner/${slug}`)}
                  className="border-t border-surface-border hover:bg-brand-50/40 cursor-pointer transition-colors group"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-brand-700 font-bold text-xs shrink-0">
                        {row.display_name[0]}
                      </div>
                      <span className="font-semibold text-ink group-hover:text-brand-600 transition-colors">
                        {row.display_name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-ink-secondary">{row.category}</td>
                  <td className="px-4 py-4 text-right font-mono text-ink font-medium">{fmt(row.total_spend_gbp)}</td>
                  <td className="px-4 py-4 text-right font-mono text-accent-green font-semibold">{fmt(row.total_revenue)}</td>
                  <td className="px-4 py-4 text-right text-ink-secondary">{row.total_transactions.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-ink-secondary">{row.unique_users.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-ink-tertiary text-xs">{fmtMonth(row.last_active_month)}</td>
                  <td className="px-6 py-4">
                    <Badge
                      label={row.is_currently_active ? 'Active' : 'Inactive'}
                      variant={row.is_currently_active ? 'active' : 'inactive'}
                    />
                  </td>
                </motion.tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-ink-tertiary text-sm">
                  No partners match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  )
}
