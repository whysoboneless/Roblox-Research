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
        <div className="text-sm text-gray-500 mb-2 uppercase tracking-wider">Roblox Market Intelligence</div>
        <h1 className="text-4xl font-bold mb-3">Niche Research & Validation</h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Find proven market opportunities, validate game concepts, and analyze competitor strategies before you build.
        </p>
      </div>

      {/* Primary CTA - Find Opportunities */}
      <div className="bg-gradient-to-r from-green-900/30 to-green-800/10 border border-green-800/50 rounded-2xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-green-400">Find New Opportunities</h2>
            <p className="text-gray-400 mt-1">Crawl the market for emerging games and validated niches</p>
          </div>
          <Link
            href="/emerging"
            className="px-6 py-3 bg-green-600 hover:bg-green-500 rounded-xl text-center font-semibold transition-colors flex-shrink-0"
          >
            Scan for Emerging Games
          </Link>
        </div>
      </div>

      {/* Main CTA Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Validate Idea */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-5">
            <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Validate an Idea</h2>
          <p className="text-gray-400 mb-6">Test your concept against market data and get AI-powered feedback on viability</p>
          <div className="space-y-3">
            <Link href="/idea" className="block w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-center font-semibold transition-colors">
              Validate My Concept
            </Link>
            <Link href="/analyze" className="block w-full py-3 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-xl text-center font-medium transition-colors">
              Analyze Competitors
            </Link>
          </div>
        </div>

        {/* Research & Explore */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-8 hover:border-gray-700 transition-colors">
          <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-5">
            <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Research the Market</h2>
          <p className="text-gray-400 mb-6">Explore trending games, study proven patterns, and identify market gaps</p>
          <div className="space-y-3">
            <Link href="/discover" className="block w-full py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-center font-semibold transition-colors">
              Browse Top Games
            </Link>
            <Link href="/patterns" className="block w-full py-3 bg-[#1a1a1a] hover:bg-[#222] border border-gray-800 rounded-xl text-center font-medium transition-colors">
              Study Proven Patterns
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Games Tracked" value={loading ? '-' : stats?.totalGames || 0} />
        <StatCard label="Competitor Groups" value={loading ? '-' : stats?.totalGroups || 0} />
        <StatCard label="Qualified Niches" value={loading ? '-' : stats?.qualifiedGroups || 0} highlight />
        <StatCard label="Emerging Games" value={loading ? '-' : stats?.emergingStarsCount || 0} />
      </div>

      {/* Quick Access */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-gray-300">Quick Access</h2>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <QuickLink href="/emerging" title="Emerging" desc="New opportunities" highlight />
          <QuickLink href="/discover" title="Discover" desc="Browse games" />
          <QuickLink href="/analyze" title="Analyze" desc="Competitor intel" />
          <QuickLink href="/patterns" title="Patterns" desc="Proven formulas" />
          <QuickLink href="/groups" title="Groups" desc="Saved research" />
        </div>
      </div>

      {/* Methodology Explainer */}
      <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6">
        <h2 className="text-lg font-semibold mb-2">Niche Validation Framework</h2>
        <p className="text-gray-500 text-sm mb-5">A data-driven approach to finding profitable Roblox game opportunities</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StepCard num="1" title="Scan Market" desc="Find games <6 months old with traction" color="red" />
          <StepCard num="2" title="Validate Revenue" desc="Confirm $10k+/month potential" color="orange" />
          <StepCard num="3" title="Confirm Demand" desc="2-3 winners = proven niche" color="yellow" />
          <StepCard num="4" title="Differentiate" desc="Identify your competitive edge" color="green" />
        </div>
      </div>

      {/* What This Tool Does */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FeatureCard
          title="Market Scanner"
          desc="Automatically crawl Roblox to find new games gaining traction in your target categories"
        />
        <FeatureCard
          title="Competitor Intelligence"
          desc="Analyze game metrics, monetization strategies, and retention mechanics of successful titles"
        />
        <FeatureCard
          title="AI Validation"
          desc="Get AI-powered analysis of your game concepts with specific, actionable feedback"
        />
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

function QuickLink({ href, title, desc, highlight = false }: { href: string; title: string; desc: string; highlight?: boolean }) {
  return (
    <Link
      href={href}
      className={`block p-4 rounded-xl transition-colors group ${
        highlight
          ? 'bg-green-950/30 border border-green-800/50 hover:border-green-700'
          : 'bg-[#0f0f0f] border border-gray-800 hover:border-gray-700'
      }`}
    >
      <div className={`font-semibold transition-colors ${highlight ? 'text-green-400' : 'group-hover:text-white'}`}>{title}</div>
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

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="p-5 bg-[#0a0a0a] border border-gray-800 rounded-xl">
      <div className="font-semibold mb-2">{title}</div>
      <div className="text-gray-500 text-sm">{desc}</div>
    </div>
  )
}
