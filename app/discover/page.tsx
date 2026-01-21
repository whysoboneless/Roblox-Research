'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Game {
  placeId: string
  universeId: number
  name: string
  genre: string
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
  { id: 'simulator', label: 'Simulators', emoji: '🎮' },
  { id: 'tower defense', label: 'Tower Defense', emoji: '🗼' },
  { id: 'anime', label: 'Anime Games', emoji: '⚔️' },
  { id: 'horror', label: 'Horror', emoji: '👻' },
  { id: 'tycoon', label: 'Tycoon', emoji: '🏭' },
  { id: 'roleplay', label: 'Roleplay', emoji: '🏠' },
  { id: 'adventure', label: 'Adventure/RPG', emoji: '🗺️' },
  { id: 'obby', label: 'Obby', emoji: '🏃' },
]

export default function DiscoverPage() {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGames, setSelectedGames] = useState<string[]>([])

  const fetchGames = async (category?: string, query?: string) => {
    setLoading(true)
    setSelectedCategory(category || null)

    try {
      const params = new URLSearchParams()
      if (query) params.append('query', query)
      if (category) params.append('query', category)
      params.append('limit', '15')

      const res = await fetch(`/api/discover?${params}`)
      const data = await res.json()
      setGames(data.games || [])
    } catch (err) {
      console.error('Fetch failed:', err)
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      fetchGames(undefined, searchQuery.trim())
    }
  }

  const toggleSelect = (placeId: string) => {
    setSelectedGames(prev =>
      prev.includes(placeId)
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    )
  }

  const selectAll = () => {
    if (selectedGames.length === games.length) {
      setSelectedGames([])
    } else {
      setSelectedGames(games.map(g => g.placeId))
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Discover Games</h1>
        <p className="text-gray-400 mt-1">Find trending Roblox games by category or search</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search games (e.g., 'pet simulator', 'anime fighting')"
          className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
        />
        <button
          type="submit"
          disabled={loading || !searchQuery.trim()}
          className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
        >
          Search
        </button>
      </form>

      {/* Category Buttons */}
      <div>
        <h3 className="text-sm text-gray-500 mb-3">Browse by Category</h3>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => fetchGames(cat.id)}
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                selectedCategory === cat.id
                  ? 'bg-red-600 text-white'
                  : 'bg-[#1a1a1a] text-gray-300 hover:bg-[#222] hover:text-white border border-gray-800'
              }`}
            >
              <span>{cat.emoji}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-700 border-t-red-500"></div>
          <p className="text-gray-400 mt-4">Fetching games from Roblox...</p>
        </div>
      ) : games.length > 0 ? (
        <>
          {/* Selection Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={selectAll}
                className="text-sm text-gray-400 hover:text-white"
              >
                {selectedGames.length === games.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className="text-gray-600">|</span>
              <span className="text-sm text-gray-400">
                {games.length} games found
              </span>
            </div>
            {selectedGames.length > 0 && (
              <Link
                href={`/analyze?ids=${selectedGames.join(',')}`}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium text-sm transition-colors"
              >
                Analyze {selectedGames.length} Selected →
              </Link>
            )}
          </div>

          {/* Games Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => {
              const isSelected = selectedGames.includes(game.placeId)
              return (
                <div
                  key={game.placeId}
                  onClick={() => toggleSelect(game.placeId)}
                  className={`p-4 rounded-xl cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-red-900/30 border-2 border-red-600'
                      : 'bg-[#1a1a1a] border border-gray-800 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold truncate">{game.name}</h3>
                      <p className="text-gray-500 text-sm">by {game.creator?.name || 'Unknown'}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-5 h-5 accent-red-500 mt-1"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">CCU</span>
                      <p className="text-green-400 font-mono font-bold">
                        {game.metrics.currentPlayers.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Visits</span>
                      <p className="font-mono">
                        {(game.metrics.visits / 1e9).toFixed(1)}B
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Like %</span>
                      <p>{game.metrics.likeRatio}%</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Est. Rev</span>
                      <p className="text-yellow-400 font-mono">
                        ${(game.metrics.estimatedRevenue / 1000).toFixed(0)}k
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-800 flex justify-between text-xs text-gray-500">
                    <span>{game.genre}</span>
                    <span>ID: {game.placeId}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">
            Click a category above or search to discover games
          </p>
          <p className="text-gray-600 text-sm">
            Games will be fetched directly from Roblox with live metrics
          </p>
        </div>
      )}

      {/* Selected Footer */}
      {selectedGames.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-gray-800 p-4 z-50">
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
                Analyze Selected →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
