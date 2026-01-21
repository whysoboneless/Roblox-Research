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

const PATTERN_KEYWORDS: Record<string, { keywords: string[]; pattern: string; color: string }> = {
  'anime-td': {
    keywords: ['anime', 'tower defense', 'defenders', 'adventures'],
    pattern: 'Anime TD',
    color: 'text-purple-400 bg-purple-500/20'
  },
  'simulator': {
    keywords: ['simulator', 'sim', 'clicker', 'legends'],
    pattern: 'Simulator',
    color: 'text-blue-400 bg-blue-500/20'
  },
  'pet': {
    keywords: ['pet', 'egg', 'hatch'],
    pattern: 'Pet Sim',
    color: 'text-pink-400 bg-pink-500/20'
  },
  'horror': {
    keywords: ['doors', 'horror', 'scary', 'mimic', 'backrooms'],
    pattern: 'Horror',
    color: 'text-red-400 bg-red-500/20'
  },
  'tycoon': {
    keywords: ['tycoon', 'restaurant', 'retail', 'factory'],
    pattern: 'Tycoon',
    color: 'text-yellow-400 bg-yellow-500/20'
  },
  'roleplay': {
    keywords: ['brookhaven', 'bloxburg', 'roleplay', 'rp', 'avenue'],
    pattern: 'Roleplay',
    color: 'text-green-400 bg-green-500/20'
  },
  'fighting': {
    keywords: ['fruits', 'fighting', 'combat', 'legacy', 'piece', 'arsenal'],
    pattern: 'Combat',
    color: 'text-orange-400 bg-orange-500/20'
  },
  'obby': {
    keywords: ['obby', 'tower of', 'obstacle'],
    pattern: 'Obby',
    color: 'text-cyan-400 bg-cyan-500/20'
  }
}

function detectPattern(game: Game): { pattern: string; color: string } | null {
  const searchText = `${game.name} ${game.genre || ''}`.toLowerCase()
  for (const [, data] of Object.entries(PATTERN_KEYWORDS)) {
    for (const keyword of data.keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return { pattern: data.pattern, color: data.color }
      }
    }
  }
  return null
}

