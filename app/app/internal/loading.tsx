import { YonderLoader } from '@/components/brand/YonderLoader'

export default function InternalLoading() {
  return (
    <div className="min-h-screen bg-sand-50">
      {/* Frozen header skeleton */}
      <div className="sticky top-0 z-40 glass border-b border-gray-200/60 h-14" />

      <div className="max-w-screen-xl mx-auto px-6 pt-12">
        {/* Heading skeleton */}
        <div className="mb-10">
          <div className="h-8 w-56 bg-sand-200/60 rounded-xl animate-pulse" />
          <div className="h-4 w-80 bg-sand-200/40 rounded-lg animate-pulse mt-3" />
        </div>

        {/* Stats bar skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200/60 p-5 h-24 animate-pulse">
              <div className="h-3 w-16 bg-sand-200/60 rounded mb-3" />
              <div className="h-7 w-24 bg-sand-200/40 rounded-lg" />
            </div>
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="h-4 w-28 bg-sand-200/60 rounded animate-pulse" />
            <div className="h-9 w-52 bg-sand-100 rounded-xl animate-pulse" />
          </div>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="px-6 py-4 border-t border-gray-100/80 flex items-center gap-4">
              <div className="w-7 h-7 rounded-lg bg-sand-200/60 animate-pulse shrink-0" />
              <div className="h-4 w-32 bg-sand-200/40 rounded animate-pulse" />
              <div className="ml-auto flex gap-8">
                <div className="h-4 w-16 bg-sand-200/30 rounded animate-pulse" />
                <div className="h-4 w-16 bg-sand-200/30 rounded animate-pulse" />
                <div className="h-4 w-12 bg-sand-200/30 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>

        {/* Centered Y draw animation */}
        <div className="flex justify-center py-16">
          <YonderLoader size="lg" />
        </div>
      </div>
    </div>
  )
}
