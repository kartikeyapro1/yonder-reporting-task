/**
 * report-generator.ts
 *
 * Server-side report generation for partner summaries.
 * Produces self-contained HTML that can be:
 * - Rendered as a PDF (via Puppeteer / headless Chrome)
 * - Sent directly as an email body
 * - Downloaded as a standalone HTML file
 *
 * The HTML is fully inline-styled (no external CSS dependencies)
 * so it renders correctly in email clients and PDF renderers.
 */

import type { PartnerSummaryMetrics, PartnerMonthlyMetrics } from '@/lib/types'
import { getPartnerConfig } from '@/lib/config/partner-commercials'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtGbp(n: number): string {
  if (n >= 1_000_000) return `£${(n / 1_000_000).toFixed(2)}m`
  if (n >= 1_000) return `£${(n / 1_000).toFixed(1)}k`
  return `£${n.toFixed(0)}`
}

function fmtNum(n: number): string {
  return n.toLocaleString('en-GB')
}

function fmtMonth(ym: string): string {
  if (!ym) return '—'
  const [y, m] = ym.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m) - 1]} ${y}`
}

function fmtPct(n: number, total: number): string {
  if (total === 0) return '0%'
  return `${((n / total) * 100).toFixed(1)}%`
}

// ─── Colours ─────────────────────────────────────────────────────────────────

const CORAL = '#F04E37'
const INK_900 = '#1A1F25'
const INK_700 = '#2E353D'
const INK_400 = '#6B7280'
const INK_200 = '#D1D5DB'
const SAND_50 = '#FAF9F7'
const EMERALD = '#059669'
const WHITE = '#FFFFFF'

// ─── Monthly table row ──────────────────────────────────────────────────────

function monthRow(m: PartnerMonthlyMetrics): string {
  const bgColor = m.is_on_yonder ? '#F0FDF4' : WHITE
  const statusDot = m.is_on_yonder
    ? `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${EMERALD};margin-right:6px;"></span>On`
    : `<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${INK_200};margin-right:6px;"></span>Off`

  return `
    <tr style="background:${bgColor};">
      <td style="padding:10px 16px;border-bottom:1px solid #F3F4F6;font-size:13px;color:${INK_700};">${fmtMonth(m.year_month)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #F3F4F6;font-size:13px;color:${INK_700};">${statusDot}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #F3F4F6;font-size:13px;color:${INK_700};text-align:right;">${fmtNum(m.settled_transactions)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #F3F4F6;font-size:13px;color:${INK_700};text-align:right;">${fmtGbp(m.total_spend_gbp)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #F3F4F6;font-size:13px;color:${INK_700};text-align:right;">${fmtGbp(m.total_revenue)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #F3F4F6;font-size:13px;color:${INK_700};text-align:right;">${fmtNum(m.new_transactions)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #F3F4F6;font-size:13px;color:${INK_700};text-align:right;">${fmtNum(m.repeat_transactions)}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #F3F4F6;font-size:13px;color:${INK_700};text-align:right;">${fmtNum(m.unique_users)}</td>
    </tr>
  `
}

// ─── Main generator ──────────────────────────────────────────────────────────

export interface ReportOptions {
  /** 'pdf' optimises for print (page breaks, @page margins) */
  format: 'pdf' | 'email' | 'html'
  /** Include the monthly breakdown table */
  includeMonthlyBreakdown?: boolean
  /** Custom footer text */
  footer?: string
}

