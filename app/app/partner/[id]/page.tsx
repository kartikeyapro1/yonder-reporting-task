import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
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

function makeCachedSummary(partnerName: string) {
  return unstable_cache(
    async () => getPartnerReportSummary(partnerName),
    [`partner-summary-${partnerName}`],
    { revalidate: 3600, tags: ['partner-data', `partner-${partnerName}`] }
  )()
}

export default async function PartnerFacingPage({ params }: Props) {
  const { id } = await params

  const config = getPartnerByToken(id)
  if (!config) notFound()

  const summary = await makeCachedSummary(config.partner_name)
  if (!summary) notFound()

  return <PartnerFacingClient summary={summary} />
}