const PATTERN_STRATEGIES: Record<string, { retention: string[]; monetization: string[]; viral: string[] }> = {
  'Anime TD': {
    retention: ['Gacha/summon system', 'Character collection', 'Co-op multiplayer', 'Meta progression'],
    monetization: ['Premium currency', 'Battle passes', 'Limited banners', 'VIP servers'],
    viral: ['Trading communities', 'Tier lists', 'Update hype', 'YouTuber summons']
  },
  'Simulator': {
    retention: ['Rebirth system', 'Automation unlocks', 'Leaderboards', 'Daily rewards'],
    monetization: ['x2 earnings pass', 'Auto-collect', 'Premium areas', 'Exclusive tools'],
    viral: ['Big numbers', 'Speedrun prestige', 'Leaderboard competition']
  },
  'Pet Sim': {
    retention: ['Pet collection', 'Egg hatching', 'Fusion system', 'Trading', 'Events'],
    monetization: ['Luck boosts', 'Premium eggs', 'VIP areas', 'Event passes'],
    viral: ['Rare pet flexing', 'Giveaways', 'Egg opening videos']
  },
  'Horror': {
    retention: ['Procedural elements', 'Lore discovery', 'Challenge modes', 'Unlockables'],
    monetization: ['Cosmetics', 'Revives', 'Hint systems', 'Story DLC'],
    viral: ['Jump scare clips', 'Lore theories', 'Speedruns']
  },
  'Tycoon': {
    retention: ['Prestige system', 'Automation', 'Leaderboards', 'Daily rewards'],
    monetization: ['x2 earnings', 'Auto-collect', 'Premium areas'],
    viral: ['Building showcases', 'Speedrun prestige']
  },
  'Roleplay': {
    retention: ['House building', 'Vehicle collection', 'Friend systems', 'Seasonal updates'],
    monetization: ['Premium currency', 'House packs', 'Vehicles', 'Clothing'],
    viral: ['RP content', 'Building showcases', 'Drama clips']
  },
  'Combat': {
    retention: ['Ability unlocks', 'Rare items', 'PvP ranking', 'Boss fights'],
    monetization: ['Rerolls', 'XP boosts', 'Private servers'],
    viral: ['PvP montages', 'Rare drops', 'Update trailers']
  },
  'Obby': {
    retention: ['Stage progression', 'Time challenges', 'Cosmetics', 'Leaderboards'],
    monetization: ['Skip stage', 'Cosmetics', 'Checkpoint saves'],
    viral: ['Speedruns', 'Fail compilations']
  }
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
  const [expandedGame, setExpandedGame] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadGames(selectedCategory)
  }, [selectedCategory])

  const loadGames = async (category: string) => {
    setLoading(true)
    setError(null)
    setExpandedGame(null)

    try {
      const res = await fetch(`/api/discover?query=${encodeURIComponent(category)}&limit=12`)
      if (!res.ok) throw new Error(`API error: ${res.status}`)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setGames(data.games || [])
      if (!data.games || data.games.length === 0) setError('No games found.')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load'
      setError(message)
      setGames([])
    } finally {
      setLoading(false)
    }
  }

  const toggleSelect = (placeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Market Research</div>
        <h1 className="text-3xl font-bold">Discover Games</h1>
        <p className="text-gray-400 mt-1">Browse top games and reverse-engineer their strategies</p>
      </div>

      {/* Categories */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            disabled={loading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === cat.id
                ? 'bg-white text-black'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-white hover:bg-[#222]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-700 border-t-white"></div>
          <p className="text-gray-500 mt-4">Loading games...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={() => loadGames(selectedCategory)} className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm">
            Retry
          </button>
        </div>
      )}

      {/* Results */}
      {!loading && games.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <span className="text-gray-500 text-sm">{games.length} games</span>
            {selectedGames.length > 0 && (
              <Link href={`/analyze?ids=${selectedGames.join(',')}`} className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium">
                Analyze {selectedGames.length} Selected
              </Link>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {games.map((game) => {
              const isSelected = selectedGames.includes(game.placeId)
              const isExpanded = expandedGame === game.placeId
              const detectedPattern = detectPattern(game)
              const strategies = detectedPattern ? PATTERN_STRATEGIES[detectedPattern.pattern] : null
              const ccu = game.metrics?.currentPlayers || 0
              const visits = game.metrics?.visits || 0
              const likeRatio = game.metrics?.likeRatio || '0'
              const revenue = game.metrics?.estimatedRevenue || 0

              return (
                <div
                  key={game.placeId}
                  className={`rounded-xl overflow-hidden transition-all ${
                    isSelected ? 'ring-2 ring-green-500' : ''
                  } ${isExpanded ? 'bg-[#111]' : 'bg-[#0f0f0f]'} border border-gray-800 hover:border-gray-700`}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0 pr-2">
                        <h3 className="font-bold truncate">{game.name}</h3>
                        <p className="text-gray-500 text-sm">by {game.creator?.name || 'Unknown'}</p>
                      </div>
                      <button
                        onClick={(e) => toggleSelect(game.placeId, e)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                          isSelected ? 'bg-green-500 border-green-500 text-black' : 'border-gray-600 hover:border-gray-400'
                        }`}
                      >
                        {isSelected && <span className="text-xs font-bold">&#10003;</span>}
                      </button>
                    </div>

                    {detectedPattern && (
                      <div className={`inline-block px-2 py-1 rounded text-xs font-medium mb-3 ${detectedPattern.color}`}>
                        {detectedPattern.pattern}
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-gray-500 text-xs">CCU</div>
                        <div className="text-green-400 font-mono font-bold">{formatNumber(ccu)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Visits</div>
                        <div className="font-mono">{formatNumber(visits)}</div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Rating</div>
                        <div className={parseFloat(likeRatio) >= 80 ? 'text-green-400' : parseFloat(likeRatio) >= 60 ? 'text-yellow-400' : 'text-red-400'}>
                          {likeRatio}%
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-500 text-xs">Est. Revenue</div>
                        <div className="text-yellow-400 font-mono">{formatRevenue(revenue)}</div>
                      </div>
                    </div>

                    {detectedPattern && (
                      <button
                        onClick={() => setExpandedGame(isExpanded ? null : game.placeId)}
                        className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-white border-t border-gray-800 transition-colors"
                      >
                        {isExpanded ? 'Hide Strategy' : 'View Strategy'}
                      </button>
                    )}
                  </div>

                  {isExpanded && strategies && (
                    <div className="px-4 pb-4 space-y-4 border-t border-gray-800 pt-4">
                      <div>
                        <div className="text-xs font-bold text-green-400 mb-2">RETENTION</div>
                        <div className="flex flex-wrap gap-1">
                          {strategies.retention.map((r, i) => (
                            <span key={i} className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs">{r}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-yellow-400 mb-2">MONETIZATION</div>
                        <div className="flex flex-wrap gap-1">
                          {strategies.monetization.map((m, i) => (
                            <span key={i} className="px-2 py-1 bg-yellow-500/10 text-yellow-400 rounded text-xs">{m}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs font-bold text-blue-400 mb-2">VIRAL HOOKS</div>
                        <div className="flex flex-wrap gap-1">
                          {strategies.viral.map((v, i) => (
                            <span key={i} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">{v}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {/* Selection Footer */}
      {selectedGames.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-[#0f0f0f] border-t border-gray-800 p-4 z-50">
          <div className="container mx-auto flex items-center justify-between">
            <span className="text-gray-400">{selectedGames.length} selected</span>
            <div className="flex gap-3">
              <button onClick={() => setSelectedGames([])} className="px-4 py-2 text-gray-400 hover:text-white">Clear</button>
              <Link href={`/analyze?ids=${selectedGames.join(',')}`} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg font-medium">
                Analyze Selected
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
