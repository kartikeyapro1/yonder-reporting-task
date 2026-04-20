export const metadata = { title: 'Link expired — Yonder' }

export default function AccessDeniedPage() {
  return (
    <main className="min-h-screen bg-sand-50 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-sand-100 border border-sand-200 flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="#9CA3AF"/>
          </svg>
        </div>
        <h1 className="text-2xl font-display font-semibold text-ink-900 tracking-display mb-3">
          Link expired or invalid
        </h1>
        <p className="text-ink-400 leading-relaxed mb-6">
          This magic link is no longer valid. Links expire after 48 hours for
          security, or may have already been used.
        </p>
        <p className="text-sm text-ink-300">
          Please contact your Yonder account manager for a fresh link.
        </p>
      </div>
    </main>
  )
}
