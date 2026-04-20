import type { Metadata } from 'next'
import { AdminDashboardClient } from './AdminDashboardClient'
import { getPartners } from '@/lib/data/config-store'

export const metadata: Metadata = {
  title: 'Partner Configuration',
}

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const partners = getPartners()
  return <AdminDashboardClient partners={partners} />
}
