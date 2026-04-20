import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { YonderLogo } from '@/components/brand/YonderLogo'

interface HeaderProps {
  section?: 'internal' | 'partner' | 'report'
  partnerName?: string
  partnerSlug?: string
}

export function Header({ section, partnerName, partnerSlug }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 glass border-b border-gray-200/60 no-print">
      <div className="max-w-screen-xl mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <Link href="/internal" className="transition-opacity hover:opacity-80">
            <YonderLogo size="sm" variant="dark" />
          </Link>

          {partnerName && (
            <div className="flex items-center gap-2 text-sm">
              <svg width="4" height="16" viewBox="0 0 4 16" className="text-gray-300">
                <line x1="3" y1="0" x2="1" y2="16" stroke="currentColor" strokeWidth="1" />
              </svg>
              <span className="text-gray-600 font-medium">{partnerName}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {section === 'internal' && (
            <>
              <Link
                href="/internal/admin"
                className="text-xs font-medium text-ink-400 hover:text-coral transition-colors duration-300"
              >
                Config
              </Link>
              <span className="hidden sm:block text-xs text-ink-200">Internal</span>
            </>
          )}
          {section === 'partner' && partnerSlug && (
            <Link
              href={`/report/${partnerSlug}`}
              className="text-sm font-medium text-gray-500 hover:text-coral transition-colors duration-300 flex items-center gap-1"
            >
              Full report <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
          {section === 'report' && (
            <span className="text-[10px] font-semibold text-ink-400 uppercase tracking-caps bg-ink-50 px-2.5 py-1 rounded-full">
              Report
            </span>
          )}
        </div>
      </div>
    </header>
  )
}

