'use client'

import { YonderLogo } from '@/components/brand/YonderLogo'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-sand-50 flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <YonderLogo variant="dark" size="md" className="justify-center mb-8" />
          <h1 className="text-2xl font-display font-semibold text-ink-900 tracking-display mb-3">
            Something went wrong
          </h1>
          <p className="text-sm text-ink-400 leading-relaxed mb-8">
            An unexpected error occurred. Our team has been notified.
            {error.digest && (
              <span className="block mt-2 text-xs text-ink-200 font-tabular">
                Ref: {error.digest}
              </span>
            )}
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-coral text-white font-semibold text-sm px-6 py-3 rounded-xl
              hover:bg-coral-light hover:shadow-glow-coral transition-all duration-300"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
