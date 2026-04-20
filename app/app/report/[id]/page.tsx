import { notFound } from 'next/navigation'
import { getPartnerReportSummary } from '@/lib/reporting/partner-report-summary'
import { PARTNER_CONFIGS, getPartnerConfig } from '@/lib/config/partner-commercials'
import { ReportPage } from './ReportPage'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AutomatedReportPage({ params }: Props) {
  const { id } = await params

  const config = PARTNER_CONFIGS.find(
    c => c.partner_name.toLowerCase().replace(/\s+/g, '-') === id
  )
  if (!config) notFound()

  const summary = getPartnerReportSummary(config.partner_name)
  if (!summary) notFound()

  const partnerConfig = getPartnerConfig(config.partner_name)

  return <ReportPage summary={summary} commercials={partnerConfig?.commercials ?? []} />
}
