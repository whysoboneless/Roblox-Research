'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import WorkflowGuide from '@/components/WorkflowGuide'
import FirstTimeHint from '@/components/FirstTimeHint'

interface GameMetrics {
  ccu: number
  visits: number
  likeRatio: number
  estimatedRevenue: number
}

interface GameClassification {
  category: string
  vertical: string
  subVertical: string
  theme: string
  complexity: string
  targetAge: string
  coreMechanic: string
  loopSteps: string[]
  engagementHook: string
  retention: string[]
  monetization: string[]
  viral: string[]
  similarTo: string[]
}

interface AnalyzedGame {
  placeId: string
  name: string
  metrics: GameMetrics
  daysOld: number
  classification: GameClassification | null
}

interface PatternItem {
  pattern: string
  count: number
  percentage: number
}

interface GroupAnalysis {
  groupName: string
  gamesAnalyzed: number
  characteristics: {
    category: string
    vertical: string
    subVertical: string
    theme: string
    complexity: string
  }
  formula: {
    coreMechanic: string
    loopSteps: string[]
    engagementHook: string
  }
  metrics: {
    avgRevenue: number
    avgCCU: number
    avgLikeRatio: number
    totalRevenue: number
  }
  patterns: {
    mustHave: {
      retention: string[]
      monetization: string[]
      viral: string[]
    }
    shouldHave: {
      retention: string[]
      monetization: string[]
      viral: string[]
    }
    all: {
      retention: PatternItem[]
      monetization: PatternItem[]
      viral: PatternItem[]
    }
  }
  qualification: {
    score: number
    isQualified: boolean
    checks: {
      hasRevenueProof: boolean
      hasRecentSuccess: boolean
      multipleSuccesses: boolean
      hasHighEngagement: boolean
    }
    emergingStarCount: number
  }
  emergingStars: Array<{
    placeId: string
    name: string
    ccu: number
    revenue: number
    daysOld: number
  }>
  replicationGuide: {
    mustHave: string[]
    shouldHave: string[]
    differentiation: string[]
    coreRequirements: string[]
    pitfalls: string[]
    devTime: string
    teamSize: string
  } | null
  games: AnalyzedGame[]
}

