'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/niches', label: 'Hot Niches' },
  { href: '/emerging', label: 'Emerging' },
  { href: '/analyze', label: 'Analyze' },
  { href: '/idea', label: 'Idea Lab' },
  { href: '/groups', label: 'Groups' },
  { href: '/patterns', label: 'Patterns' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="bg-[#1a1a1a] border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <div>
              <span className="font-bold text-lg">Roblox Research</span>
              <span className="hidden sm:inline text-gray-500 text-xs ml-2">Market Intelligence</span>
            </div>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-red-600 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-gray-800'
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
