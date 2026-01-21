'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface GameWithMetrics {
  id: string
  place_id: number
  name: string
  genre: string
  creator_name: string
  thumbnail_url: string | null
  game_created_at: string
  latest_metrics: {
    current_players: number
    visits: number
    like_ratio: number
    estimated_revenue: number
  } | null
}

export default function DiscoverPage() {
  const [games, setGames] = useState<GameWithMetrics[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGames, setSelectedGames] = useState<number[]>([])

  useEffect(() => {
    fetch('/api/games')
      .then(res => res.json())
      .then(data => {
        setGames(data.games || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const toggleSelect = (placeId: number) => {
    setSelectedGames(prev =>
      prev.includes(placeId)
        ? prev.filter(id => id !== placeId)
        : [...prev, placeId]
    )
  }

  const analyzeUrl = selectedGames.length > 0
    ? `/analyze?ids=${selectedGames.join(',')}`
    : '/analyze'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Discover Games</h1>
          <p className="text-gray-400 mt-1">Browse tracked games and select for analysis</p>
        </div>
        {selectedGames.length > 0 && (
          <Link
            href={analyzeUrl}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
          >
            Analyze {selectedGames.length} Games →
          </Link>
        )}
      </div>

      {/* Quick Add */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
        <h3 className="font-medium mb-3">Quick Analyze</h3>
        <p className="text-gray-400 text-sm mb-4">
          Don't see the game you're looking for? Go to the Analyze page and enter Place IDs directly.
        </p>
        <Link
          href="/analyze"
          className="inline-block px-4 py-2 bg-[#111] border border-gray-700 hover:border-gray-500 rounded-lg text-sm transition-colors"
        >
          Enter Place IDs Manually →
        </Link>
      </div>

      {/* Games Table */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading games...</div>
      ) : games.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">No games tracked yet. Start by analyzing some games!</p>
          <Link
            href="/analyze"
            className="inline-block px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
          >
            Analyze Games
          </Link>
        </div>
      ) : (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm border-b border-gray-800">
                <th className="p-4 w-12"></th>
                <th className="p-4">Game</th>
                <th className="p-4">Genre</th>
                <th className="p-4">CCU</th>
                <th className="p-4">Visits</th>
                <th className="p-4">Like %</th>
                <th className="p-4">Est. Rev/mo</th>
                <th className="p-4">Created</th>
              </tr>
            </thead>
            <tbody>
              {games.map((game) => {
                const isSelected = selectedGames.includes(game.place_id)
                return (
                  <tr
                    key={game.id}
                    onClick={() => toggleSelect(game.place_id)}
                    className={`border-b border-gray-800/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-red-900/20' : 'hover:bg-[#222]'
                    }`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="w-4 h-4 accent-red-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {game.thumbnail_url && (
                          <img
                            src={game.thumbnail_url}
                            alt=""
                            className="w-10 h-10 rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{game.name}</div>
                          <div className="text-gray-500 text-xs">
                            by {game.creator_name} • ID: {game.place_id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400">{game.genre || '-'}</td>
                    <td className="p-4 text-green-400 font-mono">
                      {game.latest_metrics?.current_players?.toLocaleString() || '-'}
                    </td>
                    <td className="p-4 font-mono">
                      {game.latest_metrics?.visits?.toLocaleString() || '-'}
                    </td>
                    <td className="p-4">
                      {game.latest_metrics?.like_ratio
                        ? `${game.latest_metrics.like_ratio}%`
                        : '-'}
                    </td>
                    <td className="p-4 text-yellow-400 font-mono">
                      {game.latest_metrics?.estimated_revenue
                        ? `$${game.latest_metrics.estimated_revenue.toLocaleString()}`
                        : '-'}
                    </td>
                    <td className="p-4 text-gray-400">
                      {game.game_created_at
                        ? new Date(game.game_created_at).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Selection Footer */}
      {selectedGames.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-gray-800 p-4">
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
                href={analyzeUrl}
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
