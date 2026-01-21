'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

interface Game {
  placeId: string
  name: string
  genre: string
  thumbnailUrl: string
  creator: {
    name: string
    type: string
  }
  metrics: {
    visits: number
    currentPlayers: number
    likeRatio: string
    estimatedRevenue: number
  }
  dates: {
    created: string
  }
  classification: {
    genre: string
    subGenre: string
    theme: string
    template: string
    coreLoop: string
  }
}

interface Analysis {
  groupName: string
  classification: {
    genre: string
    subGenre: string
    theme: string
    template: string
    coreLoop: string
  }
  qualified: boolean
  score: number
  checks: Array<{
    step: string
    passed: boolean
    detail: string
  }>
  emergingStars: Array<{
    name: string
    placeId: string
    ccu: number
    revenue: number
  }>
  recommendations: string[]
}

export default function AnalyzePage() {
  const searchParams = useSearchParams()
  const [placeIds, setPlaceIds] = useState('')
  const [loading, setLoading] = useState(false)
  const [games, setGames] = useState<Game[]>([])
  const [analysis, setAnalysis] = useState<Analysis | null>(null)
  const [error, setError] = useState('')

  // Auto-fill from URL params (from Discover page)
  useEffect(() => {
    const ids = searchParams.get('ids')
    if (ids) {
      setPlaceIds(ids)
      // Auto-analyze if IDs provided
      setTimeout(() => {
        document.getElementById('analyze-btn')?.click()
      }, 100)
    }
  }, [searchParams])

  const handleAnalyze = async () => {
    setError('')
    setLoading(true)
    setGames([])
    setAnalysis(null)

    const ids = placeIds
      .split(/[,\s]+/)
      .map(id => id.trim())
      .filter(id => id && /^\d+$/.test(id))

    if (ids.length === 0) {
      setError('Please enter valid Place IDs (numbers only, separated by commas)')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeIds: ids })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setGames(data.games)
      setAnalysis(data.analysis)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analyze Competitor Group</h1>
        <p className="text-gray-400 mt-1">Enter Roblox Place IDs to analyze games and check niche qualification</p>
      </div>

      {/* Input Section */}
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
        <label className="block text-sm font-medium mb-2">Place IDs</label>
        <textarea
          value={placeIds}
          onChange={(e) => setPlaceIds(e.target.value)}
          placeholder="Enter Place IDs separated by commas (e.g., 2753915549, 4587034896, 4996049426)"
          className="w-full h-24 bg-[#111] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
        />
        <p className="text-gray-500 text-xs mt-2">
          Find Place IDs in Roblox game URLs: roblox.com/games/<strong>2753915549</strong>/Blox-Fruits
        </p>

        <button
          onClick={handleAnalyze}
          disabled={loading || !placeIds.trim()}
          className="mt-4 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
        >
          {loading ? 'Analyzing...' : 'Analyze Games'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Results */}
      {analysis && (
        <>
          {/* Qualification Status */}
          <div className={`p-6 rounded-xl border ${analysis.qualified ? 'bg-green-900/20 border-green-800' : 'bg-yellow-900/20 border-yellow-800'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{analysis.groupName || 'Competitor Group'}</h2>
                <p className={`text-lg mt-1 ${analysis.qualified ? 'text-green-400' : 'text-yellow-400'}`}>
                  {analysis.qualified ? '✓ QUALIFIED' : '✗ NOT QUALIFIED'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{analysis.score}</div>
                <div className="text-gray-400 text-sm">/ 100</div>
              </div>
            </div>
          </div>

          {/* Classification */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Structural Characteristics</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <span className="text-gray-500 text-sm">Genre</span>
                <p className="font-medium">{analysis.classification.genre}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Sub-Genre</span>
                <p className="font-medium">{analysis.classification.subGenre}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Theme</span>
                <p className="font-medium">{analysis.classification.theme}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Template</span>
                <p className="font-medium">{analysis.classification.template}</p>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Core Loop</span>
                <p className="font-medium text-sm">{analysis.classification.coreLoop}</p>
              </div>
            </div>
          </div>

          {/* Qualification Checks */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Qualification Checks</h3>
            <div className="space-y-3">
              {analysis.checks.map((check, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-[#111] rounded-lg">
                  <span className={`text-xl ${check.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {check.passed ? '✓' : '✗'}
                  </span>
                  <div>
                    <span className="font-medium">{check.step}:</span>
                    <span className="text-gray-400 ml-2">{check.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Emerging Stars */}
          {analysis.emergingStars.length > 0 && (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">⭐ Emerging Stars</h3>
              <div className="space-y-2">
                {analysis.emergingStars.map((star) => (
                  <div key={star.placeId} className="flex items-center justify-between p-3 bg-[#111] rounded-lg">
                    <span className="font-medium">{star.name}</span>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-400">{star.ccu.toLocaleString()} CCU</span>
                      <span className="text-yellow-400">${star.revenue.toLocaleString()}/mo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">💡 Recommendations</h3>
            <ul className="space-y-2">
              {analysis.recommendations.map((rec, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300">
                  <span className="text-gray-500">•</span>
                  {rec}
                </li>
              ))}
            </ul>
          </div>

          {/* Games Table */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 overflow-x-auto">
            <h3 className="text-lg font-bold mb-4">Games Analyzed ({games.length})</h3>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-800">
                  <th className="pb-3 pr-4">Game</th>
                  <th className="pb-3 pr-4">CCU</th>
                  <th className="pb-3 pr-4">Visits</th>
                  <th className="pb-3 pr-4">Like %</th>
                  <th className="pb-3 pr-4">Est. Rev/mo</th>
                  <th className="pb-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {games.map((game) => (
                  <tr key={game.placeId} className="border-b border-gray-800/50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        {game.thumbnailUrl && (
                          <img src={game.thumbnailUrl} alt="" className="w-10 h-10 rounded" />
                        )}
                        <div>
                          <div className="font-medium">{game.name}</div>
                          <div className="text-gray-500 text-xs">by {game.creator.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-green-400 font-mono">
                      {game.metrics.currentPlayers.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4 font-mono">
                      {game.metrics.visits.toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      {game.metrics.likeRatio}%
                    </td>
                    <td className="py-3 pr-4 text-yellow-400 font-mono">
                      ${game.metrics.estimatedRevenue.toLocaleString()}
                    </td>
                    <td className="py-3 text-gray-400">
                      {new Date(game.dates.created).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
