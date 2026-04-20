'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
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

/** Top-level metric tile for the summary bar */
function SummaryTile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-navy-400">{label}</span>
      <span className="text-xl font-bold text-white font-tabular">{value}</span>
      {sub && <span className="text-xs text-navy-400">{sub}</span>}
    </div>
  )
}

export function InternalDashboardClient({ rows, totals }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')

  const filtered = rows.filter(r =>
    r.display_name.toLowerCase().includes(search.toLowerCase()) ||
    r.category.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = rows.filter(r => r.is_currently_active).length

  return (
    <div className="min-h-screen bg-navy-950">

      {/* ── Dark stats bar ────────────────────────────────────────────── */}
      <div className="bg-navy-900 border-b border-navy-700">
        <div className="max-w-screen-xl mx-auto px-6 py-6">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Partner Analytics</h1>
              <p className="text-navy-400 text-sm mt-0.5">All-partner view · {rows.length} partners tracked</p>
            </div>
            <span className="text-xs font-medium text-accent-green bg-accent-green/10 border border-accent-green/20 px-2.5 py-1 rounded-full">
              {activeCount} active
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-4 pt-4 border-t border-navy-700">
            <SummaryTile label="Total Spend" value={fmt(totals.totalSpend)} />
            <SummaryTile label="Total Revenue" value={fmt(totals.totalRevenue)} />
            <SummaryTile label="Transactions" value={totals.totalTx.toLocaleString()} />
            <SummaryTile label="Unique Users" value={totals.totalUsers.toLocaleString()} />
          </div>
        </div>
      </div>

      {/* ── Partner table ─────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="bg-white rounded-2xl shadow-deep overflow-hidden">

          {/* Table toolbar */}
          <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold text-ink">Partners</h2>
            <input
              type="text"
              placeholder="Search by name or category…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-60 text-sm px-3 py-1.5 rounded-lg border border-surface-border bg-surface-muted outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral/40 transition placeholder:text-ink-tertiary"
            />
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-muted">
                {['Partner', 'Category', 'Spend', 'Revenue', 'Txns', 'Users', 'Last Month', 'Status'].map((h, i) => (
                  <th
                    key={h}
                    className={`py-3 text-[11px] font-semibold uppercase tracking-wider text-ink-tertiary ${
                      i === 0 ? 'text-left px-6' : i <= 1 ? 'text-left px-4' : i >= 6 ? 'px-6' : 'text-right px-4'
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-16 text-center">
                    <p className="text-ink-tertiary text-sm">
                      {search ? `No partners match "${search}"` : 'No partner data available.'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((row, i) => {
                  const slug = row.partner_name.toLowerCase().replace(/\s+/g, '-')
                  const trendIcon = row.revenue_trend === 'up' ? '↑' : row.revenue_trend === 'down' ? '↓' : null
                  const trendCls  = row.revenue_trend === 'up' ? 'text-accent-green' : row.revenue_trend === 'down' ? 'text-accent-red' : ''

                  return (
                    <motion.tr
                      key={row.partner_name}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      onClick={() => router.push(`/internal/partner/${slug}`)}
                      className="border-t border-surface-border hover:bg-coral-subtle cursor-pointer transition-colors group"
                    >
                      {/* Partner */}
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-navy-900 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {row.display_name[0]}
                          </div>
                          <span className="font-semibold text-ink group-hover:text-coral transition-colors">
                            {row.display_name}
                          </span>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3.5 text-ink-secondary text-xs">{row.category}</td>

                      {/* Spend */}
                      <td className="px-4 py-3.5 text-right font-tabular text-ink font-medium">
                        {fmt(row.total_spend_gbp)}
                      </td>

                      {/* Revenue */}
                      <td className="px-4 py-3.5 text-right font-tabular">
                        <span className="text-accent-green font-semibold">{fmt(row.total_revenue)}</span>
                        {trendIcon && (
                          <span className={`ml-1.5 text-xs font-bold ${trendCls}`}>{trendIcon}</span>
                        )}
                      </td>

                      {/* Txns */}
                      <td className="px-4 py-3.5 text-right font-tabular text-ink-secondary">
                        {row.total_transactions.toLocaleString()}
                      </td>

                      {/* Users */}
                      <td className="px-4 py-3.5 text-right font-tabular text-ink-secondary">
                        {row.unique_users.toLocaleString()}
                      </td>

                      {/* Last month */}
                      <td className="px-6 py-3.5 text-right text-ink-tertiary text-xs">
                        {fmtMonth(row.last_active_month)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3.5">
                        <Badge
                          label={row.is_currently_active ? 'Active' : 'Inactive'}
                          variant={row.is_currently_active ? 'active' : 'inactive'}
                        />
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>

          {/* Footer count */}
          {filtered.length > 0 && (
            <div className="px-6 py-3 border-t border-surface-border bg-surface-muted text-xs text-ink-tertiary">
              Showing {filtered.length} of {rows.length} partners
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
