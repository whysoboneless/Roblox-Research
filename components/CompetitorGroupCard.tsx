'use client'

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
  replicationGuide?: {
    mustHave: string[]
    shouldHave: string[]
    differentiation: string[]
    coreRequirements: string[]
    pitfalls: string[]
    devTime: string
    teamSize: string
  } | null
}

interface CompetitorGroupCardProps {
  analysis: GroupAnalysis
  compact?: boolean
  showReplicationGuide?: boolean
  onSelect?: () => void
}

export default function CompetitorGroupCard({
  analysis,
  compact = false,
  showReplicationGuide = true,
  onSelect
}: CompetitorGroupCardProps) {
  if (compact) {
    return (
      <div
        onClick={onSelect}
        className={`bg-[#0f0f0f] border border-gray-800 rounded-xl p-4 ${onSelect ? 'cursor-pointer hover:border-gray-600 transition-colors' : ''}`}
      >
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-bold text-lg">{analysis.groupName}</h3>
            <p className="text-gray-500 text-sm">
              {analysis.characteristics.category} &gt; {analysis.characteristics.vertical}
            </p>
          </div>
          <div className="text-right">
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              analysis.qualification.isQualified ? 'bg-green-900/50 text-green-400' : 'bg-yellow-900/50 text-yellow-400'
            }`}>
              {analysis.qualification.score}/100
            </span>
          </div>
        </div>

        <div className="mt-3 text-sm text-green-400">{analysis.formula.coreMechanic}</div>

        <div className="flex gap-4 mt-3 text-xs text-gray-500">
          <span>{analysis.gamesAnalyzed} games</span>
          <span>${analysis.metrics.avgRevenue.toLocaleString()}/mo avg</span>
          <span className={`${
            analysis.characteristics.complexity === 'Low' ? 'text-green-400' :
            analysis.characteristics.complexity === 'Low-Medium' ? 'text-blue-400' :
            'text-yellow-400'
          }`}>
            {analysis.characteristics.complexity}
          </span>
        </div>
      </div>
    )
  }

  return (
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

      {/* Patterns - Three Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-800">
        {/* Retention */}
        <div className="p-6">
          <h3 className="text-sm text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="text-blue-400">+</span> Retention
          </h3>
          <div className="space-y-2">
            {analysis.patterns.all.retention.slice(0, 5).map((item) => (
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
            {analysis.patterns.all.monetization.slice(0, 5).map((item) => (
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
            {analysis.patterns.all.viral.slice(0, 5).map((item) => (
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

      {/* Replication Guide */}
      {showReplicationGuide && analysis.replicationGuide && (
        <div className="p-6 border-t border-gray-800">
          <h3 className="text-lg font-bold mb-4">Replication Guide</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Must Have */}
            <div>
              <h4 className="text-sm text-green-400 font-medium mb-2 flex items-center gap-2">
                <span>★</span> Must Have
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
                <span>◆</span> Should Have
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
                <span>◇</span> Differentiation
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
                <span>!</span> Pitfalls
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
              <span className="text-gray-500 text-sm">Dev Time:</span>
              <span className="ml-2 font-medium">{analysis.replicationGuide.devTime}</span>
            </div>
            <div>
              <span className="text-gray-500 text-sm">Team:</span>
              <span className="ml-2 font-medium">{analysis.replicationGuide.teamSize}</span>
            </div>
          </div>
        </div>
      )}

      {/* Metrics Footer */}
      <div className="grid grid-cols-4 divide-x divide-gray-800 border-t border-gray-800">
        <div className="p-4 text-center">
          <div className="text-xl font-bold text-green-400">{analysis.metrics.avgCCU.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Avg CCU</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-xl font-bold text-yellow-400">${analysis.metrics.avgRevenue.toLocaleString()}</div>
          <div className="text-xs text-gray-500">Avg Rev/mo</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-xl font-bold text-blue-400">{analysis.metrics.avgLikeRatio}%</div>
          <div className="text-xs text-gray-500">Avg Rating</div>
        </div>
        <div className="p-4 text-center">
          <div className="text-xl font-bold">{analysis.gamesAnalyzed}</div>
          <div className="text-xs text-gray-500">Games</div>
        </div>
      </div>
    </div>
  )
}
