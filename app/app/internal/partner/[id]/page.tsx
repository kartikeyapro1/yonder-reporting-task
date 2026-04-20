import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { InternalPartnerDetailClient } from './InternalPartnerDetailClient'
import { getPartnerReportSummary } from '@/lib/reporting/partner-report-summary'
import { PARTNER_CONFIGS } from '@/lib/config/partner-commercials'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function InternalPartnerPage({ params }: Props) {
  const { id } = await params

  const config = PARTNER_CONFIGS.find(
    c => c.partner_name.toLowerCase().replace(/\s+/g, '-') === id
  )
  if (!config) notFound()

  const summary = getPartnerReportSummary(config.partner_name)
  if (!summary) notFound()

  return (
    <div className="min-h-screen bg-surface-muted">
      <Header section="partner" partnerName={summary.display_name} />
      <InternalPartnerDetailClient summary={summary} />
    </div>
  )
}
