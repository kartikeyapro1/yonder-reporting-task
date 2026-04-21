/**
 * GET /api/partners/[id]/export?format=html|pdf|email
 *
 * Generates a self-contained report for the given partner.
 *
 * Formats:
 * - html:  Returns HTML document (Content-Disposition: attachment)
 * - pdf:   Returns PDF via headless rendering (requires puppeteer in production)
 * - email: Returns inline HTML optimised for email clients
 *
 * For PDF generation in production, install puppeteer:
 *   npm install puppeteer
 *
 * In development without puppeteer, falls back to HTML download.
 */

import { NextResponse } from 'next/server'
import { requireStaffAuth } from '@/lib/auth'
import { getPartnerReportSummary } from '@/lib/reporting/partner-report-summary'
import { getPartnerBySlug, getPartnerByToken } from '@/lib/config/partner-commercials'
import { generateReportHtml } from '@/lib/reporting/report-generator'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(req: Request, { params }: Params) {
  const { id } = await params
  const url = new URL(req.url)
  const format = (url.searchParams.get('format') ?? 'html') as 'html' | 'pdf' | 'email'

  // Support both slug (internal staff) and opaque token (partner-facing) lookups.
  // Token-based access is intentionally unauthenticated — same security model as /report/[token].
  const config = getPartnerBySlug(id) ?? getPartnerByToken(id)

  // If resolved by slug (not token), require staff auth
  const resolvedByToken = !getPartnerBySlug(id) && !!getPartnerByToken(id)
  if (!resolvedByToken) {
    const auth = await requireStaffAuth()
    if (auth instanceof NextResponse) return auth
  }
  if (!config) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
  }

  const summary = getPartnerReportSummary(config.partner_name)
  if (!summary) {
    return NextResponse.json({ error: 'No data for partner' }, { status: 404 })
  }

  const html = generateReportHtml(summary, {
    format,
    includeMonthlyBreakdown: true,
  })

  const filename = `${config.display_name.toLowerCase().replace(/\s+/g, '-')}-report-${new Date().toISOString().slice(0, 10)}`

  if (format === 'pdf') {
    // Try puppeteer for real PDF generation
    try {
      const puppeteer = require('puppeteer')
      const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] })
      const page = await browser.newPage()
      await page.setContent(html, { waitUntil: 'networkidle0' })
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '20mm', right: '15mm', bottom: '20mm', left: '15mm' },
      })
      await browser.close()

      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}.pdf"`,
        },
      })
    } catch {
      // Puppeteer not installed — fall back to HTML with PDF-optimised styles
      return new NextResponse(html, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}.html"`,
        },
      })
    }
  }

  if (format === 'email') {
    // Return raw HTML for embedding in emails (no Content-Disposition)
    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  }

  // Default: downloadable HTML
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}.html"`,
    },
  })
}
