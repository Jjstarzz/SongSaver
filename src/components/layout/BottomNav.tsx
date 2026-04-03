'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const tabs = [
  { label: 'Dashboard', icon: '🏠', route: '/' },
  { label: 'Songs', icon: '🎵', route: '/songs' },
  { label: 'Services', icon: '📋', route: '/services' },
  { label: 'Rehearsal', icon: '🎙️', route: '/rehearsal' },
]

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (route: string) => {
    if (route === '/') return pathname === '/'
    return pathname.startsWith(route)
  }

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-md border-t border-white/10 flex z-40"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {tabs.map((tab) => (
        <Link
          key={tab.route}
          href={tab.route}
          className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${
            isActive(tab.route) ? 'text-purple-400' : 'text-gray-500'
          }`}
        >
          <span className="text-xl">{tab.icon}</span>
          <span className="text-xs">{tab.label}</span>
        </Link>
      ))}
    </nav>
  )
}
