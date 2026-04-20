/**
 * GET  /api/admin/partners — List all partner configs
 * POST /api/admin/partners — Create or update a partner config
 *
 * Admin-only endpoints. In production these are protected by auth middleware.
 */

import { NextResponse } from 'next/server'
import { getPartners, upsertPartner } from '@/lib/data/config-store'
import type { PartnerConfig } from '@/lib/types'

export async function GET() {
  const partners = getPartners()
  return NextResponse.json(partners)
}

export async function POST(req: Request) {
  try {
    const body = await req.json() as PartnerConfig

    // Validate required fields
    if (!body.partner_name || !body.display_name || !body.baseline_date) {
      return NextResponse.json(
        { error: 'partner_name, display_name, and baseline_date are required' },
        { status: 400 }
      )
    }

    // Generate token if not provided
    if (!body.partner_token) {
      body.partner_token = crypto.randomUUID().replace(/-/g, '').slice(0, 12)
    }

    // Ensure arrays exist
    body.active_periods = body.active_periods ?? []
    body.commercials = body.commercials ?? []
    body.category = body.category ?? 'Other'

    const saved = upsertPartner(body)
    return NextResponse.json(saved, { status: 201 })
  } catch (err) {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400 }
    )
  }
}
