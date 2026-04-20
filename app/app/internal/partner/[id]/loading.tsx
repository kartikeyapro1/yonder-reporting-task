import { YonderLoader } from '@/components/brand/YonderLoader'

export default function InternalPartnerLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 glass border-b border-gray-200/60 h-14" />

      <div className="max-w-screen-xl mx-auto px-6 pt-8">
        {/* Breadcrumb + heading */}
        <div className="mb-8">
          <div className="h-3 w-40 bg-sand-200/40 rounded animate-pulse mb-4" />
          <div className="h-8 w-64 bg-sand-200/60 rounded-xl animate-pulse" />
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200/60 p-4 h-20 animate-pulse">
              <div className="h-3 w-14 bg-sand-200/60 rounded mb-2" />
              <div className="h-6 w-20 bg-sand-200/40 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200/60 p-5 h-80 animate-pulse">
            <div className="h-3 w-32 bg-sand-200/60 rounded mb-4" />
            <div className="h-full bg-sand-100/50 rounded-xl" />
          </div>
          <div className="bg-white rounded-2xl border border-gray-200/60 p-5 h-80 animate-pulse">
            <div className="h-3 w-24 bg-sand-200/60 rounded mb-4" />
            <div className="space-y-3 mt-6">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-4 bg-sand-200/30 rounded" style={{ width: `${80 - i * 10}%` }} />
              ))}
            </div>
          </div>
        </div>

        {/* Centered Y draw animation */}
        <div className="flex justify-center py-12">
          <YonderLoader size="lg" />
        </div>
      </div>
    </div>
  )
}
