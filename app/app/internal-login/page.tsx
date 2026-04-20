import { Suspense } from 'react'
import { InternalLoginClient } from './InternalLoginClient'

export const metadata = {
  title: 'Yonder — Internal Access',
}

export default function InternalLoginPage() {
  return (
    <Suspense fallback={null}>
      <InternalLoginClient />
    </Suspense>
  )
}
