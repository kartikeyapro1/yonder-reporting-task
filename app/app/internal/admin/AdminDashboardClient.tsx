'use client'

import { useState } from 'react'
import Link from 'next/link'
import { BarChart2, ArrowRight, Link2, Check, X } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/layout/Header'
import { FadeIn, StaggerList, StaggerItem } from '@/components/motion'
import type { PartnerConfig, CommercialModel, PartnerActivePeriod } from '@/lib/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MODEL_LABELS: Record<string, string> = {
  cpa_new_repeat: 'CPA (New / Repeat)',
  pct_spend_new_repeat: '% of Spend (New / Repeat)',
  blended_commission: 'Blended Commission',
  fixed_fee: 'Fixed Monthly Fee',
}

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Drink': 'bg-orange-50 text-orange-600',
  'Delivery':     'bg-blue-50 text-blue-600',
  'Retail':       'bg-purple-50 text-purple-600',
  'Entertainment':'bg-pink-50 text-pink-600',
  'Travel':       'bg-sky-50 text-sky-600',
  'Other':        'bg-gray-100 text-gray-500',
}

function fmtDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function fmtDateShort(iso: string): string {
  if (!iso) return 'ongoing'
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })
}

function commercialSummary(c: CommercialModel): string {
  switch (c.type) {
    case 'cpa_new_repeat':
      return `£${c.cpa_new ?? 0} new · £${c.cpa_repeat ?? 0} repeat`
    case 'pct_spend_new_repeat':
      return `${((c.pct_new ?? 0) * 100).toFixed(1)}% new · ${((c.pct_repeat ?? 0) * 100).toFixed(1)}% repeat`
    case 'blended_commission':
      return `${((c.blended_rate ?? 0) * 100).toFixed(1)}% blended`
    case 'fixed_fee':
      return `£${c.fixed_monthly ?? 0}/month`
    default:
      return c.type
  }
}

function isActivePartner(p: PartnerConfig): boolean {
  const now = new Date()
  return p.active_periods.some(ap => {
    const start = new Date(ap.start_date)
    const end = ap.end_date ? new Date(ap.end_date) : null
    return now >= start && (end === null || now < end)
  })
}

// ─── Component ───────────────────────────────────────────────────────────────

interface Props {
  partners: PartnerConfig[]
}

