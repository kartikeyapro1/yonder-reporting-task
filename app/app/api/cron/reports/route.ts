/**
 * /api/cron/reports
 *
 * Cron endpoint for scheduled report generation and delivery.
 *
 * - Triggers monthly (Vercel Cron or external)
 * - Generates reports for all partners
 * - Optionally sends via email (if RESEND_API_KEY is set)
 * - Logs results to report history
 *
 * POST body (optional):
 *   { sendEmail?: boolean, emailTo?: string, partnerName?: string }
 *
 * GET: Returns recent report history
 */

import { NextResponse } from 'next/server'
import { generateReports, getReportHistory } from '@/lib/reporting/report-scheduler'

export async function GET() {
  // Return the last 50 report history entries
  return NextResponse.json({ history: getReportHistory().slice(0, 50) })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { sendEmail, emailTo, partnerName } = body
  const results = await generateReports({ sendEmail, emailTo, partnerName })
  return NextResponse.json({ results })
}
