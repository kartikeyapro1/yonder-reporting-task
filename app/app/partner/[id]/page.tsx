import { notFound } from 'next/navigation'
import { PartnerFacingClient } from './PartnerFacingClient'
import { getPartnerReportSummary } from '@/lib/reporting/partner-report-summary'
import { getPartnerByToken } from '@/lib/config/partner-commercials'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const config = getPartnerByToken(id)
  return { title: config ? `${config.display_name} — Partnership` : 'Partner Report' }
}

export default async function PartnerFacingPage({ params }: Props) {
  const { id } = await params

  // Partner-facing routes use opaque tokens, not predictable slugs
  const config = getPartnerByToken(id)
  if (!config) notFound()

  const summary = getPartnerReportSummary(config.partner_name)
  if (!summary) notFound()

  return <PartnerFacingClient summary={summary} />
}
