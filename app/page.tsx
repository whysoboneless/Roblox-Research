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
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-400 mt-1">Roblox market research powered by the Nicole Search methodology</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/analyze" className="block p-6 bg-gradient-to-br from-red-600 to-red-700 rounded-xl hover:from-red-500 hover:to-red-600 transition-all">
          <h3 className="text-xl font-bold mb-2">Analyze Games</h3>
          <p className="text-red-100 text-sm">Enter Place IDs to analyze a competitor group and check qualification</p>
        </Link>

        <Link href="/groups" className="block p-6 bg-[#1a1a1a] border border-gray-800 rounded-xl hover:border-gray-600 transition-all">
          <h3 className="text-xl font-bold mb-2">View Groups</h3>
          <p className="text-gray-400 text-sm">Browse your saved competitor groups and their qualification status</p>
        </Link>

        <Link href="/patterns" className="block p-6 bg-[#1a1a1a] border border-gray-800 rounded-xl hover:border-gray-600 transition-all">
          <h3 className="text-xl font-bold mb-2">Pattern Library</h3>
          <p className="text-gray-400 text-sm">Explore successful game patterns and reverse-engineering guides</p>
        </Link>
      </div>

      {/* Emerging Stars */}
      {emergingStars.length > 0 && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Emerging Stars</h2>
          <p className="text-gray-400 text-sm mb-4">Recent games with strong metrics - potential opportunities</p>
          <div className="space-y-3">
            {emergingStars.map((star) => (
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

      {/* Methodology Overview */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
        <h2 className="text-xl font-bold mb-4">Nicole Search Methodology</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="p-4 bg-[#111] rounded-lg">
            <div className="text-2xl mb-2">1️⃣</div>
            <h3 className="font-bold mb-1">Find Games</h3>
            <p className="text-gray-400">Discover games created in the last 6 months</p>
          </div>
          <div className="p-4 bg-[#111] rounded-lg">
            <div className="text-2xl mb-2">2️⃣</div>
            <h3 className="font-bold mb-1">Check Revenue</h3>
            <p className="text-gray-400">Is it making ~$10k+/month?</p>
          </div>
          <div className="p-4 bg-[#111] rounded-lg">
            <div className="text-2xl mb-2">3️⃣</div>
            <h3 className="font-bold mb-1">Find More</h3>
            <p className="text-gray-400">Are there 2-3 recent successes in this niche?</p>
          </div>
          <div className="p-4 bg-[#111] rounded-lg">
            <div className="text-2xl mb-2">4️⃣</div>
            <h3 className="font-bold mb-1">Beat Quality</h3>
            <p className="text-gray-400">Can you beat current quality by 20%?</p>
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
    <div className={`p-6 rounded-xl ${highlight ? 'bg-green-900/20 border border-green-800' : 'bg-[#1a1a1a] border border-gray-800'}`}>
      <div className="flex items-center justify-between">
        <span className="text-3xl">{icon}</span>
        <span className={`text-3xl font-bold ${highlight ? 'text-green-400' : ''}`}>
          {value}
        </span>
      </div>
      <p className="text-gray-400 mt-2 text-sm">{label}</p>
    </div>
  )
}
