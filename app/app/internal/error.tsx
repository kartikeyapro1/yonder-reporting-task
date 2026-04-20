'use client'

import Link from 'next/link'
import { YonderLogo } from '@/components/brand/YonderLogo'

export default function InternalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-screen bg-sand-50">
      <header className="sticky top-0 z-40 glass border-b border-gray-200/60">
        <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center">
          <Link href="/internal">
            <YonderLogo size="sm" variant="dark" />
          </Link>
        </div>
      </header>

      <div className="flex items-center justify-center px-6" style={{ minHeight: 'calc(100vh - 3.5rem)' }}>
        <div className="max-w-md text-center">
          <div className="w-12 h-12 rounded-2xl bg-coral-50 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-coral">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <h1 className="text-xl font-display font-semibold text-ink-900 tracking-display mb-2">
            Failed to load data
          </h1>
          <p className="text-sm text-ink-400 leading-relaxed mb-8">
            We couldn&apos;t load the requested information. This might be a temporary issue.
            {error.digest && (
              <span className="block mt-2 text-xs text-ink-200 font-tabular">
                Ref: {error.digest}
              </span>
            )}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={reset}
              className="bg-coral text-white font-semibold text-sm px-5 py-2.5 rounded-xl
                hover:bg-coral-light transition-colors duration-300"
            >
              Retry
            </button>
            <Link
              href="/internal"
              className="text-sm font-medium text-ink-400 hover:text-ink-600 transition-colors"
            >
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
