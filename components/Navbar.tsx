'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

// Simplified navigation - only core features
// Flow: Discover trends → Research → Create/Validate → Save
const navItems = [
  { href: '/emerging', label: 'Discover', desc: 'Find trends' },
  { href: '/idea', label: 'Create', desc: 'Build ideas' },
  { href: '/groups', label: 'Saved', desc: 'Your research' },
]

export default function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === '/'

  return (
    <nav className="bg-[#0a0a0a] border-b border-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 bg-gradient-to-br from-green-500 to-green-600 rounded-md flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="font-semibold text-white group-hover:text-green-400 transition-colors">Roblox Trends</span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-green-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                  }`}
                >
                  {item.label}
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </nav>
  )
}
