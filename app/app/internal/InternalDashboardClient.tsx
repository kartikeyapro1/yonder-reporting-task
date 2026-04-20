'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/Badge'
import BlurText from '@/components/ui/BlurText'
import CountUp from '@/components/ui/CountUp'
import { FadeIn, StaggerList, StaggerItem } from '@/components/motion'
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

type SortKey = 'display_name' | 'category' | 'total_spend_gbp' | 'total_revenue' | 'total_transactions' | 'unique_users' | 'last_active_month' | 'is_currently_active'
type SortDir = 'asc' | 'desc'

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

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="ml-1 text-gray-300 opacity-0 group-hover/th:opacity-100 transition-opacity">↕</span>
  return <span className="ml-1 text-coral">{dir === 'asc' ? '↑' : '↓'}</span>
}

export function InternalDashboardClient({ rows, totals }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('total_revenue')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'display_name' || key === 'category' ? 'asc' : 'desc')
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    const base = rows.filter(r =>
      r.display_name.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q)
    )
    return [...base].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      let cmp = 0
      if (typeof av === 'string' && typeof bv === 'string') cmp = av.localeCompare(bv)
      else if (typeof av === 'boolean' && typeof bv === 'boolean') cmp = (av === bv ? 0 : av ? 1 : -1)
      else cmp = (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [rows, search, sortKey, sortDir])

  const activeCount = rows.filter(r => r.is_currently_active).length
  const topPartners = [...rows]
    .filter(r => r.is_currently_active)
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 4)

  const stats = [
    { label: 'Member spend', value: totals.totalSpend, prefix: '£' },
    { label: 'Yonder fee earned', value: totals.totalRevenue, prefix: '£' },
    { label: 'Settled transactions', value: totals.totalTx, prefix: '' },
    { label: 'Yonder members', value: totals.totalUsers, prefix: '' },
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-screen-xl mx-auto px-6">

        {/* ── Page header ──────────────────────────────────── */}
        <div className="pt-12 pb-10">
          <BlurText
            text="Partner Analytics"
            className="text-3xl font-display font-semibold text-ink-900 tracking-display"
            delay={60}
            animateBy="words"
          />
          <FadeIn delay={0.3} y={12}>
            <p className="text-sm text-ink-400 mt-2">
              <span className="text-positive font-semibold">{activeCount}</span> of {rows.length} partners currently active
            </p>
          </FadeIn>
        </div>

        {/* ── Stats row ────────────────────────────────────── */}
        <StaggerList className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {stats.map(s => (
            <StaggerItem key={s.label}>
              <div className="rounded-2xl border border-gray-200/80 bg-white px-5 py-5 shadow-card hover:shadow-float transition-shadow duration-400">
                <p className="text-xs font-medium text-ink-400 uppercase tracking-caps mb-2">{s.label}</p>
                <p className="text-2xl font-semibold text-ink-900 font-tabular">
                  {s.prefix}
                  <CountUp
                    to={s.value >= 1_000_000 ? parseFloat((s.value / 1_000_000).toFixed(2)) : s.value >= 1000 ? parseFloat((s.value / 1000).toFixed(1)) : s.value}
                    duration={1.6}
                    separator=","
                  />
                  {s.value >= 1_000_000 ? 'm' : s.value >= 1000 ? 'k' : ''}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerList>

        {/* ── Featured partners ────────────────────────────── */}
        {topPartners.length > 0 && (
          <FadeIn delay={0.2}>
            <div className="mb-10">
              <p className="text-[11px] font-semibold text-ink-300 uppercase tracking-caps mb-4">
                Top partners by revenue
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {topPartners.map(row => {
                  const slug = row.partner_name.toLowerCase().replace(/\s+/g, '-')
                  const isUp = row.revenue_trend === 'up'
                  return (
                    <div
                      key={row.partner_name}
                      onClick={() => router.push(`/internal/partner/${slug}`)}
                      className="group bg-white rounded-2xl border border-gray-200/80 p-5 cursor-pointer
                        hover:shadow-float hover:border-coral/20 hover:-translate-y-0.5
                        transition-all duration-400 ease-out-expo"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-ink-900 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                          {row.display_name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink-800 group-hover:text-coral transition-colors duration-300">
                            {row.display_name}
                          </p>
                          <p className="text-[11px] text-ink-300">{row.category}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                        <div>
                          <p className="text-[10px] text-ink-300 mb-0.5">Member spend</p>
                          <p className="text-xs font-semibold text-ink-800 font-tabular">{fmt(row.total_spend_gbp)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-ink-300 mb-0.5">Fee earned</p>
                          <p className="text-xs font-semibold text-positive font-tabular">{fmt(row.total_revenue)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-ink-300 mb-0.5">Trend</p>
                          <p className={`text-xs font-semibold ${isUp ? 'text-positive' : row.revenue_trend === 'down' ? 'text-negative' : 'text-ink-300'}`}>
                            {isUp ? '↑ Up' : row.revenue_trend === 'down' ? '↓ Down' : '→ Flat'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </FadeIn>
        )}

        {/* ── Partner table ────────────────────────────────── */}
        <FadeIn delay={0.3}>
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-card overflow-hidden mb-16">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-semibold text-ink-800">All partners</h2>
                <span className="text-[11px] text-ink-400 bg-sand-100 px-2 py-0.5 rounded-full font-medium">
                  {filtered.length}
                </span>
              </div>
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  aria-label="Search partners"
                  className="w-52 text-sm pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-sand-50
                    outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral/30
                    transition-all duration-300 placeholder:text-gray-400"
                />
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-sand-50/80">
                  <th onClick={() => toggleSort('display_name')} role="columnheader" aria-sort={sortKey === 'display_name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('display_name')} className="group/th text-left px-6 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps cursor-pointer select-none hover:text-ink-600 transition-colors">
                    Partner<SortIcon active={sortKey === 'display_name'} dir={sortDir} />
                  </th>
                  <th onClick={() => toggleSort('category')} role="columnheader" aria-sort={sortKey === 'category' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('category')} className="group/th text-left px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps cursor-pointer select-none hover:text-ink-600 transition-colors">
                    Category<SortIcon active={sortKey === 'category'} dir={sortDir} />
                  </th>
                  <th onClick={() => toggleSort('total_spend_gbp')} role="columnheader" aria-sort={sortKey === 'total_spend_gbp' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('total_spend_gbp')} className="group/th text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps cursor-pointer select-none hover:text-ink-600 transition-colors">
                    Member spend<SortIcon active={sortKey === 'total_spend_gbp'} dir={sortDir} />
                  </th>
                  <th onClick={() => toggleSort('total_revenue')} role="columnheader" aria-sort={sortKey === 'total_revenue' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('total_revenue')} className="group/th text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps cursor-pointer select-none hover:text-ink-600 transition-colors">
                    Yonder fee<SortIcon active={sortKey === 'total_revenue'} dir={sortDir} />
                  </th>
                  <th onClick={() => toggleSort('total_transactions')} role="columnheader" aria-sort={sortKey === 'total_transactions' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('total_transactions')} className="group/th text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps cursor-pointer select-none hover:text-ink-600 transition-colors">
                    Settled txns<SortIcon active={sortKey === 'total_transactions'} dir={sortDir} />
                  </th>
                  <th onClick={() => toggleSort('unique_users')} role="columnheader" aria-sort={sortKey === 'unique_users' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('unique_users')} className="group/th text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps cursor-pointer select-none hover:text-ink-600 transition-colors">
                    Customers<SortIcon active={sortKey === 'unique_users'} dir={sortDir} />
                  </th>
                  <th onClick={() => toggleSort('last_active_month')} role="columnheader" aria-sort={sortKey === 'last_active_month' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('last_active_month')} className="group/th text-right px-4 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps cursor-pointer select-none hover:text-ink-600 transition-colors">
                    Last active<SortIcon active={sortKey === 'last_active_month'} dir={sortDir} />
                  </th>
                  <th onClick={() => toggleSort('is_currently_active')} role="columnheader" aria-sort={sortKey === 'is_currently_active' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('is_currently_active')} className="group/th text-center px-6 py-3 text-[11px] font-semibold text-ink-400 uppercase tracking-caps cursor-pointer select-none hover:text-ink-600 transition-colors">
                    Status<SortIcon active={sortKey === 'is_currently_active'} dir={sortDir} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center text-sm text-ink-300">
                      {search ? `No partners match "${search}"` : 'No partner data available.'}
                    </td>
                  </tr>
                ) : (
                  filtered.map(row => {
                    const slug = row.partner_name.toLowerCase().replace(/\s+/g, '-')
                    const trendIcon = row.revenue_trend === 'up' ? '↑' : row.revenue_trend === 'down' ? '↓' : null
                    const trendCls  = row.revenue_trend === 'up' ? 'text-positive' : row.revenue_trend === 'down' ? 'text-negative' : ''
                    return (
                      <tr
                        key={row.partner_name}
                        onClick={() => router.push(`/internal/partner/${slug}`)}
                        onKeyDown={e => e.key === 'Enter' && router.push(`/internal/partner/${slug}`)}
                        tabIndex={0}
                        role="link"
                        aria-label={`View ${row.display_name} details`}
                        className="group border-t border-gray-100/80 hover:bg-coral-50/40 cursor-pointer
                          transition-colors duration-200 focus-visible:bg-coral-50/40"
                      >
                        <td className="px-6 py-3.5 relative">
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-8 rounded-r-full bg-coral
                            opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="flex items-center gap-3">
                            <div className="w-7 h-7 rounded-lg bg-ink-900 flex items-center justify-center text-white font-semibold text-[11px] shrink-0
                              group-hover:bg-coral transition-colors duration-300">
                              {row.display_name[0]}
                            </div>
                            <span className="font-medium text-ink-800 group-hover:text-ink-950 transition-colors">{row.display_name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-ink-400 text-xs">{row.category}</td>
                        <td className="px-4 py-3.5 text-right font-tabular text-ink-800">{fmt(row.total_spend_gbp)}</td>
                        <td className="px-4 py-3.5 text-right font-tabular">
                          <span className="text-coral font-medium">{fmt(row.total_revenue)}</span>
                          {trendIcon && <span className={`ml-1 text-xs ${trendCls}`}>{trendIcon}</span>}
                        </td>
                        <td className="px-4 py-3.5 text-right font-tabular text-ink-400">{row.total_transactions.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right font-tabular text-ink-400">{row.unique_users.toLocaleString()}</td>
                        <td className="px-4 py-3.5 text-right text-ink-300 text-xs">{fmtMonth(row.last_active_month)}</td>
                        <td className="px-6 py-3.5 text-center">
                          <Badge
                            label={row.is_currently_active ? 'Active' : 'Inactive'}
                            variant={row.is_currently_active ? 'active' : 'inactive'}
                          />
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>

            {filtered.length > 0 && (
              <div className="px-6 py-3 border-t border-gray-100 text-xs text-ink-300">
                Showing {filtered.length} of {rows.length} partners
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
