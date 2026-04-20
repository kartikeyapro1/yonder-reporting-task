import { YonderLoader } from '@/components/brand/YonderLoader'

export default function PartnerFacingLoading() {
  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center bg-sand-50">
      <YonderLoader size="lg" />
      <p className="text-sm text-ink-300 mt-6 animate-pulse">Preparing your report…</p>
    </div>
  )
}
