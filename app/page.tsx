'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  totalGames: number
  totalGroups: number
  qualifiedGroups: number
  emergingStarsCount: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data.stats)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-3">Roblox Game Research</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Find winning niches using the Nicole Search methodology. Discover emerging games, analyze competitors, and build your strategy.
        </p>
      </div>

      {/* Main CTA Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Have an Idea */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-5">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">I Have a Game Idea</h2>
          <p className="text-gray-400 mb-6">Validate your concept and get a complete game plan based on proven patterns</p>
          <div className="space-y-3">
            <Link href="/idea" className="block w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-center font-semibold transition-colors">
              Qualify My Idea
            </Link>
            <Link href="/analyze" className="block w-full py-3 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-xl text-center font-medium transition-colors">
              Analyze Competitors
            </Link>
          </div>
        </div>

        {/* Need Inspiration */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-5">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">I Need Inspiration</h2>
          <p className="text-gray-400 mb-6">Discover trending games and get help brainstorming winning concepts</p>
          <div className="space-y-3">
            <Link href="/helper" className="block w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-center font-semibold transition-colors">
              Idea Helper
            </Link>
            <Link href="/discover" className="block w-full py-3 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-xl text-center font-medium transition-colors">
              Discover Games
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Games Tracked" value={loading ? '-' : stats?.totalGames || 0} />
        <StatCard label="Competitor Groups" value={loading ? '-' : stats?.totalGroups || 0} />
        <StatCard label="Qualified Niches" value={loading ? '-' : stats?.qualifiedGroups || 0} highlight />
        <StatCard label="Emerging Stars" value={loading ? '-' : stats?.emergingStarsCount || 0} />
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Quick Access</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickLink href="/discover" title="Discover" desc="Find trending games" />
          <QuickLink href="/analyze" title="Analyze" desc="Check competitors" />
          <QuickLink href="/patterns" title="Patterns" desc="Proven formulas" />
          <QuickLink href="/groups" title="Groups" desc="Saved research" />
        </div>
      </div>

      {/* Method Explainer */}
      <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-2">The Nicole Search Method</h2>
        <p className="text-gray-500 text-sm mb-5">How to find profitable game opportunities on Roblox</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StepCard num="1" title="Find Recent Hits" desc="Games <6 months old gaining traction" color="red" />
          <StepCard num="2" title="Validate Revenue" desc="Confirm $10k+/month estimated" color="orange" />
          <StepCard num="3" title="Find 2-3 Winners" desc="Multiple successes = proven demand" color="yellow" />
          <StepCard num="4" title="Build 20% Better" desc="Add your unique twist" color="green" />
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, highlight = false }: { label: string; value: number | string; highlight?: boolean }) {
  return (
    <div className={`p-5 rounded-xl ${highlight ? 'bg-green-950/30 border border-green-900/50' : 'bg-[#0f0f0f] border border-gray-800'}`}>
      <div className={`text-3xl font-bold mb-1 ${highlight ? 'text-green-400' : 'text-white'}`}>{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  )
}

function QuickLink({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <Link href={href} className="block p-4 bg-[#0f0f0f] border border-gray-800 rounded-xl hover:border-gray-700 transition-colors group">
      <div className="font-semibold group-hover:text-white transition-colors">{title}</div>
      <div className="text-gray-500 text-sm">{desc}</div>
    </Link>
  )
}

function StepCard({ num, title, desc, color }: { num: string; title: string; desc: string; color: string }) {
  const colors: Record<string, string> = {
    red: 'border-l-red-500 text-red-400',
    orange: 'border-l-orange-500 text-orange-400',
    yellow: 'border-l-yellow-500 text-yellow-400',
    green: 'border-l-green-500 text-green-400',
  }
  return (
    <div className={`p-4 bg-[#0a0a0a] rounded-lg border-l-4 ${colors[color]}`}>
      <div className={`text-xs font-bold mb-1 ${colors[color].split(' ')[1]}`}>STEP {num}</div>
      <div className="font-semibold text-sm mb-1">{title}</div>
      <div className="text-gray-500 text-xs">{desc}</div>
    </div>
  )
}
