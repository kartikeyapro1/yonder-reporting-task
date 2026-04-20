'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { YonderLogo } from '@/components/brand/YonderLogo'

/**
 * Login page for staff access to the internal dashboard.
 *
 * In production, this would integrate with Yonder's SSO provider
 * (Google Workspace, Okta, etc.) via NextAuth.js or similar.
 *
 * For development, any email/password combination works when
 * REQUIRE_AUTH=true. The staff cookie is set via the /api/auth/login endpoint.
 */
export function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/internal'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (res.ok) {
      router.push(redirect)
    } else {
      const data = await res.json()
      setError(data.error ?? 'Login failed')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-sand-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <YonderLogo size="md" variant="dark" />
          <p className="text-sm text-ink-400 mt-3">Sign in to the reporting platform</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-card border border-gray-100 p-6 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-ink-400 uppercase tracking-caps mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral/30 transition-all"
              placeholder="you@yonder.com"
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-ink-400 uppercase tracking-caps mb-1.5">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 bg-white outline-none focus:ring-2 focus:ring-coral/20 focus:border-coral/30 transition-all"
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-coral text-white font-semibold text-sm rounded-lg hover:bg-coral-light transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-center text-xs text-ink-300 mt-6">
          Powered by Yonder · Internal use only
        </p>
      </div>
    </div>
  )
}
