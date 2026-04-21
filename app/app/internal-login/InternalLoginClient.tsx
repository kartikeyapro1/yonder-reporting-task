'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'
import { YonderLogo } from '@/components/brand/YonderLogo'

export function InternalLoginClient() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/internal-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
        credentials: 'same-origin',
      })

      if (res.ok) {
        const next = searchParams.get('next') ?? '/internal'
        window.location.href = next
      } else {
        setError('Incorrect password. Try again.')
        setPassword('')
        inputRef.current?.focus()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex flex-col md:flex-row">

      {/* ── Left brand panel ─────────────────────────────────── */}
      <div className="hidden md:flex md:w-[45%] flex-col justify-between p-10 bg-ink-950 relative overflow-hidden">
        {/* Subtle coral radial glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 20% 110%, rgba(232,80,58,0.18) 0%, transparent 60%)' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <YonderLogo variant="light" size="lg" />
        </div>

        {/* Main brand copy */}
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-coral mb-4">
              Partner Analytics
            </p>
            <h2 className="text-4xl font-bold text-white leading-[1.1] tracking-tight">
              Data that<br />moves the<br />needle.
            </h2>
          </div>
          <p className="text-sm text-ink-400 leading-relaxed max-w-[220px]">
            Real-time spend intelligence across all Yonder partner brands.
          </p>
        </div>

        {/* Footer */}
        <p className="text-[11px] text-ink-700 relative z-10">
          © {new Date().getFullYear()} Yonder Technology Ltd
        </p>
      </div>

      {/* ── Right form panel ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 bg-sand-50 relative">
        {/* Mobile logo */}
        <div className="flex md:hidden mb-10">
          <YonderLogo variant="dark" size="lg" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[380px]"
        >
          {/* Card — matches internal dashboard card style */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card px-8 py-9">

            {/* Coral accent bar at top */}
            <div className="h-[3px] w-10 rounded-full bg-coral mb-7" />

            {/* Heading */}
            <div className="mb-7">
              <h1 className="text-2xl font-bold text-ink-950 tracking-tight mb-1.5">
                Staff sign‑in
              </h1>
              <p className="text-sm text-ink-400">
                Yonder internal access only
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-ink-500 uppercase tracking-[0.09em] mb-2"
                >
                  Access password
                </label>
                <input
                  ref={inputRef}
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl px-4 py-3 text-sm text-ink-950 bg-sand-50
                    border border-gray-200 placeholder:text-ink-300
                    focus:outline-none focus:ring-2 focus:ring-coral/25 focus:border-coral/60
                    transition-all duration-200"
                  required
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -4, height: 0 }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5 bg-negative-light border border-negative/20"
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0">
                      <circle cx="8" cy="8" r="7" stroke="#DC2626" strokeWidth="1.5"/>
                      <path d="M8 5v3.5M8 10.5v.5" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                    <p className="text-xs text-negative">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading || !password}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: 0.99 }}
                className="w-full bg-coral text-white font-semibold text-sm py-3 px-4 rounded-xl
                  hover:bg-coral-600 active:bg-coral-700 transition-colors duration-150
                  disabled:opacity-40 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z" />
                    </svg>
                    Verifying…
                  </>
                ) : (
                  <>
                    Continue
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </motion.button>
            </form>

          </div>

          <p className="text-[11px] text-ink-400 mt-5 leading-relaxed text-center">
            Restricted to Yonder employees.{' '}
            <span className="text-ink-300">Unauthorised access attempts are logged.</span>
          </p>
        </motion.div>
      </div>

    </main>
  )
}
