'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Stats {
  totalGames: number
  totalGroups: number
  qualifiedGroups: number
  totalMetricSnapshots: number
  emergingStarsCount: number
}

interface EmergingStar {
  name: string
  placeId: number
  ccu: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [emergingStars, setEmergingStars] = useState<EmergingStar[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        setStats(data.stats)
        setEmergingStars(data.emergingStars || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Roblox Game Research</h1>
        <p className="text-gray-400 mt-1">Find winning niches using the Nicole Search methodology</p>
      </div>

      {/* Main Action Cards - The Two Paths */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Path 1: Have an idea */}
        <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 border border-purple-700/50 rounded-xl p-6">
          <div className="text-4xl mb-4">💡</div>
          <h2 className="text-2xl font-bold mb-2">I Have a Game Idea</h2>
          <p className="text-gray-300 mb-6">Validate your concept against market data and qualification criteria</p>
          <div className="space-y-3">
            <Link href="/idea" className="block w-full p-4 bg-purple-600 hover:bg-purple-500 rounded-lg text-center font-semibold transition-colors">
              Qualify My Idea →
            </Link>
            <Link href="/analyze" className="block w-full p-4 bg-purple-900/50 hover:bg-purple-800/50 border border-purple-600/50 rounded-lg text-center font-medium transition-colors">
              Analyze Competitors
            </Link>
          </div>
        </div>

        {/* Path 2: Need an idea */}
        <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 border border-blue-700/50 rounded-xl p-6">
          <div className="text-4xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">I Need Inspiration</h2>
          <p className="text-gray-300 mb-6">Discover trending games and get help brainstorming winning concepts</p>
          <div className="space-y-3">
            <Link href="/helper" className="block w-full p-4 bg-blue-600 hover:bg-blue-500 rounded-lg text-center font-semibold transition-colors">
              Idea Helper →
            </Link>
            <Link href="/discover" className="block w-full p-4 bg-blue-900/50 hover:bg-blue-800/50 border border-blue-600/50 rounded-lg text-center font-medium transition-colors">
              Discover Trending Games
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Games Tracked"
          value={loading ? '...' : stats?.totalGames || 0}
          icon="🎮"
        />
        <StatCard
          label="Competitor Groups"
          value={loading ? '...' : stats?.totalGroups || 0}
          icon="📊"
        />
        <StatCard
          label="Qualified Niches"
          value={loading ? '...' : stats?.qualifiedGroups || 0}
          icon="✅"
          highlight
        />
        <StatCard
          label="Emerging Stars"
          value={loading ? '...' : stats?.emergingStarsCount || 0}
          icon="⭐"
        />
      </div>

      {/* Quick Tools */}
      <div>
        <h2 className="text-xl font-bold mb-4">Quick Tools</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/discover" className="block p-4 bg-[#1a1a1a] border border-gray-800 rounded-xl hover:border-red-500/50 transition-all group">
            <div className="text-2xl mb-2">🔥</div>
            <h3 className="font-bold group-hover:text-red-400 transition-colors">Discover</h3>
            <p className="text-gray-500 text-sm">Find trending games</p>
          </Link>

          <Link href="/analyze" className="block p-4 bg-[#1a1a1a] border border-gray-800 rounded-xl hover:border-orange-500/50 transition-all group">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-bold group-hover:text-orange-400 transition-colors">Analyze</h3>
            <p className="text-gray-500 text-sm">Check competitor groups</p>
          </Link>

          <Link href="/patterns" className="block p-4 bg-[#1a1a1a] border border-gray-800 rounded-xl hover:border-yellow-500/50 transition-all group">
            <div className="text-2xl mb-2">📚</div>
            <h3 className="font-bold group-hover:text-yellow-400 transition-colors">Patterns</h3>
            <p className="text-gray-500 text-sm">Proven game formulas</p>
          </Link>

          <Link href="/groups" className="block p-4 bg-[#1a1a1a] border border-gray-800 rounded-xl hover:border-green-500/50 transition-all group">
            <div className="text-2xl mb-2">📁</div>
            <h3 className="font-bold group-hover:text-green-400 transition-colors">Groups</h3>
            <p className="text-gray-500 text-sm">Saved research</p>
          </Link>
        </div>
      </div>

      {/* Emerging Stars */}
      {emergingStars.length > 0 && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Emerging Stars</h2>
              <p className="text-gray-400 text-sm">Recent games with strong metrics - potential opportunities</p>
            </div>
            <Link href="/discover" className="text-sm text-red-400 hover:text-red-300">
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {emergingStars.slice(0, 5).map((star) => (
              <div key={star.placeId} className="flex items-center justify-between p-3 bg-[#111] rounded-lg">
                <div>
                  <span className="font-medium">{star.name}</span>
                  <span className="text-gray-500 text-sm ml-2">ID: {star.placeId}</span>
                </div>
                <div className="text-green-400 font-mono">
                  {star.ccu.toLocaleString()} CCU
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nicole Search Method */}
      <div className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border border-red-800/50 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-2">The Nicole Search Method</h2>
        <p className="text-gray-400 text-sm mb-4">How to find profitable game opportunities on Roblox</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="p-4 bg-black/30 rounded-lg border-l-4 border-red-500">
            <div className="text-xs font-bold text-red-400 mb-2">STEP 1</div>
            <h3 className="font-bold mb-1">Find Recent Hits</h3>
            <p className="text-gray-400">Games &lt;6 months old gaining traction</p>
          </div>
          <div className="p-4 bg-black/30 rounded-lg border-l-4 border-orange-500">
            <div className="text-xs font-bold text-orange-400 mb-2">STEP 2</div>
            <h3 className="font-bold mb-1">Validate Revenue</h3>
            <p className="text-gray-400">Confirm $10k+/month estimated revenue</p>
          </div>
          <div className="p-4 bg-black/30 rounded-lg border-l-4 border-yellow-500">
            <div className="text-xs font-bold text-yellow-400 mb-2">STEP 3</div>
            <h3 className="font-bold mb-1">Find 2-3 Winners</h3>
            <p className="text-gray-400">Multiple recent successes = proven demand</p>
          </div>
          <div className="p-4 bg-black/30 rounded-lg border-l-4 border-green-500">
            <div className="text-xs font-bold text-green-400 mb-2">STEP 4</div>
            <h3 className="font-bold mb-1">Build 20% Better</h3>
            <p className="text-gray-400">Add your unique twist to capture share</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, highlight = false }: {
  label: string
  value: number | string
  icon: string
  highlight?: boolean
}) {
  return (
    <div className={`p-5 rounded-xl ${highlight ? 'bg-green-900/20 border border-green-800' : 'bg-[#1a1a1a] border border-gray-800'}`}>
      <div className="flex items-center justify-between">
        <span className="text-2xl">{icon}</span>
        <span className={`text-2xl font-bold ${highlight ? 'text-green-400' : ''}`}>
          {value}
        </span>
      </div>
      <p className="text-gray-400 mt-2 text-sm">{label}</p>
    </div>
  )
}
