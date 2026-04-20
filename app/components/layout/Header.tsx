import Link from 'next/link'

interface HeaderProps {
  section?: 'internal' | 'partner' | 'report'
  partnerName?: string
}

export function Header({ section, partnerName }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-surface-border">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/internal" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-600 to-brand-800 flex items-center justify-center">
              <span className="text-white text-xs font-bold">Y</span>
            </div>
            <span className="font-semibold text-ink text-sm tracking-tight">Yonder</span>
          </Link>

          {section === 'internal' && (
            <nav className="flex items-center gap-1">
              <Link href="/internal" className="px-3 py-1.5 rounded-lg text-sm font-medium text-ink-secondary hover:text-ink hover:bg-surface-muted transition-colors">
                Partners
              </Link>
            </nav>
          )}

          {section === 'partner' && partnerName && (
            <div className="flex items-center gap-2 text-sm text-ink-tertiary">
              <Link href="/internal" className="hover:text-ink transition-colors">Partners</Link>
              <span>/</span>
              <span className="text-ink font-medium">{partnerName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {section === 'internal' && (
            <span className="text-xs text-ink-tertiary bg-surface-muted px-2.5 py-1 rounded-full border border-surface-border">
              Internal
            </span>
          )}
          {section === 'partner' && (
            <span className="text-xs text-ink-tertiary bg-surface-muted px-2.5 py-1 rounded-full border border-surface-border">
              Partner View
            </span>
          )}
          {section === 'report' && (
            <span className="text-xs text-ink-tertiary bg-surface-muted px-2.5 py-1 rounded-full border border-surface-border">
              Report
            </span>
          )}
        </div>
      </div>
    </header>
  )
}
