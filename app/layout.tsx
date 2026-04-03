import type { Metadata, Viewport } from 'next'
import './globals.css'
import { AuthProvider } from '@/src/context/AuthContext'
import { QueryProvider } from '@/src/lib/queryClient'
import { BottomNavWrapper } from '@/src/components/layout/BottomNavWrapper'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'SongSaver',
  description: 'Worship Team Song Management',
  applicationName: 'SongSaver',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'SongSaver',
  },
  manifest: '/manifest.json',
  icons: {
    apple: '/icons/icon-192.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#7c3aed',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="bg-[#0f0a1e] min-h-screen">
        <QueryProvider>
          <AuthProvider>
            <div className="min-h-screen bg-gradient-to-b from-[#0f0a1e] via-[#1e1b4b] to-[#0f0a1e]">
              {children}
            </div>
            <BottomNavWrapper />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
