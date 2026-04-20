import type { Metadata } from 'next'
import { LoginClient } from './LoginClient'

export const metadata: Metadata = {
  title: 'Sign In',
}

import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-ink-400">Loading…</div>}>
      <LoginClient />
    </Suspense>
  )
}