export function AdminDashboardClient({ partners: initialPartners }: Props) {
  const [partners, setPartners] = useState<PartnerConfig[]>(initialPartners)
  const [editingPartner, setEditingPartner] = useState<PartnerConfig | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [copiedToken, setCopiedToken] = useState<string | null>(null)
  const [magicLinkState, setMagicLinkState] = useState<Record<string, 'idle' | 'loading' | 'copied'>>({})

  // ── Form state ──
  const [formName, setFormName] = useState('')
  const [formDisplayName, setFormDisplayName] = useState('')
  const [formCategory, setFormCategory] = useState('Food & Drink')
  const [formBaseline, setFormBaseline] = useState('')
  const [formModelType, setFormModelType] = useState<string>('cpa_new_repeat')
  const [formCpaNew, setFormCpaNew] = useState('')
  const [formCpaRepeat, setFormCpaRepeat] = useState('')
  const [formPctNew, setFormPctNew] = useState('')
  const [formPctRepeat, setFormPctRepeat] = useState('')
  const [formBlended, setFormBlended] = useState('')
  const [formFixed, setFormFixed] = useState('')

  // ── Period form ──
  const [editingPeriods, setEditingPeriods] = useState<PartnerActivePeriod[] | null>(null)
  const [periodPartner, setPeriodPartner] = useState<string | null>(null)
  const [newPeriodStart, setNewPeriodStart] = useState('')
  const [newPeriodEnd, setNewPeriodEnd] = useState('')

  function openNewPartner() {
    setEditingPartner(null)
    setFormName('')
    setFormDisplayName('')
    setFormCategory('Food & Drink')
    setFormBaseline('')
    setFormModelType('cpa_new_repeat')
    setFormCpaNew('')
    setFormCpaRepeat('')
    setFormPctNew('')
    setFormPctRepeat('')
    setFormBlended('')
    setFormFixed('')
    setShowForm(true)
  }

  function openEditPartner(p: PartnerConfig) {
    setEditingPartner(p)
    setFormName(p.partner_name)
    setFormDisplayName(p.display_name)
    setFormCategory(p.category)
    setFormBaseline(p.baseline_date)
    const cm = p.commercials[0]
    if (cm) {
      setFormModelType(cm.type)
      setFormCpaNew(cm.cpa_new?.toString() ?? '')
      setFormCpaRepeat(cm.cpa_repeat?.toString() ?? '')
      setFormPctNew(cm.pct_new ? (cm.pct_new * 100).toString() : '')
      setFormPctRepeat(cm.pct_repeat ? (cm.pct_repeat * 100).toString() : '')
      setFormBlended(cm.blended_rate ? (cm.blended_rate * 100).toString() : '')
      setFormFixed(cm.fixed_monthly?.toString() ?? '')
    }
    setShowForm(true)
  }

  async function savePartner() {
    setSaving(true)
    const commercial: CommercialModel = {
      type: formModelType as CommercialModel['type'],
      currency: 'GBP',
      effective_from: formBaseline,
    }

    switch (formModelType) {
      case 'cpa_new_repeat':
        commercial.cpa_new = parseFloat(formCpaNew) || 0
        commercial.cpa_repeat = parseFloat(formCpaRepeat) || 0
        break
      case 'pct_spend_new_repeat':
        commercial.pct_new = (parseFloat(formPctNew) || 0) / 100
        commercial.pct_repeat = (parseFloat(formPctRepeat) || 0) / 100
        break
      case 'blended_commission':
        commercial.blended_rate = (parseFloat(formBlended) || 0) / 100
        break
      case 'fixed_fee':
        commercial.fixed_monthly = parseFloat(formFixed) || 0
        break
    }

    const config: PartnerConfig = {
      partner_name: formName,
      display_name: formDisplayName,
      category: formCategory,
      baseline_date: formBaseline,
      partner_token: editingPartner?.partner_token ?? '',
      active_periods: editingPartner?.active_periods ?? [],
      commercials: [commercial],
    }

    const res = await fetch('/api/admin/partners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })

    if (res.ok) {
      const saved = await res.json()
      setPartners(prev => {
        const idx = prev.findIndex(p => p.partner_name === saved.partner_name)
        if (idx >= 0) return [...prev.slice(0, idx), saved, ...prev.slice(idx + 1)]
        return [...prev, saved]
      })
      setShowForm(false)
    }
    setSaving(false)
  }

  async function deletePartnerHandler(name: string) {
    const res = await fetch(`/api/admin/partners/${encodeURIComponent(name)}`, { method: 'DELETE' })
    if (res.ok) {
      setPartners(prev => prev.filter(p => p.partner_name !== name))
      setDeleteConfirm(null)
    }
  }

  async function openPeriods(name: string) {
    const res = await fetch(`/api/admin/partners/${encodeURIComponent(name)}/periods`)
    if (res.ok) {
      const periods = await res.json()
      setEditingPeriods(periods)
      setPeriodPartner(name)
    }
  }

  async function savePeriods() {
    if (!periodPartner || !editingPeriods) return
    setSaving(true)
    await fetch(`/api/admin/partners/${encodeURIComponent(periodPartner)}/periods`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ periods: editingPeriods }),
    })
    setSaving(false)
    setEditingPeriods(null)
    setPeriodPartner(null)
  }

  function addPeriod() {
    if (!newPeriodStart || !editingPeriods) return
    setEditingPeriods([
      ...editingPeriods,
      {
        partner_name: periodPartner!,
        start_date: newPeriodStart,
        end_date: newPeriodEnd || null,
        label: '',
      },
    ])
    setNewPeriodStart('')
    setNewPeriodEnd('')
  }

  function removePeriod(idx: number) {
    if (!editingPeriods) return
    setEditingPeriods(editingPeriods.filter((_, i) => i !== idx))
  }

  async function copyToken(token: string) {
    await navigator.clipboard.writeText(token)
    setCopiedToken(token)
    toast.success('Token copied to clipboard')
    setTimeout(() => setCopiedToken(null), 2000)
  }

  async function generateMagicLink(partnerName: string) {
    setMagicLinkState(s => ({ ...s, [partnerName]: 'loading' }))
    const res = await fetch('/api/auth/magic-link', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ partnerName }),
    })
    if (res.ok) {
      const { url } = await res.json()
      await navigator.clipboard.writeText(url)
      setMagicLinkState(s => ({ ...s, [partnerName]: 'copied' }))
      toast.success('Magic link copied to clipboard')
      setTimeout(() => setMagicLinkState(s => ({ ...s, [partnerName]: 'idle' })), 2500)
    } else {
      setMagicLinkState(s => ({ ...s, [partnerName]: 'idle' }))
      toast.error('Failed to generate magic link')
    }
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  const inputClass = 'w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral/30 transition-all'
  const labelClass = 'block text-[11px] font-semibold text-ink-400 uppercase tracking-caps mb-1.5'
  const btnPrimary = 'px-4 py-2 bg-coral text-white text-sm font-semibold rounded-lg hover:bg-coral-light transition-colors disabled:opacity-50'
  const btnSecondary = 'px-3 py-1.5 bg-sand-100 text-ink-600 text-xs font-semibold rounded-lg hover:bg-sand-200 transition-colors'

  return (
    <div className="min-h-screen bg-sand-50">
      <Header section="internal" />

      <div className="max-w-screen-lg mx-auto px-6 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-ink-400 mb-6">
          <Link href="/internal" className="hover:text-ink-600 transition-colors">Dashboard</Link>
          <span className="text-ink-200">›</span>
          <span className="text-ink-700 font-medium">Partner Configuration</span>
        </div>

        {/* Header */}
        <FadeIn>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-display font-semibold text-ink-900 tracking-display">
                Partner Configuration
              </h1>
              <p className="text-sm text-ink-400 mt-1">{partners.length} partners configured</p>
            </div>
            <button onClick={openNewPartner} className={btnPrimary}>
              + Add Partner
            </button>
          </div>
        </FadeIn>

        {/* ── Partner Cards ── */}
        <StaggerList className="flex flex-col gap-5">
          {partners.map(p => {
            const isActive = isActivePartner(p)
            const slug = p.partner_name.toLowerCase().replace(/\s+/g, '-')
            const catColor = CATEGORY_COLORS[p.category] ?? CATEGORY_COLORS['Other']
            const cm = p.commercials[0]
            const mlState = magicLinkState[p.partner_name] ?? 'idle'

            return (
              <StaggerItem key={p.partner_name}>
                <div className={`bg-white rounded-2xl border shadow-card overflow-hidden transition-shadow hover:shadow-float
                  ${isActive ? 'border-gray-100' : 'border-gray-100/60'}`}>

                  {/* Accent stripe */}
                  <div className={`h-1 w-full ${isActive ? 'bg-coral' : 'bg-gray-200'}`} />

                  <div className="p-6">
                    {/* ── Card header ── */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-4">
                        {/* Avatar */}
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg shrink-0
                          ${isActive ? 'bg-ink-900' : 'bg-ink-300'}`}>
                          {p.display_name[0]}
                        </div>
                        <div>
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <h3 className="text-base font-semibold text-ink-900">{p.display_name}</h3>
                            <span className={`text-[10px] font-semibold uppercase tracking-caps px-2 py-0.5 rounded-md ${catColor}`}>
                              {p.category}
                            </span>
                            <span className={`text-[10px] font-semibold uppercase tracking-caps px-2 py-0.5 rounded-full flex items-center gap-1
                              ${isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                              <span className={`inline-block w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                              {isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-xs text-ink-300 mt-0.5 font-mono">{p.partner_name}</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* View analytics */}
                        <Link
                          href={`/internal/partner/${slug}`}
                          className="px-3 py-1.5 text-xs font-semibold text-ink-600 bg-sand-100 hover:bg-sand-200 rounded-lg transition-colors flex items-center gap-1.5"
                        >
                          <BarChart2 className="w-3 h-3" /> Analytics
                        </Link>
                        {/* Manage periods */}
                        <button onClick={() => openPeriods(p.partner_name)} className={btnSecondary}>
                          Periods
                        </button>
                        {/* Edit */}
                        <button onClick={() => openEditPartner(p)} className={btnSecondary}>
                          Edit
                        </button>
                        {/* Delete */}
                        {deleteConfirm === p.partner_name ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-red-500 font-medium">Sure?</span>
                            <button
                              onClick={() => deletePartnerHandler(p.partner_name)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                            >
                              Yes
                            </button>
                            <button
                              onClick={() => setDeleteConfirm(null)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-ink-500 bg-sand-100 hover:bg-sand-200 rounded-lg transition-colors"
                            >
                              No
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(p.partner_name)}
                            className="px-3 py-1.5 text-xs text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors font-semibold"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>

                    {/* ── Data strip ── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-gray-100">
                      {/* Baseline */}
                      <div>
                        <p className="text-[10px] font-semibold text-ink-300 uppercase tracking-caps mb-1">Baseline date</p>
                        <p className="text-sm font-medium text-ink-700">{fmtDate(p.baseline_date)}</p>
                      </div>

                      {/* Token */}
                      <div>
                        <p className="text-[10px] font-semibold text-ink-300 uppercase tracking-caps mb-1">Partner token</p>
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-mono text-ink-500 truncate max-w-[120px]">{p.partner_token}</p>
                          <button
                            onClick={() => copyToken(p.partner_token)}
                            className="text-ink-300 hover:text-coral transition-colors shrink-0"
                            title="Copy token"
                          >
                            {copiedToken === p.partner_token ? (
                              <svg className="w-3.5 h-3.5 text-positive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            ) : (
                              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Commercial model */}
                      <div>
                        <p className="text-[10px] font-semibold text-ink-300 uppercase tracking-caps mb-1">Commercial model</p>
                        {cm ? (
                          <div>
                            <p className="text-[11px] font-semibold text-ink-500 bg-sand-100 inline-block px-2 py-0.5 rounded-md mb-1">
                              {MODEL_LABELS[cm.type] ?? cm.type}
                            </p>
                            <p className="text-xs text-ink-600 font-tabular">{commercialSummary(cm)}</p>
                          </div>
                        ) : <p className="text-sm text-ink-300">—</p>}
                      </div>

                      {/* Magic link */}
                      <div>
                        <p className="text-[10px] font-semibold text-ink-300 uppercase tracking-caps mb-1">Partner link</p>
                        <button
                          onClick={() => generateMagicLink(p.partner_name)}
                          disabled={mlState === 'loading'}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-200
                            ${mlState === 'copied'
                              ? 'bg-emerald-50 text-emerald-600'
                              : 'bg-coral/10 text-coral hover:bg-coral/20'
                            } disabled:opacity-50`}
                        >
                          {mlState === 'loading' ? 'Generating…' : mlState === 'copied'
                            ? <><Check className="inline-block w-3 h-3 mr-1" />Copied!</>
                            : <><Link2 className="inline-block w-3 h-3 mr-1" />Copy magic link</>}
                        </button>
                      </div>
                    </div>

                    {/* ── Active Periods ── */}
                    {p.active_periods.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-[10px] font-semibold text-ink-300 uppercase tracking-caps mb-2.5">
                          Active periods ({p.active_periods.length})
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {p.active_periods.map((ap, i) => {
                            const ongoing = ap.end_date === null
                            return (
                              <span
                                key={i}
                                className={`text-[11px] font-medium px-2.5 py-1 rounded-full flex items-center gap-1
                                  ${ongoing ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200' : 'bg-sand-100 text-ink-500'}`}
                              >
                                {fmtDateShort(ap.start_date)}
                                <ArrowRight className={`inline-block w-3 h-3 ${ongoing ? 'text-emerald-400' : 'text-ink-300'}`} />
                                {ongoing ? <span className="font-semibold">ongoing</span> : fmtDateShort(ap.end_date!)}
                              </span>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </StaggerItem>
            )
          })}
        </StaggerList>

        {/* ── Partner Form Modal ── */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-float max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-display font-semibold text-ink-900 tracking-display mb-6">
                {editingPartner ? `Edit ${editingPartner.display_name}` : 'New Partner'}
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Partner Name (canonical)</label>
                    <input className={inputClass} value={formName} onChange={e => setFormName(e.target.value)}
                      disabled={!!editingPartner} placeholder="e.g. FRIVE" />
                  </div>
                  <div>
                    <label className={labelClass}>Display Name</label>
                    <input className={inputClass} value={formDisplayName} onChange={e => setFormDisplayName(e.target.value)}
                      placeholder="e.g. Frive" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Category</label>
                    <select className={inputClass} value={formCategory} onChange={e => setFormCategory(e.target.value)}>
                      <option>Food & Drink</option>
                      <option>Delivery</option>
                      <option>Retail</option>
                      <option>Entertainment</option>
                      <option>Travel</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Baseline Date</label>
                    <input className={inputClass} type="date" value={formBaseline}
                      onChange={e => setFormBaseline(e.target.value)} />
                  </div>
                </div>

                <hr className="border-gray-100" />
                <h3 className="text-sm font-semibold text-ink-700">Commercial Model</h3>

                <div>
                  <label className={labelClass}>Type</label>
                  <select className={inputClass} value={formModelType} onChange={e => setFormModelType(e.target.value)}>
                    <option value="cpa_new_repeat">CPA (New / Repeat)</option>
                    <option value="pct_spend_new_repeat">% of Spend (New / Repeat)</option>
                    <option value="blended_commission">Blended Commission</option>
                    <option value="fixed_fee">Fixed Monthly Fee</option>
                  </select>
                </div>

                {formModelType === 'cpa_new_repeat' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>CPA New (£)</label>
                      <input className={inputClass} type="number" step="0.01" value={formCpaNew}
                        onChange={e => setFormCpaNew(e.target.value)} placeholder="20.00" />
                    </div>
                    <div>
                      <label className={labelClass}>CPA Repeat (£)</label>
                      <input className={inputClass} type="number" step="0.01" value={formCpaRepeat}
                        onChange={e => setFormCpaRepeat(e.target.value)} placeholder="12.50" />
                    </div>
                  </div>
                )}

                {formModelType === 'pct_spend_new_repeat' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={labelClass}>% New</label>
                      <input className={inputClass} type="number" step="0.1" value={formPctNew}
                        onChange={e => setFormPctNew(e.target.value)} placeholder="8" />
                    </div>
                    <div>
                      <label className={labelClass}>% Repeat</label>
                      <input className={inputClass} type="number" step="0.1" value={formPctRepeat}
                        onChange={e => setFormPctRepeat(e.target.value)} placeholder="1" />
                    </div>
                  </div>
                )}

                {formModelType === 'blended_commission' && (
                  <div>
                    <label className={labelClass}>Blended Rate (%)</label>
                    <input className={inputClass} type="number" step="0.1" value={formBlended}
                      onChange={e => setFormBlended(e.target.value)} placeholder="5" />
                  </div>
                )}

                {formModelType === 'fixed_fee' && (
                  <div>
                    <label className={labelClass}>Fixed Monthly Fee (£)</label>
                    <input className={inputClass} type="number" step="0.01" value={formFixed}
                      onChange={e => setFormFixed(e.target.value)} placeholder="500" />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button onClick={() => setShowForm(false)} className={btnSecondary + ' px-4 py-2 text-sm'}>Cancel</button>
                <button onClick={savePartner} disabled={saving || !formName || !formDisplayName || !formBaseline}
                  className={btnPrimary}>
                  {saving ? 'Saving…' : editingPartner ? 'Save Changes' : 'Create Partner'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Periods Modal ── */}
        {editingPeriods !== null && periodPartner && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-float max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-display font-semibold text-ink-900 tracking-display mb-1">
                Active Periods
              </h2>
              <p className="text-sm text-ink-400 mb-6 font-mono">{periodPartner}</p>

              {/* Existing periods */}
              <div className="space-y-2 mb-6">
                {editingPeriods.length === 0 && (
                  <p className="text-sm text-ink-400 italic">No active periods configured.</p>
                )}
                {editingPeriods.map((period, i) => (
                  <div key={i} className="flex items-center gap-3 bg-sand-50 rounded-xl px-4 py-2.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${period.end_date === null ? 'bg-emerald-400' : 'bg-gray-300'}`} />
                    <span className="text-sm text-ink-700 flex-1">
                      {fmtDate(period.start_date)}
                      <span className="text-ink-300 mx-1.5"><ArrowRight className="inline-block w-3 h-3" /></span>
                      {period.end_date ? fmtDate(period.end_date) : <span className="text-emerald-600 font-medium">ongoing</span>}
                    </span>
                    <button onClick={() => removePeriod(i)}
                      className="text-red-400 hover:text-red-600 text-sm w-5 h-5 flex items-center justify-center rounded hover:bg-red-50 transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add period */}
              <div className="bg-sand-50 rounded-xl p-4">
                <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-caps mb-3">Add period</p>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <label className={labelClass}>Start</label>
                    <input className={inputClass} type="date" value={newPeriodStart}
                      onChange={e => setNewPeriodStart(e.target.value)} />
                  </div>
                  <div className="flex-1">
                    <label className={labelClass}>End (leave blank = ongoing)</label>
                    <input className={inputClass} type="date" value={newPeriodEnd}
                      onChange={e => setNewPeriodEnd(e.target.value)} />
                  </div>
                  <button onClick={addPeriod} disabled={!newPeriodStart}
                    className="px-3 py-2 bg-ink-800 text-white text-sm rounded-lg hover:bg-ink-700 disabled:opacity-50 shrink-0">
                    Add
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button onClick={() => { setEditingPeriods(null); setPeriodPartner(null) }} className={btnSecondary + ' px-4 py-2 text-sm'}>
                  Cancel
                </button>
                <button onClick={savePeriods} disabled={saving} className={btnPrimary}>
                  {saving ? 'Saving…' : 'Save Periods'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