export function generateReportHtml(
  summary: PartnerSummaryMetrics,
  options: ReportOptions = { format: 'html', includeMonthlyBreakdown: true }
): string {
  const config = getPartnerConfig(summary.partner_name)
  const displayName = summary.display_name
  const generatedAt = new Date().toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  const pageStyles = options.format === 'pdf' ? `
    @page {
      size: A4;
      margin: 20mm 15mm;
    }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page-break { page-break-before: always; }
    }
  ` : ''

  const insightsList = summary.insights.map(insight => `
    <li style="margin-bottom:8px;padding-left:12px;position:relative;">
      <span style="position:absolute;left:0;color:${CORAL};">→</span>
      ${insight}
    </li>
  `).join('')

  const monthlyRows = (options.includeMonthlyBreakdown !== false)
    ? summary.monthly_breakdown.map(monthRow).join('')
    : ''

  // Commercial model description
  let commercialDesc = ''
  if (config?.commercials[0]) {
    const c = config.commercials[0]
    switch (c.type) {
      case 'cpa_new_repeat':
        commercialDesc = `CPA: £${c.cpa_new} per new customer, £${c.cpa_repeat} per repeat`
        break
      case 'pct_spend_new_repeat':
        commercialDesc = `Commission: ${((c.pct_new ?? 0) * 100).toFixed(1)}% on new spend, ${((c.pct_repeat ?? 0) * 100).toFixed(1)}% on repeat`
        break
      case 'blended_commission':
        commercialDesc = `Blended commission: ${((c.blended_rate ?? 0) * 100).toFixed(1)}%`
        break
      case 'fixed_fee':
        commercialDesc = `Fixed fee: £${c.fixed_monthly}/month`
        break
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${displayName} — Partner Report</title>
  <style>
    ${pageStyles}
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif; color: ${INK_700}; background: ${WHITE}; line-height: 1.5; }
    table { border-collapse: collapse; width: 100%; }
  </style>
</head>
<body>

  <!-- Header -->
  <div style="background:${INK_900};padding:32px 40px;">
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div>
        <div style="font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.12em;margin-bottom:8px;">Partner Report</div>
        <div style="font-size:28px;font-weight:700;color:${WHITE};letter-spacing:-0.02em;">${displayName}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.12em;margin-bottom:4px;">Period</div>
        <div style="font-size:14px;color:${INK_200};">${summary.period_label}</div>
        <div style="font-size:11px;color:${INK_400};margin-top:4px;">Generated ${generatedAt}</div>
      </div>
    </div>
  </div>

  <!-- KPI Cards -->
  <div style="padding:32px 40px;background:${SAND_50};">
    <table>
      <tr>
        <td style="width:25%;padding:0 8px 0 0;">
          <div style="background:${WHITE};border:1px solid #F3F4F6;border-radius:12px;padding:20px;">
            <div style="font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.12em;">Total Spend</div>
            <div style="font-size:24px;font-weight:700;color:${INK_900};margin-top:8px;">${fmtGbp(summary.total_spend_gbp)}</div>
          </div>
        </td>
        <td style="width:25%;padding:0 8px;">
          <div style="background:${WHITE};border:1px solid #F3F4F6;border-radius:12px;padding:20px;">
            <div style="font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.12em;">Revenue</div>
            <div style="font-size:24px;font-weight:700;color:${CORAL};margin-top:8px;">${fmtGbp(summary.total_revenue)}</div>
          </div>
        </td>
        <td style="width:25%;padding:0 8px;">
          <div style="background:${WHITE};border:1px solid #F3F4F6;border-radius:12px;padding:20px;">
            <div style="font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.12em;">Transactions</div>
            <div style="font-size:24px;font-weight:700;color:${INK_900};margin-top:8px;">${fmtNum(summary.total_transactions)}</div>
          </div>
        </td>
        <td style="width:25%;padding:0 0 0 8px;">
          <div style="background:${WHITE};border:1px solid #F3F4F6;border-radius:12px;padding:20px;">
            <div style="font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.12em;">Unique Customers</div>
            <div style="font-size:24px;font-weight:700;color:${INK_900};margin-top:8px;">${fmtNum(summary.unique_users)}</div>
          </div>
        </td>
      </tr>
    </table>
  </div>

  <!-- Incremental Spend -->
  ${summary.on_months_count > 0 && summary.off_months_count > 0 ? `
  <div style="padding:24px 40px;">
    <div style="background:linear-gradient(135deg, ${INK_900}, #2d3748);border-radius:12px;padding:24px;color:${WHITE};">
      <div style="font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.12em;margin-bottom:12px;">Incremental Spend (On vs Off Yonder)</div>
      <table>
        <tr>
          <td style="width:33%;">
            <div style="font-size:12px;color:${INK_400};">Avg monthly (active)</div>
            <div style="font-size:20px;font-weight:700;color:${EMERALD};margin-top:4px;">${fmtGbp(summary.avg_monthly_on_spend)}</div>
            <div style="font-size:11px;color:${INK_400};">${summary.on_months_count} months</div>
          </td>
          <td style="width:33%;">
            <div style="font-size:12px;color:${INK_400};">Avg monthly (inactive)</div>
            <div style="font-size:20px;font-weight:700;color:${INK_200};margin-top:4px;">${fmtGbp(summary.avg_monthly_off_spend)}</div>
            <div style="font-size:11px;color:${INK_400};">${summary.off_months_count} months</div>
          </td>
          <td style="width:33%;">
            <div style="font-size:12px;color:${INK_400};">Monthly uplift</div>
            <div style="font-size:20px;font-weight:700;color:${CORAL};margin-top:4px;">+${fmtGbp(summary.incremental_spend)}</div>
          </td>
        </tr>
      </table>
    </div>
  </div>
  ` : ''}

  <!-- New vs Existing -->
  <div style="padding:24px 40px;">
    <div style="font-size:16px;font-weight:700;color:${INK_900};margin-bottom:16px;">New vs Existing Customers</div>
    <table style="border:1px solid #F3F4F6;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:${SAND_50};">
          <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.08em;">Segment</th>
          <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.08em;">Transactions</th>
          <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.08em;">Spend</th>
          <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.08em;">Revenue</th>
          <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.08em;">% of Total</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:10px 16px;border-top:1px solid #F3F4F6;font-size:13px;font-weight:600;color:${CORAL};">New customers</td>
          <td style="padding:10px 16px;border-top:1px solid #F3F4F6;font-size:13px;text-align:right;">${fmtNum(summary.new_transactions)}</td>
          <td style="padding:10px 16px;border-top:1px solid #F3F4F6;font-size:13px;text-align:right;">${fmtGbp(summary.new_spend_gbp)}</td>
          <td style="padding:10px 16px;border-top:1px solid #F3F4F6;font-size:13px;text-align:right;">${fmtGbp(summary.new_revenue)}</td>
          <td style="padding:10px 16px;border-top:1px solid #F3F4F6;font-size:13px;text-align:right;">${fmtPct(summary.new_transactions, summary.total_transactions)}</td>
        </tr>
        <tr>
          <td style="padding:10px 16px;border-top:1px solid #F3F4F6;font-size:13px;font-weight:600;color:${INK_700};">Repeat customers</td>
          <td style="padding:10px 16px;border-top:1px solid #F3F4F6;font-size:13px;text-align:right;">${fmtNum(summary.repeat_transactions)}</td>
          <td style="padding:10px 16px;border-top:1px solid #F3F4F6;font-size:13px;text-align:right;">${fmtGbp(summary.repeat_spend_gbp)}</td>
          <td style="padding:10px 16px;border-top:1px solid #F3F4F6;font-size:13px;text-align:right;">${fmtGbp(summary.repeat_revenue)}</td>
          <td style="padding:10px 16px;border-top:1px solid #F3F4F6;font-size:13px;text-align:right;">${fmtPct(summary.repeat_transactions, summary.total_transactions)}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Commercial Terms -->
  ${commercialDesc ? `
  <div style="padding:12px 40px 24px;">
    <div style="font-size:12px;color:${INK_400};">Commercial terms: ${commercialDesc}</div>
  </div>
  ` : ''}

  <!-- Insights -->
  ${summary.insights.length > 0 ? `
  <div style="padding:24px 40px;">
    <div style="font-size:16px;font-weight:700;color:${INK_900};margin-bottom:16px;">Key Insights</div>
    <ul style="list-style:none;font-size:13px;color:${INK_700};line-height:1.8;">
      ${insightsList}
    </ul>
  </div>
  ` : ''}

  <!-- Monthly Breakdown -->
  ${options.includeMonthlyBreakdown !== false && summary.monthly_breakdown.length > 0 ? `
  <div style="padding:24px 40px;" class="page-break">
    <div style="font-size:16px;font-weight:700;color:${INK_900};margin-bottom:16px;">Monthly Breakdown</div>
    <table style="border:1px solid #F3F4F6;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:${SAND_50};">
          <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.08em;">Month</th>
          <th style="padding:10px 16px;text-align:left;font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.08em;">Status</th>
          <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.08em;">Txns</th>
          <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.08em;">Spend</th>
          <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.08em;">Revenue</th>
          <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.08em;">New</th>
          <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.08em;">Repeat</th>
          <th style="padding:10px 16px;text-align:right;font-size:11px;font-weight:600;color:${INK_400};text-transform:uppercase;letter-spacing:0.08em;">Customers</th>
        </tr>
      </thead>
      <tbody>
        ${monthlyRows}
      </tbody>
    </table>
  </div>
  ` : ''}

  <!-- Footer -->
  <div style="padding:24px 40px;border-top:1px solid #F3F4F6;margin-top:24px;">
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <div style="font-size:11px;color:${INK_400};">
        ${options.footer ?? `Confidential — prepared by Yonder for ${displayName}`}
      </div>
      <div style="font-size:11px;color:${INK_400};">
        yonder.com
      </div>
    </div>
  </div>

</body>
</html>`
}
