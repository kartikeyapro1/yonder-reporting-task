'use client'

import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'motion/react'

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
        // Hard redirect so the browser sends the new cookie through middleware
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
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #0f1318 0%, #1a1f25 50%, #0f1318 100%)' }}
    >
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />
      {/* Coral glow top-right */}
      <div className="fixed top-0 right-0 w-[600px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at top right, rgba(232,80,58,0.12) 0%, transparent 70%)' }}
      />
      {/* Ink glow bottom-left */}
      <div className="fixed bottom-0 left-0 w-[500px] h-[400px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at bottom left, rgba(26,31,37,0.8) 0%, transparent 70%)' }}
      />

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo lockup */}
        <div className="flex items-center gap-2.5 mb-10 justify-center">
          <div className="w-9 h-9 rounded-[10px] bg-coral flex items-center justify-center shadow-glow-coral">
            <span className="text-white font-display font-bold text-base tracking-tight leading-none">Y</span>
          </div>
          <span className="text-white font-display font-semibold text-xl tracking-display">Yonder</span>
        </div>

        {/* Card */}
        <div className="rounded-2xl overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Coral top stripe */}
          <div className="h-[3px] w-full bg-coral" />

          <div className="px-8 pt-7 pb-8">
            <div className="mb-7">
              <h1 className="text-xl font-display font-semibold text-white tracking-display mb-1.5">
                Internal access
              </h1>
              <p className="text-sm text-ink-400">
                Partner analytics — Yonder staff only
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-[11px] font-semibold text-ink-500 uppercase tracking-caps mb-2"
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
                  className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder:text-ink-700
                    focus:outline-none focus:ring-2 focus:ring-coral/50 transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.09)',
                  }}
                  required
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                    style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0">
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
                whileHover={{ scale: loading ? 1 : 1.015 }}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-coral text-white font-semibold text-sm py-3 px-4 rounded-xl
                  hover:bg-[#D04433] transition-all duration-200 shadow-glow-coral
                  disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none
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
                  <>
                    Enter dashboard
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        <p className="text-center text-[11px] text-ink-700 mt-6 px-4">
          Restricted to Yonder employees. Unauthorised access attempts are logged.
        </p>
      </motion.div>
    </main>
  )
}
