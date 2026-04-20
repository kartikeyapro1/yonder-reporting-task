/**
 * GET    /api/admin/partners/[name] — Get single partner config
 * PUT    /api/admin/partners/[name] — Update partner config
 * DELETE /api/admin/partners/[name] — Delete partner
 *
 * [name] is the canonical partner_name (URL-encoded if spaces, e.g. "Pizza%20Pilgrims").
 */

import { NextResponse } from 'next/server'
import { getPartner, upsertPartner, deletePartner } from '@/lib/data/config-store'

interface Params {
  params: Promise<{ name: string }>
}

export async function GET(_req: Request, { params }: Params) {
  const { name } = await params
  const decoded = decodeURIComponent(name)
  const partner = getPartner(decoded)

  if (!partner) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
  }
  return NextResponse.json(partner)
}

export async function PUT(req: Request, { params }: Params) {
  const { name } = await params
  const decoded = decodeURIComponent(name)

  try {
    const body = await req.json()
    // Ensure the partner_name matches the URL param
    body.partner_name = decoded
    const saved = upsertPartner(body)
    return NextResponse.json(saved)
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  const { name } = await params
  const decoded = decodeURIComponent(name)

  const deleted = deletePartner(decoded)
  if (!deleted) {
    return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
  }
  return NextResponse.json({ ok: true })
}
