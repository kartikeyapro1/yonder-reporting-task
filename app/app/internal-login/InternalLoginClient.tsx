'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'

export function InternalLoginClient() {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
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
        router.push(next)
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
    <main className="min-h-screen bg-ink-950 flex flex-col items-center justify-center px-6">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-coral/5 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-8 h-8 rounded-xl bg-coral flex items-center justify-center">
            <span className="text-white font-display font-bold text-sm tracking-tight">Y</span>
          </div>
          <span className="text-white font-display font-semibold text-lg tracking-display">Yonder</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-display font-semibold text-white tracking-display mb-2">
            Internal access
          </h1>
          <p className="text-sm text-ink-400">
            Partner analytics dashboard — Yonder staff only
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-semibold text-ink-400 uppercase tracking-caps mb-2"
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
              placeholder="Enter password"
              className="w-full bg-white/[0.06] border border-white/[0.1] rounded-xl px-4 py-3
                text-white placeholder:text-ink-600 text-sm
                focus:outline-none focus:ring-2 focus:ring-coral/40 focus:border-coral/40
                transition-all duration-200"
              required
            />
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="text-sm text-negative px-1"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>

          <motion.button
            type="submit"
            disabled={loading || !password}
            whileHover={{ scale: loading ? 1 : 1.01 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-coral text-white font-semibold text-sm py-3 px-4 rounded-xl
              hover:bg-coral-dark transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              flex items-center justify-center gap-2"
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
              'Enter dashboard'
            )}
          </motion.button>
        </form>

        <p className="text-center text-xs text-ink-600 mt-8">
          This dashboard is restricted to Yonder employees. Unauthorised access attempts are logged.
        </p>
      </motion.div>
    </main>
  )
}
