import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Yonder Reporting',
  description: 'Internal partner analytics and reporting platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
