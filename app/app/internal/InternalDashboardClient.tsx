'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowUp, ArrowDown, ChevronsUpDown,
  TrendingUp, TrendingDown,
  ChevronLeft, ChevronRight,
  Download,
} from 'lucide-react'
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
  if (!active) return <ChevronsUpDown className="inline-block ml-1 w-3 h-3 text-gray-300 opacity-0 group-hover/th:opacity-100 transition-opacity" />
  return active && dir === 'asc'
    ? <ArrowUp className="inline-block ml-1 w-3 h-3 text-coral" />
    : <ArrowDown className="inline-block ml-1 w-3 h-3 text-coral" />
}

const PAGE_SIZE = 20

export function InternalDashboardClient({ rows, totals }: Props) {
  const router = useRouter()
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('total_revenue')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  // '/' keyboard shortcut → focus search
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value)
      setPage(1)
    }, 200)
  }, [])

  function exportCsv() {
    const headers = ['Partner', 'Category', 'Card Spend (£)', 'Commission (£)', 'Visits', 'Members', 'Last Active', 'Status']
    const escCsv = (v: string) => `"${v.replace(/"/g, '""')}"`
    const rows = filtered.map(r => [
      escCsv(r.display_name),
      escCsv(r.category),
      r.total_spend_gbp.toFixed(2),
      r.total_revenue.toFixed(2),
      r.total_transactions.toString(),
      r.unique_users.toString(),
      r.last_active_month,
      r.is_currently_active ? 'Active' : 'Inactive',
    ].join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `yonder-partners-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'display_name' || key === 'category' ? 'asc' : 'desc')
    }
    setPage(1)
  }

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
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
  }, [rows, debouncedSearch, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  const activeCount = rows.filter(r => r.is_currently_active).length
  const topPartners = [...rows]
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 4)

  const stats = [
    {
      label: 'Card spend',
      title: 'Total GBP spent at all partners using Yonder cards. Settled transactions only.',
      value: totals.totalSpend,
      prefix: '£',
    },
    {
      label: 'Commission',
      title: "Yonder's total commission earned from partners, based on agreed CPA or % of spend models.",
      value: totals.totalRevenue,
      prefix: '£',
    },
    {
      label: 'Visits',
      title: 'Total number of settled card transactions across all partners.',
      value: totals.totalTx,
      prefix: '',
    },
    {
      label: 'Members',
      title: 'Distinct Yonder cardholders who made at least one settled transaction.',
      value: totals.totalUsers,
      prefix: '',
    },
  ]

  return (
    <div className="min-h-screen bg-sand-50">
      <div className="max-w-screen-xl mx-auto px-6">

        {/* ── Page header ──────────────────────────────────── */}
        <div className="pt-12 pb-10 flex items-start justify-between">
          <div>
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
          <FadeIn delay={0.4} y={8}>
            <button
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' })
                window.location.href = '/internal-login'
              }}
              className="mt-12 text-xs font-medium text-ink-300 hover:text-negative transition-colors duration-200"
            >
              Sign out
            </button>
          </FadeIn>
        </div>

        {/* ── Stats row ────────────────────────────────────── */}
        <FadeIn delay={0.15}>
          <div className="flex divide-x divide-gray-100 border-y border-gray-100 mb-12 -mx-6 px-6">
            {stats.map(s => (
              <div key={s.label} className="flex-1 py-7 pr-8 last:pr-0 first:pl-0 pl-8">
                <p
                  className="text-[11px] font-medium text-ink-400 mb-1.5 cursor-help"
                  title={s.title}
                >{s.label}</p>
                <p className="text-[2rem] font-display font-semibold text-ink-900 leading-none font-tabular tracking-tight">
                  {s.prefix}
                  <CountUp
                    to={s.value >= 1_000_000 ? parseFloat((s.value / 1_000_000).toFixed(2)) : s.value >= 1000 ? parseFloat((s.value / 1000).toFixed(1)) : s.value}
                    duration={1.6}
                    separator=","
                  />
                  {s.value >= 1_000_000 ? 'm' : s.value >= 1000 ? 'k' : ''}
                </p>
              </div>
            ))}
          </div>
        </FadeIn>

        {/* ── Featured partners ────────────────────────────── */}
        {topPartners.length > 0 && (
          <FadeIn delay={0.2}>
            <div className="mb-10">
              <p className="text-sm font-semibold text-ink-600 mb-4">
                Top partners
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {topPartners.map((row, i) => {
                  const slug = row.partner_name.toLowerCase().replace(/\s+/g, '-')
                  return (
                    <div
                      key={row.partner_name}
                      onClick={() => router.push(`/internal/partner/${slug}`)}
                      className="group relative bg-white rounded-2xl border border-gray-100 p-5 cursor-pointer
                        overflow-hidden hover:shadow-lg hover:-translate-y-0.5
                        transition-all duration-300 ease-out"
                    >
                      {/* Coral left accent — replaces generic letter avatar */}
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl bg-coral opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                      <div className="mb-4">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-base font-display font-semibold text-ink-800 group-hover:text-coral transition-colors duration-300 leading-tight">
                            {row.display_name}
                          </p>
                          <span className="text-[11px] text-ink-300 font-mono shrink-0 mt-0.5">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                        </div>
                        <p className="text-xs text-ink-300 mt-0.5">{row.category}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-50">
                        <div>
                          <p className="text-[10px] text-ink-300 mb-0.5">Spend</p>
                          <p className="text-xs font-semibold text-ink-800 font-tabular">{fmt(row.total_spend_gbp)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-ink-300 mb-0.5">Commission</p>
                          <p className={`text-xs font-semibold font-tabular ${row.total_revenue > 0 ? 'text-coral' : 'text-ink-300'}`}>{fmt(row.total_revenue)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-ink-300 mb-0.5">Status</p>
                          <p className={`text-xs font-semibold ${row.is_currently_active ? 'text-positive' : 'text-ink-300'}`}>
                            <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${row.is_currently_active ? 'bg-positive' : 'bg-gray-300'}`} />
                            {row.is_currently_active ? 'Active' : 'Off'}
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
              <div className="flex items-center gap-2">
                <button
                  onClick={exportCsv}
                  title="Export filtered table as CSV"
                  className="p-2 rounded-xl border border-gray-200 bg-white text-ink-400 hover:text-ink-700 hover:bg-sand-50
                    hover:border-coral/20 transition-all duration-300"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search…  /"
                  value={search}
                  onChange={e => handleSearch(e.target.value)}
                  aria-label="Search partners"
                  className="w-52 text-sm pl-9 pr-3 py-2 rounded-xl border border-gray-200 bg-sand-50
                    outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral/30
                    transition-all duration-300 placeholder:text-gray-400"
                />
                </div>
              </div>
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th onClick={() => toggleSort('display_name')} role="columnheader" aria-sort={sortKey === 'display_name' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('display_name')} className="group/th text-left px-6 py-3.5 text-xs font-medium text-ink-400 cursor-pointer select-none hover:text-ink-700 transition-colors">
                    Partner<SortIcon active={sortKey === 'display_name'} dir={sortDir} />
                  </th>
                  <th onClick={() => toggleSort('category')} role="columnheader" aria-sort={sortKey === 'category' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('category')} className="group/th text-left px-4 py-3.5 text-xs font-medium text-ink-400 cursor-pointer select-none hover:text-ink-700 transition-colors">
                    Category<SortIcon active={sortKey === 'category'} dir={sortDir} />
                  </th>
                  <th onClick={() => toggleSort('total_spend_gbp')} role="columnheader" aria-sort={sortKey === 'total_spend_gbp' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('total_spend_gbp')} className="group/th text-right px-4 py-3.5 text-xs font-medium text-ink-400 cursor-pointer select-none hover:text-ink-700 transition-colors">
                    Card spend<SortIcon active={sortKey === 'total_spend_gbp'} dir={sortDir} />
                  </th>
                  <th onClick={() => toggleSort('total_revenue')} role="columnheader" aria-sort={sortKey === 'total_revenue' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('total_revenue')} className="group/th text-right px-4 py-3.5 text-xs font-medium text-ink-400 cursor-pointer select-none hover:text-ink-700 transition-colors" title="Yonder's commission from this partner">
                    Commission<SortIcon active={sortKey === 'total_revenue'} dir={sortDir} />
                  </th>
                  <th onClick={() => toggleSort('total_transactions')} role="columnheader" aria-sort={sortKey === 'total_transactions' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('total_transactions')} className="group/th text-right px-4 py-3.5 text-xs font-medium text-ink-400 cursor-pointer select-none hover:text-ink-700 transition-colors" title="Number of settled transactions">
                    Visits<SortIcon active={sortKey === 'total_transactions'} dir={sortDir} />
                  </th>
                  <th onClick={() => toggleSort('unique_users')} role="columnheader" aria-sort={sortKey === 'unique_users' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('unique_users')} className="group/th text-right px-4 py-3.5 text-xs font-medium text-ink-400 cursor-pointer select-none hover:text-ink-700 transition-colors" title="Unique Yonder cardholders who visited">
                    Members<SortIcon active={sortKey === 'unique_users'} dir={sortDir} />
                  </th>
                  <th onClick={() => toggleSort('last_active_month')} role="columnheader" aria-sort={sortKey === 'last_active_month' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('last_active_month')} className="group/th text-right px-4 py-3.5 text-xs font-medium text-ink-400 cursor-pointer select-none hover:text-ink-700 transition-colors">
                    Last active<SortIcon active={sortKey === 'last_active_month'} dir={sortDir} />
                  </th>
                  <th onClick={() => toggleSort('is_currently_active')} role="columnheader" aria-sort={sortKey === 'is_currently_active' ? (sortDir === 'asc' ? 'ascending' : 'descending') : 'none'} tabIndex={0} onKeyDown={e => e.key === 'Enter' && toggleSort('is_currently_active')} className="group/th text-center px-6 py-3.5 text-xs font-medium text-ink-400 cursor-pointer select-none hover:text-ink-700 transition-colors">
                    Status<SortIcon active={sortKey === 'is_currently_active'} dir={sortDir} />
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-20 text-center text-sm text-ink-300">
                      {debouncedSearch ? `No partners match "${debouncedSearch}"` : 'No partner data available.'}
                    </td>
                  </tr>
                ) : (
                  paginated.map(row => {
                    const slug = row.partner_name.toLowerCase().replace(/\s+/g, '-')
                    const TrendIcon = row.revenue_trend === 'up' ? TrendingUp : row.revenue_trend === 'down' ? TrendingDown : null
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
                          <span className={`font-medium ${row.total_revenue > 0 ? 'text-coral' : 'text-ink-300'}`}>{fmt(row.total_revenue)}</span>
                          {TrendIcon && <TrendIcon className={`inline-block ml-1 w-3 h-3 ${trendCls}`} />}
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
              <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between gap-4">
                <p className="text-xs text-ink-300">
                  {filtered.length < rows.length
                    ? `${filtered.length} of ${rows.length} partners`
                    : `${rows.length} partners`}
                  {totalPages > 1 && ` · page ${safePage} of ${totalPages}`}
                </p>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={safePage === 1}
                      aria-label="Previous page"
                      className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-sand-100
                        disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        aria-label={`Page ${n}`}
                        aria-current={n === safePage ? 'page' : undefined}
                        className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors
                          ${n === safePage
                            ? 'bg-coral text-white'
                            : 'text-ink-400 hover:text-ink-700 hover:bg-sand-100'}`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={safePage === totalPages}
                      aria-label="Next page"
                      className="p-1.5 rounded-lg text-ink-400 hover:text-ink-700 hover:bg-sand-100
                        disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
