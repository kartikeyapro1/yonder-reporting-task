import { notFound } from 'next/navigation'
import { getPartnerReportSummary } from '@/lib/reporting/partner-report-summary'
import { getPartnerByToken, getPartnerConfig } from '@/lib/config/partner-commercials'
import { ReportPage } from './ReportPage'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const config = getPartnerByToken(id)
  return { title: config ? `${config.display_name} — Full Report` : 'Report' }
}

export default async function AutomatedReportPage({ params }: Props) {
  const { id } = await params

  // Report routes use opaque tokens, not predictable slugs
  const config = getPartnerByToken(id)
  if (!config) notFound()

  const summary = getPartnerReportSummary(config.partner_name)
  if (!summary) notFound()

  const partnerConfig = getPartnerConfig(config.partner_name)

  return <ReportPage summary={summary} commercials={partnerConfig?.commercials ?? []} token={id} />
}
