import { YonderLoader } from '@/components/brand/YonderLoader'

export default function ReportLoading() {
  return (
    <div className="min-h-screen bg-sand-50">
      {/* Dark header skeleton */}
      <div className="bg-ink-950 h-48" />

      <div className="max-w-3xl mx-auto px-8 py-10">
        {/* Section skeletons */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="mb-10">
            <div className="h-3 w-32 bg-sand-200/60 rounded animate-pulse mb-4" />
            <div className="bg-white rounded-2xl border border-gray-200/60 p-5 shadow-card animate-pulse">
              <div className="h-4 w-full bg-sand-200/30 rounded mb-3" />
              <div className="h-4 w-4/5 bg-sand-200/30 rounded mb-3" />
              <div className="h-4 w-3/5 bg-sand-200/30 rounded" />
            </div>
          </div>
        ))}

        {/* Centered Y draw animation */}
        <div className="flex justify-center py-12">
          <YonderLoader size="lg" />
        </div>
      </div>
    </div>
  )
}