function AnalyzeContent() {
  const searchParams = useSearchParams()
  const [placeIds, setPlaceIds] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [analysis, setAnalysis] = useState<GroupAnalysis | null>(null)
  const [error, setError] = useState('')
  const [groupName, setGroupName] = useState('')

  useEffect(() => {
    const ids = searchParams.get('ids')
    const name = searchParams.get('name')

    if (ids) {
      setPlaceIds(ids)
      if (name) {
        setGroupName(decodeURIComponent(name))
      }
      // Auto-trigger analysis when coming from emerging page
      setTimeout(() => {
        document.getElementById('analyze-btn')?.click()
      }, 100)
    }
  }, [searchParams])

  const handleAnalyze = async () => {
    setError('')
    setLoading(true)
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

    if (ids.length > 10) {
      setError('Maximum 10 games per analysis')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('/api/analyze-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placeIds: ids, groupName: groupName || undefined })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Analysis failed')
      }

      setAnalysis(data)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Analysis failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveGroup = async () => {
    if (!analysis) return

    setSaving(true)
    try {
      // The analyze-group endpoint already saves if groupName is provided
      // For manual save, we can re-call with a group name
      const res = await fetch('/api/analyze-group', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          placeIds: analysis.games.map(g => g.placeId),
          groupName: groupName || analysis.groupName
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to save group')
      }

      setSaved(true)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to save'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Workflow Progress */}
      <WorkflowGuide />

      {/* First Time Hint */}
      <FirstTimeHint id="analyze-intro" title="What happens here?">
        AI will analyze each game to find <strong>what they have in common</strong> - the core loop,
        monetization strategy, and retention hooks. Save your analysis to use in the Idea Lab for
        building your own game.
      </FirstTimeHint>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Analyze Games</h1>
        <p className="text-gray-400 mt-1">Extract the winning formula from similar games - patterns, monetization, and what makes them work.</p>
      </div>

      {/* Input Section */}
      <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
        <label className="block text-sm font-medium mb-2">Place IDs (max 10)</label>
        <textarea
          value={placeIds}
          onChange={(e) => setPlaceIds(e.target.value)}
          placeholder="Enter Place IDs separated by commas (e.g., 2753915549, 4587034896, 4996049426)"
          className="w-full h-24 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
        />
        <p className="text-gray-500 text-xs mt-2">
          Find Place IDs in Roblox game URLs: roblox.com/games/<strong>2753915549</strong>/Blox-Fruits
        </p>

        <div className="flex gap-3 mt-4">
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="Optional: Name this competitor group..."
            className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
          />
          <button
            id="analyze-btn"
            onClick={handleAnalyze}
            disabled={loading || !placeIds.trim()}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors whitespace-nowrap"
          >
            {loading ? 'Analyzing with AI...' : 'Analyze Games'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-900/30 border border-red-800 rounded-lg text-red-400">
            {error}
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-400">AI is analyzing games and extracting patterns...</p>
          <p className="text-gray-500 text-sm mt-2">This may take 30-60 seconds</p>
        </div>
      )}

      {/* Results */}
      {analysis && (
        <>
          {/* Main Analysis Card */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl overflow-hidden">
            {/* Header with Qualification */}
            <div className={`p-6 border-b border-gray-800 ${analysis.qualification.isQualified ? 'bg-green-900/10' : 'bg-yellow-900/10'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{analysis.groupName}</h2>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      analysis.characteristics.complexity === 'Low' ? 'bg-green-900/50 text-green-400' :
                      analysis.characteristics.complexity === 'Low-Medium' ? 'bg-blue-900/50 text-blue-400' :
                      analysis.characteristics.complexity === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-red-900/50 text-red-400'
                    }`}>
                      {analysis.characteristics.complexity}
                    </span>
                  </div>
                  <p className="text-gray-400 mt-1">
                    {analysis.characteristics.category} &gt; {analysis.characteristics.vertical} &gt; {analysis.characteristics.theme}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${analysis.qualification.isQualified ? 'text-green-400' : 'text-yellow-400'}`}>
                    {analysis.qualification.isQualified ? 'QUALIFIED' : 'NOT QUALIFIED'}
                  </div>
                  <div className="text-3xl font-bold">{analysis.qualification.score}<span className="text-gray-500 text-lg">/100</span></div>
                </div>
              </div>
            </div>

            {/* Core Mechanic */}
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-3">Core Mechanic</h3>
              <p className="text-xl font-medium text-green-400">{analysis.formula.coreMechanic}</p>
              {analysis.formula.loopSteps.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {analysis.formula.loopSteps.map((step, i) => (
                    <span key={i} className="px-3 py-1 bg-[#1a1a1a] rounded-full text-sm text-gray-300">
                      {i + 1}. {step}
                    </span>
                  ))}
                </div>
              )}
              {analysis.formula.engagementHook && (
                <p className="text-gray-500 text-sm mt-3 italic">
                  Hook: {analysis.formula.engagementHook}
                </p>
              )}
            </div>

            {/* Games Analyzed */}
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-3">
                Games Analyzed ({analysis.gamesAnalyzed})
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysis.games.map((game) => (
                  <a
                    key={game.placeId}
                    href={`https://www.roblox.com/games/${game.placeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-2 bg-[#1a1a1a] hover:bg-[#252525] rounded-lg text-sm transition-colors"
                  >
                    <span className="font-medium">{game.name}</span>
                    <span className="text-gray-500 ml-2">${game.metrics.estimatedRevenue.toLocaleString()}/mo</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Patterns - Three Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-800">
              {/* Retention */}
              <div className="p-6">
                <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="text-blue-400">+</span> Retention
                </h3>
                <div className="space-y-2">
                  {analysis.patterns.all.retention.slice(0, 6).map((item) => (
                    <div key={item.pattern} className="flex items-center justify-between">
                      <span className={`text-sm ${item.percentage >= 80 ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {item.pattern}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.percentage >= 80 ? 'bg-green-900/50 text-green-400' :
                        item.percentage >= 50 ? 'bg-blue-900/50 text-blue-400' :
                        'bg-gray-800 text-gray-500'
                      }`}>
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                  {analysis.patterns.all.retention.length === 0 && (
                    <p className="text-gray-500 text-sm">No patterns detected</p>
                  )}
                </div>
              </div>

              {/* Monetization */}
              <div className="p-6">
                <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="text-yellow-400">$</span> Monetization
                </h3>
                <div className="space-y-2">
                  {analysis.patterns.all.monetization.slice(0, 6).map((item) => (
                    <div key={item.pattern} className="flex items-center justify-between">
                      <span className={`text-sm ${item.percentage >= 80 ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {item.pattern}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.percentage >= 80 ? 'bg-green-900/50 text-green-400' :
                        item.percentage >= 50 ? 'bg-blue-900/50 text-blue-400' :
                        'bg-gray-800 text-gray-500'
                      }`}>
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                  {analysis.patterns.all.monetization.length === 0 && (
                    <p className="text-gray-500 text-sm">No patterns detected</p>
                  )}
                </div>
              </div>

              {/* Viral */}
              <div className="p-6">
                <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <span className="text-purple-400">^</span> Viral Mechanics
                </h3>
                <div className="space-y-2">
                  {analysis.patterns.all.viral.slice(0, 6).map((item) => (
                    <div key={item.pattern} className="flex items-center justify-between">
                      <span className={`text-sm ${item.percentage >= 80 ? 'text-white font-medium' : 'text-gray-400'}`}>
                        {item.pattern}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        item.percentage >= 80 ? 'bg-green-900/50 text-green-400' :
                        item.percentage >= 50 ? 'bg-blue-900/50 text-blue-400' :
                        'bg-gray-800 text-gray-500'
                      }`}>
                        {item.percentage}%
                      </span>
                    </div>
                  ))}
                  {analysis.patterns.all.viral.length === 0 && (
                    <p className="text-gray-500 text-sm">No patterns detected</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Qualification Checks */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Qualification Checks</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-lg ${analysis.qualification.checks.hasRevenueProof ? 'bg-green-900/20 border border-green-800' : 'bg-gray-800/50'}`}>
                <div className={`text-2xl mb-1 ${analysis.qualification.checks.hasRevenueProof ? 'text-green-400' : 'text-gray-500'}`}>
                  {analysis.qualification.checks.hasRevenueProof ? '✓' : '✗'}
                </div>
                <div className="text-sm font-medium">Revenue Proof</div>
                <div className="text-xs text-gray-500">$10k+/month game</div>
              </div>
              <div className={`p-4 rounded-lg ${analysis.qualification.checks.hasRecentSuccess ? 'bg-green-900/20 border border-green-800' : 'bg-gray-800/50'}`}>
                <div className={`text-2xl mb-1 ${analysis.qualification.checks.hasRecentSuccess ? 'text-green-400' : 'text-gray-500'}`}>
                  {analysis.qualification.checks.hasRecentSuccess ? '✓' : '✗'}
                </div>
                <div className="text-sm font-medium">Recent Success</div>
                <div className="text-xs text-gray-500">&lt;6 months, $5k+</div>
              </div>
              <div className={`p-4 rounded-lg ${analysis.qualification.checks.multipleSuccesses ? 'bg-green-900/20 border border-green-800' : 'bg-gray-800/50'}`}>
                <div className={`text-2xl mb-1 ${analysis.qualification.checks.multipleSuccesses ? 'text-green-400' : 'text-gray-500'}`}>
                  {analysis.qualification.checks.multipleSuccesses ? '✓' : '✗'}
                </div>
                <div className="text-sm font-medium">Multiple Winners</div>
                <div className="text-xs text-gray-500">2+ games $10k+</div>
              </div>
              <div className={`p-4 rounded-lg ${analysis.qualification.checks.hasHighEngagement ? 'bg-green-900/20 border border-green-800' : 'bg-gray-800/50'}`}>
                <div className={`text-2xl mb-1 ${analysis.qualification.checks.hasHighEngagement ? 'text-green-400' : 'text-gray-500'}`}>
                  {analysis.qualification.checks.hasHighEngagement ? '✓' : '✗'}
                </div>
                <div className="text-sm font-medium">High Engagement</div>
                <div className="text-xs text-gray-500">90%+ like ratio</div>
              </div>
            </div>
          </div>

          {/* Emerging Stars */}
          {analysis.emergingStars.length > 0 && (
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span className="text-yellow-400">★</span> Emerging Stars
              </h3>
              <div className="space-y-2">
                {analysis.emergingStars.map((star) => (
                  <div key={star.placeId} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                    <div>
                      <span className="font-medium">{star.name}</span>
                      <span className="text-gray-500 text-sm ml-2">({star.daysOld} days old)</span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="text-green-400">{star.ccu.toLocaleString()} CCU</span>
                      <span className="text-yellow-400">${star.revenue.toLocaleString()}/mo</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Replication Guide */}
          {analysis.replicationGuide && (
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Replication Guide</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Must Have */}
                <div>
                  <h4 className="text-sm text-green-400 font-medium mb-2 flex items-center gap-2">
                    <span>★</span> Must Have (Essential)
                  </h4>
                  <ul className="space-y-1">
                    {analysis.replicationGuide.mustHave.map((item, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-green-400 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Should Have */}
                <div>
                  <h4 className="text-sm text-blue-400 font-medium mb-2 flex items-center gap-2">
                    <span>◆</span> Should Have (Recommended)
                  </h4>
                  <ul className="space-y-1">
                    {analysis.replicationGuide.shouldHave.map((item, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-blue-400 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Differentiation */}
                <div>
                  <h4 className="text-sm text-purple-400 font-medium mb-2 flex items-center gap-2">
                    <span>◇</span> Differentiation Opportunities
                  </h4>
                  <ul className="space-y-1">
                    {analysis.replicationGuide.differentiation.map((item, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-purple-400 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Pitfalls */}
                <div>
                  <h4 className="text-sm text-red-400 font-medium mb-2 flex items-center gap-2">
                    <span>!</span> Pitfalls to Avoid
                  </h4>
                  <ul className="space-y-1">
                    {analysis.replicationGuide.pitfalls.map((item, i) => (
                      <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                        <span className="text-red-400 mt-0.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Dev Estimates */}
              <div className="flex gap-6 mt-6 pt-4 border-t border-gray-800">
                <div>
                  <span className="text-gray-500 text-sm">Est. Dev Time:</span>
                  <span className="ml-2 font-medium">{analysis.replicationGuide.devTime}</span>
                </div>
                <div>
                  <span className="text-gray-500 text-sm">Team Size:</span>
                  <span className="ml-2 font-medium">{analysis.replicationGuide.teamSize}</span>
                </div>
              </div>
            </div>
          )}

          {/* Metrics Summary */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Group Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-[#1a1a1a] rounded-lg">
                <div className="text-2xl font-bold text-green-400">{analysis.metrics.avgCCU.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Avg CCU</div>
              </div>
              <div className="p-4 bg-[#1a1a1a] rounded-lg">
                <div className="text-2xl font-bold text-yellow-400">${analysis.metrics.avgRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Avg Revenue/mo</div>
              </div>
              <div className="p-4 bg-[#1a1a1a] rounded-lg">
                <div className="text-2xl font-bold text-blue-400">{analysis.metrics.avgLikeRatio}%</div>
                <div className="text-sm text-gray-500">Avg Like Ratio</div>
              </div>
              <div className="p-4 bg-[#1a1a1a] rounded-lg">
                <div className="text-2xl font-bold text-purple-400">${analysis.metrics.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Total Group Revenue</div>
              </div>
            </div>
          </div>

          {/* Individual Game Classifications */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Individual Game Analysis</h3>
            <div className="space-y-4">
              {analysis.games.map((game) => (
                <div key={game.placeId} className="p-4 bg-[#1a1a1a] rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <a
                        href={`https://www.roblox.com/games/${game.placeId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-lg hover:text-green-400 transition-colors"
                      >
                        {game.name}
                      </a>
                      <div className="text-gray-500 text-sm">{game.daysOld} days old</div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-400 font-mono">{game.metrics.ccu.toLocaleString()} CCU</div>
                      <div className="text-yellow-400 font-mono">${game.metrics.estimatedRevenue.toLocaleString()}/mo</div>
                    </div>
                  </div>

                  {game.classification && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-gray-500">Vertical:</span>
                        <span className="ml-1">{game.classification.vertical}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Theme:</span>
                        <span className="ml-1">{game.classification.theme}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Complexity:</span>
                        <span className="ml-1">{game.classification.complexity}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Target:</span>
                        <span className="ml-1">{game.classification.targetAge}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Save Section */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
            {saved ? (
              <div className="flex items-center gap-2 text-green-400">
                <span>✓</span>
                <span>Saved to your research library with extracted patterns</span>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder={analysis.groupName || 'Enter group name to save...'}
                  className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-green-500"
                />
                <button
                  onClick={handleSaveGroup}
                  disabled={saving}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                  {saving ? 'Saving...' : 'Save to Research Library'}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={<div className="text-gray-400">Loading...</div>}>
      <AnalyzeContent />
    </Suspense>
  )
}
