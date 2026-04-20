import type { Metadata } from 'next'
import { Inter, DM_Serif_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Yonder Reporting',
    template: '%s · Yonder',
  },
  description: 'Partner analytics and reporting platform for the Yonder rewards programme.',
  metadataBase: new URL('https://reporting.yonder.com'),
  openGraph: {
    title: 'Yonder Reporting',
    description: 'Partner analytics and reporting platform for the Yonder rewards programme.',
    siteName: 'Yonder',
    type: 'website',
  },
  robots: { index: false, follow: false },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${dmSerif.variable}`}>
      <body>{children}</body>
    </html>
  )
}
