/**
 * report-scheduler.ts
 *
 * Scheduling and delivery logic for automated partner reports.
 *
 * Architecture:
 * 1. A cron endpoint (/api/cron/reports) runs monthly (or on-demand)
 * 2. For each active partner, it generates an HTML report
 * 3. Optionally sends the report via email (Resend API)
 * 4. Logs the generation event to the report history store
 *
 * In production, trigger via:
 * - Vercel Cron Jobs (vercel.json schedule)
 * - External cron service (e.g. Inngest, Trigger.dev)
 * - Manual trigger from admin UI
 *
 * Email delivery uses Resend (https://resend.com) — set RESEND_API_KEY.
 * Falls back to logging if no API key is configured.
 */

import { getAllPartnerSummaries } from '@/lib/reporting/partner-report-summary'
import { getPartnerConfig, PARTNER_CONFIGS } from '@/lib/config/partner-commercials'
import { generateReportHtml } from '@/lib/reporting/report-generator'
import type { PartnerSummaryMetrics } from '@/lib/types'

// ─── Report history (in-memory, persisted to JSON) ──────────────────────────

export interface ReportHistoryEntry {
  id: string
  partner_name: string
  display_name: string
  generated_at: string      // ISO timestamp
  period_label: string
  format: 'html' | 'pdf' | 'email'
  delivery_status: 'generated' | 'sent' | 'failed'
  delivery_email?: string
  error?: string
}

let _history: ReportHistoryEntry[] = []

export function getReportHistory(partnerName?: string): ReportHistoryEntry[] {
  if (partnerName) return _history.filter(h => h.partner_name === partnerName)
  return _history
}

export function addToHistory(entry: ReportHistoryEntry): void {
  _history.unshift(entry) // newest first
  // Keep last 200 entries in memory
  if (_history.length > 200) _history = _history.slice(0, 200)
}

// ─── Email delivery ──────────────────────────────────────────────────────────

async function sendReportEmail(
  to: string,
  subject: string,
  html: string
): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log(`[report-scheduler] Email skipped (no RESEND_API_KEY): ${subject} → ${to}`)
    return { ok: false, error: 'No RESEND_API_KEY configured' }
  }

  const from = process.env.REPORT_FROM_EMAIL ?? 'reports@yonder.com'

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to, subject, html }),
    })

    if (res.ok) {
      return { ok: true }
    }
    const err = await res.text()
    return { ok: false, error: `Resend API ${res.status}: ${err}` }
  } catch (e) {
    return { ok: false, error: String(e) }
  }
}

// ─── Report generation ───────────────────────────────────────────────────────

export interface GenerateReportOptions {
  partnerName?: string   // Generate for a specific partner (or all if omitted)
  sendEmail?: boolean    // Whether to send via email
  emailTo?: string       // Override recipient email
}

export interface GenerateReportResult {
  partner_name: string
  display_name: string
  status: 'success' | 'no_data' | 'email_failed'
  html_length?: number
  email_sent?: boolean
  error?: string
}

export async function generateReports(
  options: GenerateReportOptions = {}
): Promise<GenerateReportResult[]> {
  const results: GenerateReportResult[] = []

  // Get all summaries or just one
  const summaries = options.partnerName
    ? [getAllPartnerSummaries().find(s => s.partner_name === options.partnerName)].filter(Boolean) as PartnerSummaryMetrics[]
    : getAllPartnerSummaries()

  for (const summary of summaries) {
    const config = getPartnerConfig(summary.partner_name)
    if (!config) continue

    const html = generateReportHtml(summary, {
      format: options.sendEmail ? 'email' : 'html',
      includeMonthlyBreakdown: true,
    })

    const historyEntry: ReportHistoryEntry = {
      id: crypto.randomUUID(),
      partner_name: summary.partner_name,
      display_name: summary.display_name,
      generated_at: new Date().toISOString(),
      period_label: summary.period_label,
      format: options.sendEmail ? 'email' : 'html',
      delivery_status: 'generated',
    }

    if (options.sendEmail) {
      const to = options.emailTo ?? `partner-reports@yonder.com`
      const subject = `${summary.display_name} — Partner Report (${summary.period_label})`

      const emailResult = await sendReportEmail(to, subject, html)

      if (emailResult.ok) {
        historyEntry.delivery_status = 'sent'
        historyEntry.delivery_email = to
      } else {
        historyEntry.delivery_status = 'failed'
        historyEntry.error = emailResult.error
      }

      results.push({
        partner_name: summary.partner_name,
        display_name: summary.display_name,
        status: emailResult.ok ? 'success' : 'email_failed',
        html_length: html.length,
        email_sent: emailResult.ok,
        error: emailResult.error,
      })
    } else {
      results.push({
        partner_name: summary.partner_name,
        display_name: summary.display_name,
        status: 'success',
        html_length: html.length,
      })
    }

    addToHistory(historyEntry)
  }

  return results
}
