import type { Metadata } from 'next'
import { Inter, Syne } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const syne = Syne({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
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
    <html lang="en" className={`${inter.variable} ${syne.variable}`}>
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: 'font-sans text-sm rounded-xl border border-gray-200 shadow-float',
              success: 'text-positive',
              error: 'text-negative',
            },
          }}
        />
      </body>
    </html>
  )
}
