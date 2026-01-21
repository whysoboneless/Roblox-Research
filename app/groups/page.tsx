'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Group {
  id: string
  group_id: string
  group_name: string
  is_qualified: boolean
  qualification_score: number | null
  structural_characteristics: {
    genre?: string
    subGenre?: string
    theme?: string
    template?: string
    coreLoop?: string
  }
  analysis_notes: {
    marketStatus?: string
    opportunities?: string[]
    risks?: string[]
  }
  games: Array<{
    id: string
    place_id: number
    name: string
    genre: string
    is_emerging_star: boolean
    quality_score: number
  }>
  created_at: string
  updated_at: string
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'qualified' | 'unqualified'>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/groups')
      .then(res => res.json())
      .then(data => {
        setGroups(data.groups || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const filteredGroups = groups.filter(g => {
    if (filter === 'qualified') return g.is_qualified
    if (filter === 'unqualified') return !g.is_qualified
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Competitor Groups</h1>
          <p className="text-gray-400 mt-1">Manage and track your competitor research</p>
        </div>
        <Link
          href="/analyze"
          className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
        >
          + New Analysis
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(['all', 'qualified', 'unqualified'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-red-600 text-white'
                : 'bg-[#1a1a1a] text-gray-400 hover:text-white'
            }`}
          >
            {f === 'all' ? 'All Groups' : f === 'qualified' ? 'Qualified' : 'Not Qualified'}
          </button>
        ))}
      </div>

      {/* Groups List */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Loading groups...</div>
      ) : filteredGroups.length === 0 ? (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">
            {groups.length === 0
              ? 'No competitor groups yet. Start by analyzing some games!'
              : 'No groups match the current filter.'}
          </p>
          <Link
            href="/analyze"
            className="inline-block px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
          >
            Analyze Games
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((group) => (
            <div
              key={group.id}
              className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden"
            >
              {/* Header */}
              <button
                onClick={() => setExpandedId(expandedId === group.id ? null : group.id)}
                className="w-full p-6 text-left hover:bg-[#222] transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      group.is_qualified
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-yellow-900/50 text-yellow-400'
                    }`}>
                      {group.is_qualified ? 'Qualified' : 'Not Qualified'}
                    </span>
                    <h2 className="text-xl font-bold">{group.group_name}</h2>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{group.qualification_score || '-'}</div>
                      <div className="text-gray-500 text-xs">Score</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{group.games?.length || 0}</div>
                      <div className="text-gray-500 text-xs">Games</div>
                    </div>
                    <span className="text-gray-500 text-xl">
                      {expandedId === group.id ? '▼' : '▶'}
                    </span>
                  </div>
                </div>

                {/* Characteristics Tags */}
                <div className="flex gap-2 mt-4 flex-wrap">
                  {group.structural_characteristics.genre && (
                    <span className="px-2 py-1 bg-[#111] rounded text-xs text-gray-400">
                      {group.structural_characteristics.genre}
                    </span>
                  )}
                  {group.structural_characteristics.subGenre && (
                    <span className="px-2 py-1 bg-[#111] rounded text-xs text-gray-400">
                      {group.structural_characteristics.subGenre}
                    </span>
                  )}
                  {group.structural_characteristics.theme && (
                    <span className="px-2 py-1 bg-[#111] rounded text-xs text-gray-400">
                      {group.structural_characteristics.theme}
                    </span>
                  )}
                  {group.structural_characteristics.template && (
                    <span className="px-2 py-1 bg-[#111] rounded text-xs text-blue-400">
                      {group.structural_characteristics.template}
                    </span>
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {expandedId === group.id && (
                <div className="border-t border-gray-800 p-6 bg-[#111]">
                  {/* Core Loop */}
                  {group.structural_characteristics.coreLoop && (
                    <div className="mb-6">
                      <h4 className="text-sm text-gray-500 mb-1">Core Loop</h4>
                      <p className="text-gray-300">{group.structural_characteristics.coreLoop}</p>
                    </div>
                  )}

                  {/* Market Status */}
                  {group.analysis_notes.marketStatus && (
                    <div className="mb-6">
                      <h4 className="text-sm text-gray-500 mb-1">Market Status</h4>
                      <p className="text-gray-300">{group.analysis_notes.marketStatus}</p>
                    </div>
                  )}

                  {/* Opportunities & Risks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {group.analysis_notes.opportunities && group.analysis_notes.opportunities.length > 0 && (
                      <div>
                        <h4 className="text-sm text-green-500 mb-2">Opportunities</h4>
                        <ul className="space-y-1">
                          {group.analysis_notes.opportunities.map((opp, i) => (
                            <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                              <span className="text-green-500">+</span>
                              {opp}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {group.analysis_notes.risks && group.analysis_notes.risks.length > 0 && (
                      <div>
                        <h4 className="text-sm text-red-500 mb-2">Risks</h4>
                        <ul className="space-y-1">
                          {group.analysis_notes.risks.map((risk, i) => (
                            <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                              <span className="text-red-500">-</span>
                              {risk}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                  {/* Games in Group */}
                  {group.games && group.games.length > 0 && (
                    <div>
                      <h4 className="text-sm text-gray-500 mb-3">Games in this group</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {group.games.map((game) => (
                          <div key={game.id} className="flex items-center justify-between p-3 bg-[#1a1a1a] rounded-lg">
                            <div className="flex items-center gap-2">
                              {game.is_emerging_star && (
                                <span className="text-yellow-400">⭐</span>
                              )}
                              <span className="font-medium">{game.name}</span>
                            </div>
                            <span className="text-gray-500 text-sm">{game.genre}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
