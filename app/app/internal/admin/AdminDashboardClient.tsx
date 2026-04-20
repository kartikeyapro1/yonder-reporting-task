'use client'

import { useState } from 'react'
import Link from 'next/link'
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

function fmtDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function commercialSummary(c: CommercialModel): string {
  switch (c.type) {
    case 'cpa_new_repeat':
      return `£${c.cpa_new ?? 0} new / £${c.cpa_repeat ?? 0} repeat`
    case 'pct_spend_new_repeat':
      return `${((c.pct_new ?? 0) * 100).toFixed(1)}% new / ${((c.pct_repeat ?? 0) * 100).toFixed(1)}% repeat`
    case 'blended_commission':
      return `${((c.blended_rate ?? 0) * 100).toFixed(1)}% blended`
    case 'fixed_fee':
      return `£${c.fixed_monthly ?? 0}/month`
    default:
      return c.type
  }
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
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return
    const res = await fetch(`/api/admin/partners/${encodeURIComponent(name)}`, { method: 'DELETE' })
    if (res.ok) {
      setPartners(prev => prev.filter(p => p.partner_name !== name))
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

  // ── Layout ──────────────────────────────────────────────────────

  const inputClass = 'w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral/30 transition-all'
  const labelClass = 'block text-[11px] font-semibold text-ink-400 uppercase tracking-caps mb-1.5'
  const btnPrimary = 'px-4 py-2 bg-coral text-white text-sm font-semibold rounded-lg hover:bg-coral-light transition-colors disabled:opacity-50'
  const btnSecondary = 'px-4 py-2 bg-sand-100 text-ink-600 text-sm font-semibold rounded-lg hover:bg-sand-200 transition-colors'

  return (
    <div className="min-h-screen bg-sand-50">
      <Header section="internal" />

      <div className="max-w-screen-xl mx-auto px-6 pt-8 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-ink-400 mb-6">
          <Link href="/internal" className="hover:text-ink-600 transition-colors">Dashboard</Link>
          <span>›</span>
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
        <StaggerList className="grid gap-4">
          {partners.map(p => (
            <StaggerItem key={p.partner_name}>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold text-ink-900">{p.display_name}</h3>
                      <span className="text-[11px] font-semibold text-ink-400 uppercase tracking-caps bg-sand-100 px-2 py-0.5 rounded-md">
                        {p.category}
                      </span>
                    </div>
                    <p className="text-xs text-ink-400 mt-1 font-mono">{p.partner_name}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => openPeriods(p.partner_name)} className={btnSecondary}>
                      Periods
                    </button>
                    <button onClick={() => openEditPartner(p)} className={btnSecondary}>
                      Edit
                    </button>
                    <button onClick={() => deletePartnerHandler(p.partner_name)}
                      className="px-3 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                      Delete
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6 mt-5 pt-5 border-t border-gray-100">
                  <div>
                    <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Baseline</p>
                    <p className="text-sm text-ink-700 mt-1">{fmtDate(p.baseline_date)}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Token</p>
                    <p className="text-sm text-ink-700 mt-1 font-mono">{p.partner_token}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Model</p>
                    <p className="text-sm text-ink-700 mt-1">
                      {p.commercials.length > 0 ? MODEL_LABELS[p.commercials[0].type] ?? p.commercials[0].type : '—'}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-caps">Rates</p>
                    <p className="text-sm text-ink-700 mt-1">
                      {p.commercials.length > 0 ? commercialSummary(p.commercials[0]) : '—'}
                    </p>
                  </div>
                </div>

                {/* Active Periods Summary */}
                {p.active_periods.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-caps mb-2">
                      Active Periods ({p.active_periods.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {p.active_periods.map((ap, i) => (
                        <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">
                          {fmtDate(ap.start_date)} → {ap.end_date ? fmtDate(ap.end_date) : 'ongoing'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </StaggerItem>
          ))}
        </StaggerList>

        {/* ── Partner Form Modal ── */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-float max-w-lg w-full mx-4 p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-display font-semibold text-ink-900 tracking-display mb-6">
                {editingPartner ? 'Edit Partner' : 'New Partner'}
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
                <button onClick={() => setShowForm(false)} className={btnSecondary}>Cancel</button>
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
              <h2 className="text-lg font-display font-semibold text-ink-900 tracking-display mb-2">
                Active Periods
              </h2>
              <p className="text-sm text-ink-400 mb-6">{periodPartner}</p>

              {/* Existing periods */}
              <div className="space-y-2 mb-6">
                {editingPeriods.length === 0 && (
                  <p className="text-sm text-ink-400 italic">No active periods configured.</p>
                )}
                {editingPeriods.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 bg-sand-50 rounded-lg px-3 py-2">
                    <span className="text-sm text-ink-700 flex-1">
                      {fmtDate(p.start_date)} → {p.end_date ? fmtDate(p.end_date) : 'ongoing'}
                    </span>
                    <button onClick={() => removePeriod(i)} className="text-red-400 hover:text-red-600 text-sm">
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add period */}
              <div className="flex items-end gap-3">
                <div className="flex-1">
                  <label className={labelClass}>Start Date</label>
                  <input className={inputClass} type="date" value={newPeriodStart}
                    onChange={e => setNewPeriodStart(e.target.value)} />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>End Date (optional)</label>
                  <input className={inputClass} type="date" value={newPeriodEnd}
                    onChange={e => setNewPeriodEnd(e.target.value)} />
                </div>
                <button onClick={addPeriod} disabled={!newPeriodStart}
                  className="px-3 py-2 bg-ink-800 text-white text-sm rounded-lg hover:bg-ink-700 disabled:opacity-50">
                  Add
                </button>
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100">
                <button onClick={() => { setEditingPeriods(null); setPeriodPartner(null) }} className={btnSecondary}>
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
