import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { Header } from '@/components/layout/Header'
import { InternalPartnerDetailClient } from './InternalPartnerDetailClient'
import { getPartnerReportSummary } from '@/lib/reporting/partner-report-summary'
import { getPartnerBySlug } from '@/lib/config/partner-commercials'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const config = getPartnerBySlug(id)
  return { title: config ? config.display_name : 'Partner Detail' }
}

function makeCachedSummary(partnerName: string) {
  return unstable_cache(
    async () => getPartnerReportSummary(partnerName),
    [`partner-summary-${partnerName}`],
    { revalidate: 3600, tags: ['partner-data', `partner-${partnerName}`] }
  )()
}

export default async function InternalPartnerPage({ params }: Props) {
  const { id } = await params

  const config = getPartnerBySlug(id)
  if (!config) notFound()

  const summary = await makeCachedSummary(config.partner_name)
  if (!summary) notFound()

  return (
    <div className="min-h-screen bg-gray-50">
      <Header section="internal" partnerName={summary.display_name} />
      <InternalPartnerDetailClient summary={summary} />
    </div>
  )
}
