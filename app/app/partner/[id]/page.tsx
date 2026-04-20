import { notFound } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { PartnerFacingClient } from './PartnerFacingClient'
import { getPartnerReportSummary } from '@/lib/reporting/partner-report-summary'
import { PARTNER_CONFIGS } from '@/lib/config/partner-commercials'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PartnerFacingPage({ params }: Props) {
  const { id } = await params

  const config = PARTNER_CONFIGS.find(
    c => c.partner_name.toLowerCase().replace(/\s+/g, '-') === id
  )
  if (!config) notFound()

  const summary = getPartnerReportSummary(config.partner_name)
  if (!summary) notFound()

  return (
    <div className="min-h-screen bg-white">
      <Header section="partner" partnerName={summary.display_name} />
      <PartnerFacingClient summary={summary} />
    </div>
  )
}
