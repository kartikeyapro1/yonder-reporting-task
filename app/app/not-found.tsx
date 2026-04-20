import Link from 'next/link'
import { YonderLogo } from '@/components/brand/YonderLogo'

export default function NotFound() {
  return (
    <div className="min-h-[100svh] flex flex-col items-center justify-center bg-sand-50 px-6">
      <YonderLogo variant="dark" size="md" className="mb-12" />

      <p className="text-[clamp(5rem,15vw,10rem)] font-display font-semibold text-ink-100 leading-none tracking-tighter mb-2">
        404
      </p>
      <h1 className="text-xl font-display font-semibold text-ink-900 tracking-display mb-2">
        Page not found
      </h1>
      <p className="text-sm text-ink-400 leading-relaxed max-w-sm text-center mb-10">
        The page you&apos;re looking for doesn&apos;t exist or the link may have expired.
        Check the URL or head back to the dashboard.
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/internal"
          className="bg-coral text-white font-semibold text-sm px-6 py-3 rounded-xl
            hover:bg-coral-light hover:shadow-glow-coral transition-all duration-300"
        >
          Go to dashboard
        </Link>
      </div>
    </div>
  )
}
