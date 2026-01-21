'use client'

import { useState, useEffect } from 'react'

interface Game {
  placeId: string
  name: string
  creator: string
  metrics: {
    currentPlayers: number
    visits: number
    likeRatio: string
    estimatedRevenue: number
  }
  daysOld: number
  classification: {
    template: string
    theme: string
    coreLoop: string
  }
}

interface Cluster {
  clusterId: string
  template: string
  theme: string
  games: Game[]
  gameCount: number
  qualifiedCount: number
  isHotNiche: boolean
  avgCCU: number
  avgRevenue: number
  avgLikeRatio: string
  emergingStars: Array<{
    name: string
    placeId: string
    ccu: number
    revenue: number
    daysOld: number
  }>
}

interface Study {
  groupName: string
  gamesAnalyzed: number
  corePattern: {
    template: string
    theme: string
    coreLoop: string
    description: string
  }
  mechanics: Array<{ mechanic: string; frequency: number; present: string }>
  monetization: {
    strategies: Array<{ type: string; items: string[]; confidence: number }>
    avgMonthlyRevenue: number
    revenueRange: string
  }
  retention: Array<{ type: string; description: string; implementation: string; confidence: number }>
  differentiation: string[]
  competitors: Array<{ name: string; placeId: string; ccu: number; revenue: number; rating: string; age: string }>
  replicationChecklist: Array<{ category: string; items: Array<{ task: string; priority: string }> }>
  viabilityAssessment: {
    marketValidation: string
    competitionLevel: string
    entryDifficulty: string
    recommendation: string
  }
}

