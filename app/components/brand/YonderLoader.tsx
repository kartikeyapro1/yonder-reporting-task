/**
 * @module components/brand/YonderLoader
 *
 * Yonder's signature loading animation — the fluid "Y" mark
 * draws itself with a CSS stroke-dashoffset loop. Used in every
 * loading.tsx skeleton across the app.
 *
 * Sizes: sm (32px), md (48px), lg (72px)
 */

interface YonderLoaderProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = { sm: 32, md: 48, lg: 72 }

export function YonderLoader({ size = 'md', className = '' }: YonderLoaderProps) {
  const px = sizeMap[size]

  return (
    <div className={`flex items-center justify-center ${className}`} role="status" aria-label="Loading">
      <svg
        width={px}
        height={px}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="yonder-loader"
      >
        <path
          d="M14 6C14 6 8 14 8 22C8 30 14 32 18 28C22 24 26 14 30 10C34 6 40 8 40 16C40 24 34 42 24 42C14 42 8 34 8 28"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          className="yonder-loader-path"
        />
      </svg>
      <span className="sr-only">Loading…</span>
    </div>
  )
}
