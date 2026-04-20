import { getPartnerTransactionFacts } from '../lib/reporting/partner-transaction-facts'
import { getPartnerReportSummary } from '../lib/reporting/partner-report-summary'
import { getPartnerConfig } from '../lib/config/partner-commercials'
import { getPartnerMonthlyMetrics } from '../lib/reporting/partner-monthly-metrics'

// ── FRIVE ──────────────────────────────────────────
console.log('=== FRIVE VALIDATION ===')
const fConfig = getPartnerConfig('FRIVE')
const fFacts = getPartnerTransactionFacts('FRIVE')
const fSummary = getPartnerReportSummary('FRIVE')
const fMonthly = getPartnerMonthlyMetrics('FRIVE')

if (fConfig && fSummary) {
  const baseline = new Date(fConfig.baseline_date)
  const settled = fFacts.filter(f => f.is_settled && f.timestamp >= baseline)
  const onFacts = settled.filter(f => f.is_on_yonder)
  const offFacts = settled.filter(f => !f.is_on_yonder)
  const newOnFacts = settled.filter(f => f.is_new_customer && f.is_on_yonder)
  const repeatOnFacts = settled.filter(f => !f.is_new_customer && f.is_on_yonder)

  console.log('Total facts (all time):', fFacts.length)
  console.log('Post-baseline settled:', settled.length)
  console.log('On-Yonder txns:', onFacts.length, '| Off-Yonder:', offFacts.length)
  console.log('New txns:', settled.filter(f => f.is_new_customer).length)
  console.log('')
  console.log('Revenue check:')
  console.log('  New on-Yonder:', newOnFacts.length, '@ 20 CPA =', newOnFacts.length * 20)
  console.log('  Repeat on-Yonder:', repeatOnFacts.length, '@ 12.50 CPA =', repeatOnFacts.length * 12.5)
  console.log('  Expected revenue:', newOnFacts.length * 20 + repeatOnFacts.length * 12.5)
  console.log('  Actual revenue:', settled.reduce((s, f) => s + f.revenue_contribution, 0).toFixed(2))
  console.log('')
  console.log('Incremental spend:')
  console.log('  On spend:', fSummary.on_yonder_spend.toFixed(2))
  console.log('  Off spend:', fSummary.off_yonder_spend.toFixed(2))
  console.log('  On months:', fSummary.on_months_count, '| Off months:', fSummary.off_months_count)
  console.log('  Avg monthly on:', fSummary.avg_monthly_on_spend.toFixed(2))
  console.log('  Avg monthly off:', fSummary.avg_monthly_off_spend.toFixed(2))
  console.log('  Incremental (avg on - avg off):', fSummary.incremental_spend.toFixed(2))
  console.log('')

  // Monthly breakdown
  console.log('Monthly on/off breakdown:')
  const months = new Map<string, {on: number, off: number, onSpend: number, offSpend: number}>()
  for (const f of settled) {
    const ym = f.year_month
    if (!months.has(ym)) months.set(ym, {on: 0, off: 0, onSpend: 0, offSpend: 0})
    const m = months.get(ym)!
    if (f.is_on_yonder) { m.on++; m.onSpend += f.trans_amount_gbp }
    else { m.off++; m.offSpend += f.trans_amount_gbp }
  }
  for (const [ym, m] of [...months.entries()].sort()) {
    console.log(`  ${ym} | ON: ${m.on} (${m.onSpend.toFixed(0)}) | OFF: ${m.off} (${m.offSpend.toFixed(0)})`)
  }
}

// ── Gopuff ──────────────────────────────────────────
console.log('\n=== GOPUFF VALIDATION ===')
const gConfig = getPartnerConfig('Gopuff')
const gFacts = getPartnerTransactionFacts('Gopuff')
const gSummary = getPartnerReportSummary('Gopuff')

if (gConfig && gSummary) {
  const baseline = new Date(gConfig.baseline_date)
  const settled = gFacts.filter(f => f.is_settled && f.timestamp >= baseline)

  console.log('Total facts (all time):', gFacts.length)
  console.log('Post-baseline settled:', settled.length)
  console.log('Summary:', JSON.stringify({
    total_spend: gSummary.total_spend_gbp.toFixed(2),
    total_revenue: gSummary.total_revenue.toFixed(2),
    total_tx: gSummary.total_transactions,
    new_tx: gSummary.new_transactions,
    repeat_tx: gSummary.repeat_transactions,
  }))

  // Check revenue: 8% new, 1% repeat
  for (const f of settled) {
    const rate = f.is_new_customer ? 0.08 : 0.01
    const expected = f.is_on_yonder ? f.trans_amount_gbp * rate : 0
    if (Math.abs(f.revenue_contribution - expected) > 0.01) {
      console.log('  MISMATCH:', f.transaction_id, 'expected', expected.toFixed(2), 'got', f.revenue_contribution.toFixed(2), 'new?', f.is_new_customer, 'on?', f.is_on_yonder)
    }
  }
  console.log('Revenue check passed (no mismatches = good)')
}

console.log('\n=== INSIGHTS ===')
if (fSummary) {
  console.log('FRIVE insights:')
  fSummary.insights.forEach((i, idx) => console.log(`  ${idx + 1}. ${i}`))
}
if (gSummary) {
  console.log('Gopuff insights:')
  gSummary.insights.forEach((i, idx) => console.log(`  ${idx + 1}. ${i}`))
}
