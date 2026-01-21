'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Game {
  placeId: string
  universeId: number
  name: string
  creator: { name: string; type: string }
  metrics: {
    visits: number
    currentPlayers: number
    likeRatio: string
    estimatedRevenue: number
  }
  dates: { created: string; updated: string }
  genre?: string
  isRecent: boolean
  emergingScore: number
}

const CATEGORIES = [
  { id: '', label: 'All Categories' },
  { id: 'anime', label: 'Anime' },
  { id: 'simulator', label: 'Simulator' },
  { id: 'tycoon', label: 'Tycoon' },
  { id: 'horror', label: 'Horror' },
  { id: 'tower defense', label: 'Tower Defense' },
]

const SORT_OPTIONS = [
  { id: 'breakout', label: 'Breakout Hits (Newest + Performing)' },
  { id: 'score', label: 'Emerging Score' },
  { id: 'ccu', label: 'Highest CCU' },
  { id: 'revenue', label: 'Highest Revenue' },
  { id: 'newest', label: 'Newest First' },
  { id: 'rating', label: 'Best Rated' },
]

export default function EmergingStarsPage() {
  const router = useRouter()
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState('')
  const [maxMonths, setMaxMonths] = useState(3)
  const [minCcu, setMinCcu] = useState(100)
  const [totalFound, setTotalFound] = useState(0)
  const [recentCount, setRecentCount] = useState(0)
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [savedGames, setSavedGames] = useState<string[]>([])
  const [savingGame, setSavingGame] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('breakout')
  const [analyzingGame, setAnalyzingGame] = useState<string | null>(null)

  const saveGame = async (game: Game) => {
    setSavingGame(game.placeId)
    try {
      const res = await fetch('/api/save-game', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ game })
      })

      if (!res.ok) throw new Error('Failed to save')

      setSavedGames(prev => [...prev, game.placeId])
    } catch (err) {
      console.error('Failed to save game:', err)
    } finally {
      setSavingGame(null)
    }
  }

  // Auto-find similar games and go to analyze page
  const analyzeWithSimilar = async (game: Game) => {
    setAnalyzingGame(game.placeId)
    try {
      // Find similar games automatically
      const res = await fetch(`/api/find-similar?placeId=${game.placeId}&limit=4`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Failed to find similar')

      // Navigate to analyze page with all the place IDs
      const allIds = data.allPlaceIds || [game.placeId]
      router.push(`/analyze?ids=${allIds.join(',')}&name=${encodeURIComponent(data.detectedVertical + ' - ' + game.name)}`)
    } catch (err) {
      console.error('Failed to find similar games:', err)
      // Fallback: just analyze this one game
      router.push(`/analyze?ids=${game.placeId}&name=${encodeURIComponent(game.name)}`)
    } finally {
      setAnalyzingGame(null)
    }
  }

  useEffect(() => {
    loadGames()
  }, [category, maxMonths, minCcu])

  const loadGames = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        category,
        maxMonths: maxMonths.toString(),
        minCcu: minCcu.toString(),
        limit: '30'
      })

      const res = await fetch(`/api/emerging?${params}`)
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setGames(data.games || [])
      setTotalFound(data.totalFound || 0)
      setRecentCount(data.recentCount || 0)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load'
      setError(message)
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (placeId: string) => {
    setSelectedGames(prev =>
      prev.includes(placeId) ? prev.filter(id => id !== placeId) : [...prev, placeId]
    )
  }

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B'
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatRevenue = (rev: number): string => {
    if (rev >= 1_000_000) return '$' + (rev / 1_000_000).toFixed(1) + 'M/mo'
    if (rev >= 1_000) return '$' + (rev / 1_000).toFixed(0) + 'K/mo'
    return '$' + rev + '/mo'
  }

  const getAgeLabel = (dateString: string): string => {
    const created = new Date(dateString)
    const now = new Date()
    const days = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
    if (days < 30) return `${days}d old`
    const months = Math.floor(days / 30)
    return `${months}mo old`
  }

  const getAgeDays = (dateString: string): number => {
    const created = new Date(dateString)
    const now = new Date()
    return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
  }

  const sortedGames = [...games].sort((a, b) => {
    const aCcu = a.metrics?.currentPlayers || 0
    const bCcu = b.metrics?.currentPlayers || 0
    const aRev = a.metrics?.estimatedRevenue || 0
    const bRev = b.metrics?.estimatedRevenue || 0
    const aRating = parseFloat(a.metrics?.likeRatio || '0')
    const bRating = parseFloat(b.metrics?.likeRatio || '0')
    const aAge = getAgeDays(a.dates.created)
    const bAge = getAgeDays(b.dates.created)

    switch (sortBy) {
      case 'breakout': {
        // Breakout score: higher CCU + newer = better
        // Formula: CCU * (1 + (180 - ageDays) / 180) - rewards high CCU AND recency
        const maxDays = 180
        const aRecencyBonus = Math.max(0, (maxDays - aAge) / maxDays)
        const bRecencyBonus = Math.max(0, (maxDays - bAge) / maxDays)
        const aBreakout = aCcu * (1 + aRecencyBonus * 2) // 2x weight on recency
        const bBreakout = bCcu * (1 + bRecencyBonus * 2)
        return bBreakout - aBreakout
      }
      case 'score':
        return b.emergingScore - a.emergingScore
      case 'ccu':
        return bCcu - aCcu
      case 'revenue':
        return bRev - aRev
      case 'newest':
        return aAge - bAge // Lower age = newer = first
      case 'rating':
        return bRating - aRating
      default:
        return b.emergingScore - a.emergingScore
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Market Scanner</div>
        <h1 className="text-3xl font-bold">Emerging Opportunities</h1>
        <p className="text-gray-400 mt-1">
          Crawl the market for new games gaining traction - find validated niches before they saturate
        </p>
      </div>

      {/* Filters */}
      <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-gray-500"
            >
              {CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {/* Max Age */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Max Age</label>
            <select
              value={maxMonths}
              onChange={(e) => setMaxMonths(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-gray-500"
            >
              <option value={1}>1 month</option>
              <option value={2}>2 months</option>
              <option value={3}>3 months</option>
              <option value={6}>6 months</option>
            </select>
          </div>

          {/* Min CCU */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Min CCU</label>
            <select
              value={minCcu}
              onChange={(e) => setMinCcu(parseInt(e.target.value))}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-gray-500"
            >
              <option value={50}>50+</option>
              <option value={100}>100+</option>
              <option value={500}>500+</option>
              <option value={1000}>1,000+</option>
              <option value={5000}>5,000+</option>
              <option value={10000}>10,000+</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-xs text-gray-500 mb-1">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-sm focus:outline-none focus:border-gray-500"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Refresh */}
          <div className="flex items-end">
            <button
              onClick={loadGames}
              disabled={loading}
              className="w-full px-4 py-2 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex gap-4">
          <span className="text-gray-500">Found: <span className="text-white">{totalFound}</span></span>
          <span className="text-gray-500">Recent ({`<${maxMonths}mo`}): <span className="text-green-400">{recentCount}</span></span>
        </div>
        {selectedGames.length > 0 && (
          <Link
            href={`/analyze?ids=${selectedGames.join(',')}`}
            className="px-4 py-2 bg-white text-black rounded-lg font-medium text-sm"
          >
            Analyze {selectedGames.length} Selected
          </Link>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-700 border-t-green-500"></div>
          <p className="text-gray-500 mt-4">Crawling for emerging stars...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={loadGames}
            className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Results */}
      {!loading && sortedGames.length > 0 && (
        <div className="space-y-3">
          {sortedGames.map((game, index) => {
            const isSelected = selectedGames.includes(game.placeId)
            const ccu = game.metrics?.currentPlayers || 0
            const visits = game.metrics?.visits || 0
            const likeRatio = parseFloat(game.metrics?.likeRatio || '0')
            const revenue = game.metrics?.estimatedRevenue || 0

            return (
              <div
                key={game.placeId}
                className={`bg-[#0f0f0f] border rounded-xl p-4 transition-all ${
                  isSelected ? 'border-green-500 ring-1 ring-green-500/50' : 'border-gray-800 hover:border-gray-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-green-400 font-bold">#{index + 1}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold truncate">{game.name}</h3>
                      {game.isRecent && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-400 rounded text-xs font-medium">
                          NEW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>by {game.creator?.name || 'Unknown'}</span>
                      <span>{getAgeLabel(game.dates.created)}</span>
                      {game.genre && <span className="text-gray-600">{game.genre}</span>}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="hidden md:flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="text-green-400 font-mono font-bold">{formatNumber(ccu)}</div>
                      <div className="text-gray-500 text-xs">CCU</div>
                    </div>
                    <div className="text-center">
                      <div className="font-mono">{formatNumber(visits)}</div>
                      <div className="text-gray-500 text-xs">Visits</div>
                    </div>
                    <div className="text-center">
                      <div className={likeRatio >= 80 ? 'text-green-400' : likeRatio >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                        {likeRatio.toFixed(1)}%
                      </div>
                      <div className="text-gray-500 text-xs">Rating</div>
                    </div>
                    <div className="text-center">
                      <div className="text-yellow-400 font-mono">{formatRevenue(revenue)}</div>
                      <div className="text-gray-500 text-xs">Est. Rev</div>
                    </div>
                    <div className="text-center">
                      <div className="text-purple-400 font-bold">{game.emergingScore}</div>
                      <div className="text-gray-500 text-xs">Score</div>
                    </div>
                  </div>

                  {/* Analyze Button - Main CTA */}
                  <button
                    onClick={() => analyzeWithSimilar(game)}
                    disabled={analyzingGame === game.placeId}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                      analyzingGame === game.placeId
                        ? 'bg-green-700 text-green-300 cursor-wait'
                        : 'bg-green-600 hover:bg-green-500 text-white'
                    }`}
                  >
                    {analyzingGame === game.placeId ? 'Finding Similar...' : 'Analyze'}
                  </button>

                  {/* Save Button */}
                  <button
                    onClick={() => saveGame(game)}
                    disabled={savingGame === game.placeId || savedGames.includes(game.placeId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 ${
                      savedGames.includes(game.placeId)
                        ? 'bg-green-500/20 text-green-400 cursor-default'
                        : savingGame === game.placeId
                        ? 'bg-gray-700 text-gray-400 cursor-wait'
                        : 'bg-gray-700 hover:bg-gray-600 text-white'
                    }`}
                  >
                    {savedGames.includes(game.placeId) ? 'Saved' : savingGame === game.placeId ? '...' : 'Save'}
                  </button>
                </div>

                {/* Mobile Metrics */}
                <div className="md:hidden grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-gray-800 text-xs">
                  <div className="text-center">
                    <div className="text-green-400 font-mono">{formatNumber(ccu)}</div>
                    <div className="text-gray-500">CCU</div>
                  </div>
                  <div className="text-center">
                    <div className={likeRatio >= 80 ? 'text-green-400' : 'text-yellow-400'}>{likeRatio.toFixed(1)}%</div>
                    <div className="text-gray-500">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-yellow-400">{formatRevenue(revenue)}</div>
                    <div className="text-gray-500">Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-purple-400">{game.emergingScore}</div>
                    <div className="text-gray-500">Score</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* No Results */}
      {!loading && !error && sortedGames.length === 0 && (
        <div className="text-center py-16 text-gray-500">
          <p className="text-lg">No emerging stars found</p>
          <p className="text-sm mt-2">Try adjusting your filters or search a different category</p>
        </div>
      )}

      {/* Selection Footer */}
      {selectedGames.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-gray-800 p-4 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <span className="text-gray-400">{selectedGames.length} games selected</span>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedGames([])}
                className="px-4 py-2 text-gray-400 hover:text-white"
              >
                Clear
              </button>
              <Link
                href={`/analyze?ids=${selectedGames.join(',')}`}
                className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium"
              >
                Analyze as Competitor Group
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 mt-8">
        <h3 className="font-bold mb-3">How the Market Scanner Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
          <div className="space-y-1">
            <div className="text-white font-medium">1. Keyword Crawling</div>
            <p>Searches trending keywords like &quot;simulator 2025&quot;, &quot;anime defenders&quot;, etc. to find new games.</p>
          </div>
          <div className="space-y-1">
            <div className="text-white font-medium">2. Qualification Filters</div>
            <p>Games must be &lt;{maxMonths} months old and have {minCcu}+ concurrent players to qualify as opportunities.</p>
          </div>
          <div className="space-y-1">
            <div className="text-white font-medium">3. Opportunity Scoring</div>
            <p>Each game is scored based on CCU, ratings, and estimated revenue potential to rank opportunities.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
