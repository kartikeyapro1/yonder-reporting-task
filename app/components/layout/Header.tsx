import Link from 'next/link'

interface HeaderProps {
  section?: 'internal' | 'partner' | 'report'
  partnerName?: string
  partnerSlug?: string
}

/** Yonder wordmark as inline SVG — matches brand font weight */
function YonderLogo({ dark = false }: { dark?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Coral Y mark */}
      <div className="w-7 h-7 rounded-lg bg-coral flex items-center justify-center shrink-0 shadow-sm">
        <span className="text-white text-sm font-black tracking-tighter leading-none">Y</span>
      </div>
      <span className={`text-sm font-bold tracking-tight ${dark ? 'text-ink-inverse' : 'text-ink'}`}>
        Yonder
      </span>
    </div>
  )
}

/**
 * Two visual modes:
 *   internal — dark navy bar, dense nav, "Internal" badge
 *   partner / report — white frosted bar, minimal nav, partner name
 */
export function Header({ section, partnerName, partnerSlug }: HeaderProps) {
  const isInternal = section === 'internal'

  if (isInternal) {
    return (
      <header className="sticky top-0 z-30 bg-navy-900 border-b border-navy-700">
        <div className="max-w-screen-xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/internal">
              <YonderLogo dark />
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/internal"
                className="px-3 py-1 rounded-md text-xs font-medium text-navy-200 hover:text-white hover:bg-navy-700 transition-colors"
              >
                Partners
              </Link>
            </nav>
          </div>
          <span className="text-xs font-medium text-navy-400 bg-navy-800 border border-navy-600 px-2.5 py-0.5 rounded-full">
            Internal
          </span>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/internal">
            <YonderLogo />
          </Link>
          {partnerName && (
            <div className="flex items-center gap-2 text-sm text-ink-tertiary">
              <span className="text-surface-border">/</span>
              <span className="text-ink font-medium">{partnerName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {section === 'partner' && partnerSlug && (
            <Link
              href={`/report/${partnerSlug}`}
              className="text-xs font-medium text-coral hover:text-coral-dark transition-colors"
            >
              Full report →
            </Link>
          )}
          {section === 'report' && (
            <span className="text-xs font-medium text-ink-tertiary border border-surface-border rounded-full px-2.5 py-0.5">
              Partner Report
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

