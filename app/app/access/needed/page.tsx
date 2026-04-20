export const metadata = { title: 'Access required — Yonder' }

export default function AccessNeededPage() {
  return (
    <main className="min-h-screen bg-sand-50 flex items-center justify-center px-6">
      <div className="max-w-md text-center">
        <div className="w-14 h-14 rounded-2xl bg-coral-50 border border-coral-100 flex items-center justify-center mx-auto mb-6">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 11c-.55 0-1-.45-1-1V8c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1 4h-2v-2h2v2z" fill="#F04E37" opacity="0.7"/>
          </svg>
        </div>
        <h1 className="text-2xl font-display font-semibold text-ink-900 tracking-display mb-3">
          Magic link required
        </h1>
        <p className="text-ink-400 leading-relaxed mb-6">
          This partner portal is invite-only. To access your reports, use the
          personalised link sent to you by your Yonder contact.
        </p>
        <p className="text-sm text-ink-300">
          Link expired or missing? Contact your Yonder account manager and
          we&apos;ll send you a new one.
        </p>
      </div>
    </main>
  )
}
