'use client'

import { VERTICAL_STRATEGIES, UI_TEMPLATES, getComplexityInfo } from '@/lib/roblox-classification'

// Generate pattern cards from the classification system's vertical strategies
const PATTERNS = Object.entries(VERTICAL_STRATEGIES).map(([vertical, strategy]) => {
  // Find matching template for complexity info
  const template = UI_TEMPLATES.find(t =>
    t.label.toLowerCase().includes(vertical.toLowerCase()) ||
    vertical.toLowerCase().includes(t.label.toLowerCase())
  )
  const complexity = template?.complexity || 'MEDIUM'

  return {
    id: vertical.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    name: vertical,
    complexity,
    coreLoop: strategy.coreLoop,
    retention: strategy.retention,
    monetization: strategy.monetization,
    viral: strategy.viral,
    coreRequirements: strategy.coreRequirements,
    pitfalls: strategy.pitfalls,
  }
})

export default function PatternsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Strategy Library</div>
        <h1 className="text-3xl font-bold">Proven Patterns</h1>
        <p className="text-gray-400 mt-1">
          {PATTERNS.length} game formats with strategies, requirements, and pitfalls from the classification system
        </p>
      </div>

      {/* Quick Jump */}
      <div className="flex flex-wrap gap-2">
        {PATTERNS.map((p) => {
          const info = getComplexityInfo(p.complexity)
          return (
            <a
              key={p.id}
              href={`#${p.id}`}
              className={`px-3 py-1.5 rounded-lg text-sm border border-gray-800 hover:border-gray-600 transition-colors`}
            >
              {p.name}
              <span className={`ml-2 text-[10px] ${info.color} px-1 py-0.5 rounded`}>{info.label}</span>
            </a>
          )
        })}
      </div>

      <div className="grid gap-6">
        {PATTERNS.map((pattern) => {
          const complexityInfo = getComplexityInfo(pattern.complexity)
          return (
            <div key={pattern.id} id={pattern.id} className="bg-[#0f0f0f] border border-gray-800 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">{pattern.name}</h2>
                    <p className="text-gray-400 mt-1 text-sm">
                      {complexityInfo.devTime} · {complexityInfo.teamSize}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${complexityInfo.color}`}>
                    {complexityInfo.label} Complexity
                  </span>
                </div>
              </div>

              {/* Core Loop */}
              <div className="p-6 bg-[#0a0a0a] border-b border-gray-800">
                <h3 className="text-sm text-gray-500 mb-2">Core Loop</h3>
                <p className="text-lg font-mono">{pattern.coreLoop}</p>
              </div>

              {/* Strategy Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                {/* Retention */}
                <div className="p-6">
                  <h3 className="text-sm text-green-500 mb-3">Retention Drivers</h3>
                  <ul className="space-y-2">
                    {pattern.retention.map((r, i) => (
                      <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">+</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Monetization */}
                <div className="p-6">
                  <h3 className="text-sm text-yellow-500 mb-3">Monetization Hooks</h3>
                  <ul className="space-y-2">
                    {pattern.monetization.map((m, i) => (
                      <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                        <span className="text-yellow-500 mt-0.5">$</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Viral */}
                <div className="p-6">
                  <h3 className="text-sm text-blue-500 mb-3">Viral Mechanics</h3>
                  <ul className="space-y-2">
                    {pattern.viral.map((v, i) => (
                      <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                        <span className="text-blue-500 mt-0.5">^</span>
                        {v}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Implementation Guide */}
              <div className="p-6 bg-[#0a0a0a] border-t border-gray-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm text-gray-500 mb-3">Core Requirements</h3>
                    <ul className="space-y-2">
                      {pattern.coreRequirements.map((r, i) => (
                        <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                          <span className="text-gray-500">•</span>
                          {r}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm text-red-500 mb-3">Common Pitfalls</h3>
                    <ul className="space-y-2">
                      {pattern.pitfalls.map((p, i) => (
                        <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                          <span className="text-red-500">!</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