export default function NichesPage() {
  const [clusters, setClusters] = useState<Cluster[]>([])
  const [hotNiches, setHotNiches] = useState<Cluster[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null)
  const [study, setStudy] = useState<Study | null>(null)
  const [studyLoading, setStudyLoading] = useState(false)

  useEffect(() => {
    loadClusters()
  }, [])

  const loadClusters = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/auto-cluster?maxMonths=6&minCcu=100')
      const data = await res.json()

      if (data.error) throw new Error(data.error)

      setClusters(data.clusters || [])
      setHotNiches(data.hotNiches || [])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const reverseEngineer = async (cluster: Cluster) => {
    setSelectedCluster(cluster)
    setStudyLoading(true)
    setStudy(null)

    try {
      const res = await fetch('/api/reverse-engineer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          games: cluster.games,
          groupName: `${cluster.theme} ${cluster.template}`
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setStudy(data.study)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to analyze'
      setError(message)
    } finally {
      setStudyLoading(false)
    }
  }

  const formatRevenue = (rev: number): string => {
    if (rev >= 1_000_000) return '$' + (rev / 1_000_000).toFixed(1) + 'M'
    if (rev >= 1_000) return '$' + (rev / 1_000).toFixed(0) + 'K'
    return '$' + rev
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Auto-Discovery</div>
        <h1 className="text-3xl font-bold">Hot Niches</h1>
        <p className="text-gray-400 mt-1">
          Automatically clustered emerging games - find validated niches with 2+ recent successes
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-700 border-t-green-500"></div>
          <p className="text-gray-500 mt-4">Auto-clustering emerging games...</p>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-6 text-center">
          <p className="text-red-400">{error}</p>
          <button onClick={loadClusters} className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm">
            Retry
          </button>
        </div>
      )}

      {/* Hot Niches Section */}
      {!loading && hotNiches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <span className="text-2xl">🔥</span> Hot Niches
            <span className="text-sm font-normal text-gray-500">(2+ qualified emerging stars)</span>
          </h2>

          <div className="grid gap-4">
            {hotNiches.map((cluster) => (
              <div
                key={cluster.clusterId}
                className="bg-gradient-to-r from-green-900/20 to-green-800/10 border border-green-700/50 rounded-xl p-5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">
                      {cluster.theme} {cluster.template}
                    </h3>
                    <p className="text-gray-400 text-sm mt-1">
                      {cluster.gameCount} games · {cluster.qualifiedCount} qualified
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold text-lg">{formatRevenue(cluster.avgRevenue)}/mo avg</div>
                    <div className="text-gray-500 text-sm">{cluster.avgCCU.toLocaleString()} avg CCU</div>
                  </div>
                </div>

                {/* Emerging Stars */}
                <div className="mt-4 space-y-2">
                  <div className="text-sm text-gray-500">Emerging Stars:</div>
                  {cluster.emergingStars.slice(0, 3).map((star) => (
                    <div key={star.placeId} className="flex items-center justify-between bg-black/30 rounded-lg px-3 py-2 text-sm">
                      <span className="font-medium">{star.name}</span>
                      <div className="flex gap-4 text-xs">
                        <span className="text-green-400">{star.ccu.toLocaleString()} CCU</span>
                        <span className="text-yellow-400">{formatRevenue(star.revenue)}/mo</span>
                        <span className="text-gray-500">{star.daysOld}d old</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Button */}
                <button
                  onClick={() => reverseEngineer(cluster)}
                  className="mt-4 w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors"
                >
                  Reverse Engineer This Niche
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Clusters */}
      {!loading && clusters.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">All Detected Clusters</h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clusters.filter(c => !c.isHotNiche).map((cluster) => (
              <div
                key={cluster.clusterId}
                className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold">{cluster.theme} {cluster.template}</h3>
                    <p className="text-gray-500 text-sm">{cluster.gameCount} games</p>
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-yellow-400">{formatRevenue(cluster.avgRevenue)}/mo</div>
                    <div className="text-gray-500">{cluster.avgLikeRatio}% rating</div>
                  </div>
                </div>

                <button
                  onClick={() => reverseEngineer(cluster)}
                  className="mt-3 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
                >
                  Study Pattern
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reverse Engineering Study Modal */}
      {selectedCluster && (
        <div className="fixed inset-0 bg-black/80 z-50 overflow-y-auto">
          <div className="min-h-screen p-4 flex items-start justify-center">
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-2xl max-w-4xl w-full my-8">
              {/* Header */}
              <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{selectedCluster.theme} {selectedCluster.template}</h2>
                  <p className="text-gray-400">Reverse Engineering Study</p>
                </div>
                <button
                  onClick={() => { setSelectedCluster(null); setStudy(null); }}
                  className="w-10 h-10 rounded-lg bg-gray-800 hover:bg-gray-700 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>

              {/* Loading */}
              {studyLoading && (
                <div className="p-16 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-700 border-t-green-500"></div>
                  <p className="text-gray-500 mt-4">Analyzing patterns...</p>
                </div>
              )}

              {/* Study Results */}
              {study && (
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  {/* Viability Assessment */}
                  <div className={`p-4 rounded-xl ${
                    study.viabilityAssessment.recommendation.includes('HOT') ? 'bg-green-900/30 border border-green-700' :
                    study.viabilityAssessment.recommendation.includes('VIABLE') ? 'bg-yellow-900/30 border border-yellow-700' :
                    'bg-gray-800 border border-gray-700'
                  }`}>
                    <div className="text-lg font-bold mb-2">{study.viabilityAssessment.recommendation}</div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Market:</span>
                        <span className="ml-2 font-medium">{study.viabilityAssessment.marketValidation}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Competition:</span>
                        <span className="ml-2 font-medium">{study.viabilityAssessment.competitionLevel}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Difficulty:</span>
                        <span className="ml-2 font-medium">{study.viabilityAssessment.entryDifficulty}</span>
                      </div>
                    </div>
                  </div>

                  {/* Core Pattern */}
                  <div>
                    <h3 className="text-lg font-bold mb-3">Core Pattern</h3>
                    <div className="bg-[#1a1a1a] rounded-xl p-4">
                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div>
                          <span className="text-gray-500 text-sm">Template</span>
                          <p className="font-medium">{study.corePattern.template}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Theme</span>
                          <p className="font-medium">{study.corePattern.theme}</p>
                        </div>
                        <div>
                          <span className="text-gray-500 text-sm">Core Loop</span>
                          <p className="font-medium text-sm">{study.corePattern.coreLoop}</p>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm">{study.corePattern.description}</p>
                    </div>
                  </div>

                  {/* Monetization */}
                  <div>
                    <h3 className="text-lg font-bold mb-3">
                      Monetization
                      <span className="text-gray-500 text-sm font-normal ml-2">{study.monetization.revenueRange}</span>
                    </h3>
                    <div className="space-y-2">
                      {study.monetization.strategies.map((strategy, i) => (
                        <div key={i} className="bg-[#1a1a1a] rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{strategy.type}</span>
                            <span className="text-gray-500 text-sm">{Math.round(strategy.confidence * 100)}% likely</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {strategy.items.map((item, j) => (
                              <span key={j} className="px-2 py-1 bg-gray-800 rounded text-xs">{item}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Retention */}
                  <div>
                    <h3 className="text-lg font-bold mb-3">Retention Hooks</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {study.retention.map((hook, i) => (
                        <div key={i} className="bg-[#1a1a1a] rounded-lg p-3">
                          <div className="font-medium text-green-400">{hook.type}</div>
                          <p className="text-gray-400 text-sm mt-1">{hook.description}</p>
                          <p className="text-gray-500 text-xs mt-2">{hook.implementation}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Differentiation */}
                  <div>
                    <h3 className="text-lg font-bold mb-3">Differentiation Opportunities</h3>
                    <div className="space-y-2">
                      {study.differentiation.map((opp, i) => (
                        <div key={i} className="flex items-start gap-2 p-3 bg-[#1a1a1a] rounded-lg">
                          <span className="text-yellow-400">→</span>
                          <span className="text-gray-300">{opp}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Competitors */}
                  <div>
                    <h3 className="text-lg font-bold mb-3">Competitors</h3>
                    <div className="bg-[#1a1a1a] rounded-xl overflow-hidden">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-gray-500 border-b border-gray-800">
                            <th className="text-left p-3">Game</th>
                            <th className="text-right p-3">CCU</th>
                            <th className="text-right p-3">Revenue</th>
                            <th className="text-right p-3">Rating</th>
                            <th className="text-right p-3">Age</th>
                          </tr>
                        </thead>
                        <tbody>
                          {study.competitors.map((comp) => (
                            <tr key={comp.placeId} className="border-b border-gray-800/50">
                              <td className="p-3 font-medium">{comp.name}</td>
                              <td className="p-3 text-right text-green-400">{comp.ccu.toLocaleString()}</td>
                              <td className="p-3 text-right text-yellow-400">{formatRevenue(comp.revenue)}</td>
                              <td className="p-3 text-right">{comp.rating}</td>
                              <td className="p-3 text-right text-gray-500">{comp.age}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Replication Checklist */}
                  <div>
                    <h3 className="text-lg font-bold mb-3">Replication Checklist</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {study.replicationChecklist.map((category, i) => (
                        <div key={i} className="bg-[#1a1a1a] rounded-xl p-4">
                          <h4 className="font-medium mb-3">{category.category}</h4>
                          <div className="space-y-2">
                            {category.items.map((item, j) => (
                              <div key={j} className="flex items-center gap-2 text-sm">
                                <span className={`px-2 py-0.5 rounded text-xs ${
                                  item.priority === 'CRITICAL' ? 'bg-red-900/50 text-red-400' :
                                  item.priority === 'HIGH' ? 'bg-yellow-900/50 text-yellow-400' :
                                  'bg-gray-800 text-gray-400'
                                }`}>
                                  {item.priority}
                                </span>
                                <span className="text-gray-300">{item.task}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
        <h3 className="font-bold mb-3">How Auto-Clustering Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-400">
          <div className="space-y-1">
            <div className="text-white font-medium">1. Fetch Emerging</div>
            <p>Pulls from Roblox&apos;s official &quot;Up-and-Coming&quot; list</p>
          </div>
          <div className="space-y-1">
            <div className="text-white font-medium">2. Auto-Classify</div>
            <p>Detects template (Simulator, TD, etc.) and theme (Anime, Pet, etc.)</p>
          </div>
          <div className="space-y-1">
            <div className="text-white font-medium">3. Cluster</div>
            <p>Groups games by Template + Theme automatically</p>
          </div>
          <div className="space-y-1">
            <div className="text-white font-medium">4. Flag Hot Niches</div>
            <p>2+ qualified emerging stars = validated opportunity</p>
          </div>
        </div>
      </div>
    </div>
  )
}
