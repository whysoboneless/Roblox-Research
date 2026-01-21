'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import FirstTimeHint from '@/components/FirstTimeHint'

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
    <div className="max-w-4xl mx-auto space-y-8 py-8">
      {/* First Time User Welcome */}
      <FirstTimeHint id="welcome" title="Welcome to Roblox Research Tool">
        This tool helps you find <strong>proven game ideas</strong> by analyzing what&apos;s
        actually working on Roblox right now. Start by discovering trending games, then
        analyze their patterns to build something similar but better.
      </FirstTimeHint>

      {/* Hero - Simple and Clear */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl font-bold">Find Your Next Game</h1>
        <p className="text-gray-400 text-lg max-w-xl mx-auto">
          Discover what&apos;s trending on Roblox, research the patterns, and build something that works.
        </p>
      </div>

      {/* Two Main Actions */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Primary: Discover Trends */}
        <Link
          href="/emerging"
          className="group bg-gradient-to-br from-green-900/40 to-green-800/20 border border-green-700/50 rounded-2xl p-8 hover:border-green-500 transition-all"
        >
          <div className="text-3xl mb-4">📈</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:text-green-400 transition-colors">Discover Trends</h2>
          <p className="text-gray-400">
            Find emerging games gaining traction right now. See what&apos;s working before everyone else does.
          </p>
          <div className="mt-6 flex items-center gap-2 text-green-400 font-medium">
            Start exploring
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>

        {/* Secondary: Create Idea */}
        <Link
          href="/idea"
          className="group bg-[#0f0f0f] border border-gray-800 rounded-2xl p-8 hover:border-gray-600 transition-all"
        >
          <div className="text-3xl mb-4">💡</div>
          <h2 className="text-2xl font-bold mb-2 group-hover:text-white transition-colors">Create & Validate</h2>
          <p className="text-gray-400">
            Have an idea? Test it against real market data. Or use proven formulas to build something new.
          </p>
          <div className="mt-6 flex items-center gap-2 text-gray-300 font-medium">
            Go to Idea Lab
            <span className="group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </Link>
      </div>

      {/* Quick Stats */}
      {!loading && stats && (stats.totalGroups > 0 || stats.emergingStarsCount > 0) && (
        <div className="flex justify-center gap-8 py-4 text-center">
          <div>
            <div className="text-2xl font-bold text-green-400">{stats.qualifiedGroups}</div>
            <div className="text-gray-500 text-sm">Validated Niches</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalGroups}</div>
            <div className="text-gray-500 text-sm">Saved Groups</div>
          </div>
          <div>
            <div className="text-2xl font-bold">{stats.totalGames}</div>
            <div className="text-gray-500 text-sm">Games Tracked</div>
          </div>
        </div>
      )}

      {/* How It Works - Minimal */}
      <div className="bg-[#0a0a0a] border border-gray-800/50 rounded-xl p-6">
        <h3 className="font-semibold text-center mb-6 text-gray-300">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-green-400 font-bold text-lg mb-1">1. Discover</div>
            <p className="text-gray-500 text-sm">Find games &lt;6 months old with real traction</p>
          </div>
          <div>
            <div className="text-green-400 font-bold text-lg mb-1">2. Research</div>
            <p className="text-gray-500 text-sm">Analyze what makes them work (patterns, loops, monetization)</p>
          </div>
          <div>
            <div className="text-green-400 font-bold text-lg mb-1">3. Build</div>
            <p className="text-gray-500 text-sm">Create your own version, 20% better</p>
          </div>
        </div>
      </div>

      {/* Saved Research Link */}
      {stats && stats.totalGroups > 0 && (
        <div className="text-center">
          <Link href="/groups" className="text-gray-500 hover:text-white text-sm">
            View your saved research ({stats.totalGroups} groups) →
          </Link>
        </div>
      )}
    </div>
  )
}
