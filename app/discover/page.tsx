'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Game {
  placeId: string
  universeId?: number
  name: string
  genre?: string
  creator: { name: string; type: string }
  metrics: {
    visits: number
    currentPlayers: number
    likeRatio: string
    estimatedRevenue: number
  }
  dates: { created: string }
}

const CATEGORIES = [
  { id: 'popular', label: 'Popular' },
  { id: 'simulator', label: 'Simulators' },
  { id: 'tower defense', label: 'Tower Defense' },
  { id: 'anime', label: 'Anime' },
  { id: 'horror', label: 'Horror' },
  { id: 'tycoon', label: 'Tycoon' },
  { id: 'roleplay', label: 'Roleplay' },
]

export default function DiscoverPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('popular')
  const [selectedGames, setSelectedGames] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  // Load games on mount and when category changes
  useEffect(() => {
    loadGames(selectedCategory)
  }, [selectedCategory])

  const loadGames = async (category: string) => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch(`/api/discover?query=${encodeURIComponent(category)}&limit=12`)

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`)
      }

      const data = await res.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setGames(data.games || [])

      if (!data.games || data.games.length === 0) {
        setError('No games found. Try a different category.')
      }
    } catch (err: any) {
      console.error('Load failed:', err)
      setError(err.message || 'Failed to load games')
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (placeId: string) => {
    setSelectedGames(prev =>
      prev.includes(placeId)
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    )
  }

  const formatNumber = (num: number): string => {
    if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + 'B'
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M'
    if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K'
    return num.toString()
  }

  const formatRevenue = (rev: number): string => {
    if (rev >= 1_000_000) return '$' + (rev / 1_000_000).toFixed(1) + 'M'
    if (rev >= 1_000) return '$' + (rev / 1_000).toFixed(0) + 'K'
    return '$' + rev
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discover Games</h1>
        <p className="text-gray-400 mt-1">Browse popular Roblox games by category</p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-red-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-700 border-t-red-500"></div>
          <p className="text-gray-400 mt-4">Loading {selectedCategory} games...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="bg-red-900/20 border border-red-800 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => loadGames(selectedCategory)}
            className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results */}
      {!loading && games.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">{games.length} games found</span>
            {selectedGames.length > 0 && (
              <Link
                href={`/analyze?ids=${selectedGames.join(',')}`}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium text-sm transition-colors"
              >
                Analyze {selectedGames.length} Selected
              </Link>
            )}
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => {
              const isSelected = selectedGames.includes(game.placeId)
              const ccu = game.metrics?.currentPlayers || 0
              const visits = game.metrics?.visits || 0
              const likeRatio = game.metrics?.likeRatio || '0'
              const revenue = game.metrics?.estimatedRevenue || 0

              return (
                <div
                  key={game.placeId}
                  onClick={() => toggleSelect(game.placeId)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-900/30 border-2 border-red-600'
                      : 'bg-gray-900 border border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <h3 className="font-bold truncate">{game.name}</h3>
                      <p className="text-gray-500 text-sm">by {game.creator?.name || 'Unknown'}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-5 h-5 accent-red-500 mt-1 flex-shrink-0"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500 block">CCU</span>
                      <p className="text-green-400 font-mono font-bold">
                        {formatNumber(ccu)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Visits</span>
                      <p className="font-mono">{formatNumber(visits)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Rating</span>
                      <p className={parseFloat(likeRatio) >= 80 ? 'text-green-400' : parseFloat(likeRatio) >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                        {likeRatio}%
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Est. Rev/mo</span>
                      <p className="text-yellow-400 font-mono">{formatRevenue(revenue)}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between text-xs text-gray-500">
                    <span>{game.genre || 'Game'}</span>
                    <span>ID: {game.placeId}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Empty State (no error) */}
      {!loading && !error && games.length === 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400">Select a category above to browse games</p>
        </div>
      )}

      {/* Selection Footer */}
      {selectedGames.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 p-4 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <span className="text-gray-400">
              {selectedGames.length} game{selectedGames.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedGames([])}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Clear
              </button>
              <Link
                href={`/analyze?ids=${selectedGames.join(',')}`}
                className="px-6 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
              >
                Analyze Selected
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
