'use client'

import { YonderLogo } from '@/components/brand/YonderLogo'

export default function ReportError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-sand-50 flex flex-col items-center justify-center px-6">
      <YonderLogo variant="dark" size="md" className="mb-10" />
      <h1 className="text-xl font-display font-semibold text-ink-900 tracking-display mb-2 text-center">
        Report unavailable
      </h1>
      <p className="text-sm text-ink-400 leading-relaxed mb-8 max-w-sm text-center">
        We couldn&apos;t generate this report right now. Please try again shortly.
      </p>
      <button
        onClick={reset}
        className="bg-coral text-white font-semibold text-sm px-6 py-3 rounded-xl
          hover:bg-coral-light transition-colors duration-300"
      >
        Retry
      </button>
    </div>
  )
}
