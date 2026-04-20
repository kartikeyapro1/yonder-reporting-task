/**
 * @module components/brand/YonderLogo
 *
 * Official Yonder brand mark — the fluid loop "Y" symbol.
 * Derived from the Yonder brand guidelines image.
 *
 * Variants:
 *   - dark   (default): ink-950 mark for light backgrounds
 *   - light  : white mark for dark backgrounds
 *   - coral  : coral mark for accent usage
 *
 * The wordmark ("yonder") is optional and controlled via `showWordmark`.
 */

interface YonderLogoProps {
  variant?: 'dark' | 'light' | 'coral'
  showWordmark?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizes = {
  sm: { mark: 20, text: 'text-[13px]', gap: 'gap-1.5' },
  md: { mark: 28, text: 'text-[15px]', gap: 'gap-2' },
  lg: { mark: 36, text: 'text-lg',     gap: 'gap-2.5' },
}

const colors = {
  dark:  { mark: '#1A1F25', text: 'text-ink-950' },
  light: { mark: '#FFFFFF', text: 'text-white' },
  coral: { mark: '#E8503A', text: 'text-coral' },
}

export function YonderLogo({
  variant = 'dark',
  showWordmark = true,
  size = 'md',
  className = '',
}: YonderLogoProps) {
  const s = sizes[size]
  const c = colors[variant]

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Loop "Y" mark */}
      <svg
        width={s.mark}
        height={s.mark}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        <path
          d="M14 6C14 6 8 14 8 22C8 30 14 32 18 28C22 24 26 14 30 10C34 6 40 8 40 16C40 24 34 42 24 42C14 42 8 34 8 28"
          stroke={c.mark}
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <span className={`${s.text} font-semibold ${c.text} tracking-tight leading-none`}>
          yonder
        </span>
      )}
    </div>
  )
}

/**
 * Compact icon-only variant for favicons, avatars, and tight spaces.
 */
export function YonderMark({
  variant = 'dark',
  size = 24,
  className = '',
}: {
  variant?: 'dark' | 'light' | 'coral'
  size?: number
  className?: string
}) {
  const c = colors[variant]
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 ${className}`}
    >
      <path
        d="M14 6C14 6 8 14 8 22C8 30 14 32 18 28C22 24 26 14 30 10C34 6 40 8 40 16C40 24 34 42 24 42C14 42 8 34 8 28"
        stroke={c.mark}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}
