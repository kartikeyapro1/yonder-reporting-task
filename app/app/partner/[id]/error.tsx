'use client'

import { YonderLogo } from '@/components/brand/YonderLogo'

export default function PartnerError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center bg-sand-50 px-6">
      <YonderLogo variant="dark" size="md" className="mb-10" />
      <h1 className="text-xl font-display font-semibold text-ink-900 tracking-display mb-2 text-center">
        We hit a snag
      </h1>
      <p className="text-sm text-ink-400 leading-relaxed mb-8 max-w-sm text-center">
        Something went wrong loading your report. Please try again.
      </p>
      <button
        onClick={reset}
        className="bg-coral text-white font-semibold text-sm px-6 py-3 rounded-xl
          hover:bg-coral-light transition-colors duration-300"
      >
        Reload
      </button>
    </div>
  )
}
