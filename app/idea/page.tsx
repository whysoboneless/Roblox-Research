'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface AIGamePlan {
  score: number
  verdict: string
  summary: string
  coreMechanics: string[]
  monetizationPlan: string[]
  retentionHooks: string[]
  viralStrategy: string[]
  weekByWeekPlan: string[]
  risks: string[]
  competitors: string[]
  uniqueAdvice: string
}

interface ProvenFormula {
  template: string
  theme: string
  coreLoop: string
  description: string
  avgRevenue: number
  emergingCount: number
  mechanics: string[]
  monetization: string[]
  retention: string[]
  exampleGames: string[]
  // From saved research
  groupId?: string
  groupName?: string
  qualificationScore?: number
  pitfalls?: string[]
}

const GAME_TEMPLATES = [
  { id: 'simulator', label: 'Simulator', desc: 'Click/collect/upgrade loops' },
  { id: 'tower-defense', label: 'Tower Defense', desc: 'Place units, defend waves' },
  { id: 'tycoon', label: 'Tycoon', desc: 'Build and manage' },
  { id: 'horror', label: 'Horror', desc: 'Scary survival/escape' },
  { id: 'roleplay', label: 'Roleplay', desc: 'Social life simulation' },
  { id: 'fighting', label: 'Fighting', desc: 'Combat and PvP' },
  { id: 'obby', label: 'Obby', desc: 'Obstacle courses' },
  { id: 'other', label: 'Other', desc: 'Something different' },
]

const THEMES = [
  'Anime', 'Pets', 'Fantasy', 'Sci-Fi', 'Horror', 'Military',
  'Sports', 'Food', 'Nature', 'Superhero', 'Pirates', 'Zombies', 'Meme/Brainrot', 'Other'
]

const MONETIZATION = [
  { id: 'gamepass', label: 'Gamepasses' },
  { id: 'devproduct', label: 'Dev Products' },
  { id: 'premium', label: 'Premium Payouts' },
  { id: 'trading', label: 'Trading System' },
  { id: 'battlepass', label: 'Battle Pass' },
  { id: 'gacha', label: 'Gacha/Loot' },
]

export default function IdeaPage() {
  const [mode, setMode] = useState<'choose' | 'scratch' | 'formula' | 'hybrid'>('choose')
  const [step, setStep] = useState(1)
  const [idea, setIdea] = useState({
    name: '',
    template: '',
    theme: '',
    coreLoop: '',
    monetization: [] as string[],
    uniqueHook: '',
  })
  const [result, setResult] = useState<AIGamePlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [helpingLoop, setHelpingLoop] = useState(false)
  const [loopSuggestion, setLoopSuggestion] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // For formula mode
  const [hotFormulas, setHotFormulas] = useState<ProvenFormula[]>([])
  const [loadingFormulas, setLoadingFormulas] = useState(false)
  const [selectedFormula, setSelectedFormula] = useState<ProvenFormula | null>(null)

  // For hybrid mode - blend two formulas
  const [hybridBase, setHybridBase] = useState<ProvenFormula | null>(null) // The mechanic (e.g., Escape/Tsunami)
  const [hybridTheme, setHybridTheme] = useState<ProvenFormula | null>(null) // The trending theme (e.g., Brainrot)

  // For scratch mode - market research
  const [marketResearch, setMarketResearch] = useState<{
    competitors: any[]
    whatsWorking: string[]
    gaps: string[]
    suggestedPatterns: { retention: string[], monetization: string[], viral: string[] }
  } | null>(null)
  const [researchingMarket, setResearchingMarket] = useState(false)

  // Research market for scratch mode - find real competitors and gaps
  const researchMarket = async () => {
    setResearchingMarket(true)
    setMarketResearch(null)

    try {
      // Build search keywords from user's idea
      const searchTerms = `${idea.template} ${idea.theme} ${idea.coreLoop}`.toLowerCase()

      // Search for similar emerging games
      const emergingRes = await fetch(`/api/emerging?limit=30&minCcu=50`)
      const emergingData = await emergingRes.json()

      if (!emergingData.games) throw new Error('Failed to fetch emerging games')

      // Filter games that match the user's concept
      const matchingGames = emergingData.games.filter((game: any) => {
        const gameName = game.name.toLowerCase()
        const templateMatch = idea.template && (
          gameName.includes(idea.template) ||
          (idea.template === 'simulator' && (gameName.includes('sim') || gameName.includes('collect'))) ||
          (idea.template === 'tower-defense' && (gameName.includes('tower') || gameName.includes('defense') || gameName.includes('td'))) ||
          (idea.template === 'tycoon' && gameName.includes('tycoon')) ||
          (idea.template === 'horror' && (gameName.includes('horror') || gameName.includes('scary') || gameName.includes('escape'))) ||
          (idea.template === 'obby' && (gameName.includes('obby') || gameName.includes('parkour')))
        )
        const themeMatch = idea.theme && gameName.includes(idea.theme.toLowerCase().split('/')[0])
        return templateMatch || themeMatch
      }).slice(0, 8)

      // Also check saved competitor groups for patterns
      const groupsRes = await fetch('/api/competitor-group')
      const groupsData = await groupsRes.json()

      // Find relevant saved groups
      const relevantGroups = (groupsData.groups || []).filter((group: any) => {
        const chars = group.structural_characteristics || {}
        return (
          chars.vertical?.toLowerCase().includes(idea.template) ||
          chars.theme?.toLowerCase().includes(idea.theme?.toLowerCase().split('/')[0] || '')
        )
      })

      // Extract patterns from relevant groups
      const allRetention: string[] = []
      const allMonetization: string[] = []
      const allViral: string[] = []

      relevantGroups.forEach((group: any) => {
        const patterns = group.analysis_notes?.overlappingPatterns || {}
        if (patterns.mustHave?.retention) allRetention.push(...patterns.mustHave.retention)
        if (patterns.mustHave?.monetization) allMonetization.push(...patterns.mustHave.monetization)
        if (patterns.mustHave?.viral) allViral.push(...patterns.mustHave.viral)
      })

      // Dedupe patterns
      const uniqueRetention = [...new Set(allRetention)].slice(0, 5)
      const uniqueMonetization = [...new Set(allMonetization)].slice(0, 5)
      const uniqueViral = [...new Set(allViral)].slice(0, 5)

      // Analyze what's working
      const whatsWorking: string[] = []
      if (matchingGames.length > 0) {
        const avgCcu = matchingGames.reduce((sum: number, g: any) => sum + (g.metrics?.currentPlayers || 0), 0) / matchingGames.length
        whatsWorking.push(`${matchingGames.length} emerging games found in this space`)
        if (avgCcu > 500) whatsWorking.push(`Strong player engagement (avg ${Math.round(avgCcu)} CCU)`)

        // Check for common patterns in names
        const hasPrestige = matchingGames.some((g: any) => g.name.toLowerCase().includes('rebirth') || g.name.toLowerCase().includes('prestige'))
        const hasBrainrot = matchingGames.some((g: any) => g.name.toLowerCase().includes('brainrot') || g.name.toLowerCase().includes('skibidi'))

        if (hasPrestige) whatsWorking.push('Prestige/rebirth systems are common')
        if (hasBrainrot) whatsWorking.push('Meme/brainrot themes are trending')
      }

      // Identify gaps (what could make your idea 20% better)
      const gaps: string[] = []
      if (matchingGames.length === 0) {
        gaps.push('No direct competitors found - could be untested or blue ocean')
      } else {
        // Check what most games DON'T have
        const hasTrading = matchingGames.some((g: any) => g.name.toLowerCase().includes('trade'))
        const hasCoop = matchingGames.some((g: any) => g.name.toLowerCase().includes('coop') || g.name.toLowerCase().includes('team'))
        const hasPvp = matchingGames.some((g: any) => g.name.toLowerCase().includes('pvp') || g.name.toLowerCase().includes('battle'))

        if (!hasTrading) gaps.push('Trading system could add social retention')
        if (!hasCoop) gaps.push('Co-op/multiplayer features are rare - opportunity')
        if (!hasPvp) gaps.push('Competitive/PvP mode could differentiate')
        gaps.push('Events system (like Wave Wednesday) drives recurring engagement')
        gaps.push('Admin abuse / chaos events create viral moments')
      }

      setMarketResearch({
        competitors: matchingGames,
        whatsWorking,
        gaps: gaps.slice(0, 5),
        suggestedPatterns: {
          retention: uniqueRetention.length > 0 ? uniqueRetention : ['Daily rewards', 'Prestige system', 'Collection completion'],
          monetization: uniqueMonetization.length > 0 ? uniqueMonetization : ['2x multiplier pass', 'Auto-collect', 'VIP bundle'],
          viral: uniqueViral.length > 0 ? uniqueViral : ['Promo codes', 'Group rewards', 'Big number flexing']
        }
      })

    } catch (err) {
      console.error('Market research failed:', err)
      // Provide fallback data
      setMarketResearch({
        competitors: [],
        whatsWorking: ['Unable to fetch live data - using general patterns'],
        gaps: ['Add unique twist to stand out', 'Consider trending themes', 'Social features increase retention'],
        suggestedPatterns: {
          retention: ['Daily rewards', 'Prestige system', 'Collection completion'],
          monetization: ['2x multiplier pass', 'Auto-collect', 'VIP bundle'],
          viral: ['Promo codes', 'Group rewards', 'Events system']
        }
      })
    } finally {
      setResearchingMarket(false)
    }
  }

  // Load proven formulas from saved groups + pattern library fallback
  const loadHotFormulas = async () => {
    setLoadingFormulas(true)
    try {
      // First, try to load from saved competitor groups (your research)
      const groupsRes = await fetch('/api/competitor-group')
      const groupsData = await groupsRes.json()

      const formulas: ProvenFormula[] = []

      // Add formulas from your saved research
      if (groupsData.groups && groupsData.groups.length > 0) {
        const savedFormulas = groupsData.groups
          .filter((group: any) => group.qualification_score >= 50)
          .map((group: any) => {
            const chars = group.structural_characteristics || {}
            const patterns = group.analysis_notes?.overlappingPatterns || {}
            const guide = group.analysis_notes?.replicationGuide || {}

            const exampleGames = group.group_games
              ?.slice(0, 3)
              .map((gg: any) => gg.games?.name)
              .filter(Boolean) || []

            const mustHaveRetention = patterns.mustHave?.retention || []
            const mustHaveMonetization = patterns.mustHave?.monetization || []
            const coreRequirements = guide.coreRequirements || guide.mustHave || []

            return {
              template: chars.vertical || chars.category || 'Unknown',
              theme: chars.theme || 'Unknown',
              coreLoop: chars.dominantCoreLoop || 'See research for details',
              description: `${chars.theme || ''} ${chars.vertical || ''} - From your saved research`,
              avgRevenue: guide.metrics?.avgRevenue || 0,
              emergingCount: group.qualification_criteria?.emergingStarCount || group.group_games?.length || 0,
              mechanics: coreRequirements.slice(0, 5),
              monetization: mustHaveMonetization.slice(0, 4),
              retention: mustHaveRetention.slice(0, 4),
              exampleGames,
              groupId: group.group_id,
              groupName: group.group_name,
              qualificationScore: group.qualification_score,
              pitfalls: guide.pitfalls || []
            }
          })
        formulas.push(...savedFormulas)
      }

      // If no saved research, load from proven patterns library
      if (formulas.length === 0) {
        try {
          const patternsRes = await fetch('/api/patterns')
          const patternsData = await patternsRes.json()

          // Convert core_loop patterns to formulas
          const coreLoopPatterns = patternsData.provenPatterns?.filter(
            (p: any) => p.type === 'core_loop'
          ) || []

          const patternFormulas = coreLoopPatterns.map((p: any) => ({
            template: p.data.template || 'Unknown',
            theme: 'Various',
            coreLoop: p.data.name || 'Core gameplay loop',
            description: p.data.description || 'Proven game pattern',
            avgRevenue: 50000, // Conservative estimate for proven patterns
            emergingCount: 3,
            mechanics: p.data.mechanics || [],
            monetization: ['Gamepasses', '2x Multipliers', 'VIP'],
            retention: ['Daily rewards', 'Prestige system'],
            exampleGames: p.data.successExamples || [],
            qualificationScore: Math.round((p.confidence || 0.8) * 100),
            pitfalls: []
          }))

          formulas.push(...patternFormulas)
        } catch (err) {
          console.error('Failed to load patterns library:', err)
        }
      }

      setHotFormulas(formulas)
    } catch (err) {
      console.error('Failed to load formulas:', err)
    } finally {
      setLoadingFormulas(false)
    }
  }

  // When entering formula or hybrid mode, load formulas
  useEffect(() => {
    if ((mode === 'formula' || mode === 'hybrid') && hotFormulas.length === 0) {
      loadHotFormulas()
    }
  }, [mode])

  // Select a formula and pre-fill
  const selectFormula = (formula: ProvenFormula) => {
    setSelectedFormula(formula)
    setIdea({
      name: '',
      template: formula.template.toLowerCase().replace(' ', '-'),
      theme: formula.theme,
      coreLoop: formula.coreLoop,
      monetization: [],
      uniqueHook: '',
    })
    setStep(2) // Jump to the twist step
  }

  // AI: Help articulate the core loop
  const helpWithLoop = async () => {
    if (!idea.coreLoop.trim() || idea.coreLoop.length < 10) return

    setHelpingLoop(true)
    setLoopSuggestion(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'help-articulate',
          data: {
            coreLoop: idea.coreLoop,
            template: idea.template,
            theme: idea.theme
          }
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setLoopSuggestion(data.result)
    } catch (err: unknown) {
      console.error('Help failed:', err)
    } finally {
      setHelpingLoop(false)
    }
  }

  // AI: Qualify and generate game plan
  const qualifyIdea = async () => {
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'qualify-idea',
          data: {
            ...idea,
            baseFormula: selectedFormula ? `${selectedFormula.theme} ${selectedFormula.template}` : null,
            // Pass market research for data-backed analysis
            marketResearch: marketResearch ? {
              competitorCount: marketResearch.competitors.length,
              competitorNames: marketResearch.competitors.slice(0, 5).map((c: any) => c.name),
              whatsWorking: marketResearch.whatsWorking,
              gaps: marketResearch.gaps,
              suggestedPatterns: marketResearch.suggestedPatterns
            } : null
          }
        })
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      if (typeof data.result === 'object') {
        setResult(data.result)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to analyze idea'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setResult(null)
    setStep(1)
    setMode('choose')
    setSelectedFormula(null)
    setHybridBase(null)
    setHybridTheme(null)
    setMarketResearch(null)
    setIdea({ name: '', template: '', theme: '', coreLoop: '', monetization: [], uniqueHook: '' })
    setLoopSuggestion(null)
    setError(null)
  }

  // Mode Selection
  if (mode === 'choose' && !result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Create & Validate</h1>
          <p className="text-gray-400 mt-1">Build a game concept backed by real market data</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {/* Start from Proven Formula */}
          <button
            onClick={() => setMode('formula')}
            className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-700/50 rounded-xl p-6 text-left hover:border-green-600 transition-colors"
          >
            <div className="text-2xl mb-2">🔥</div>
            <h3 className="text-xl font-bold">Proven Formula</h3>
            <p className="text-gray-400 mt-2 text-sm">
              Pick a validated niche from your research, then add your unique twist
            </p>
            <div className="mt-4 text-green-400 text-sm font-medium">
              Recommended →
            </div>
          </button>

          {/* Hybrid Formula - NEW */}
          <button
            onClick={() => setMode('hybrid')}
            className="bg-gradient-to-br from-purple-900/30 to-blue-900/10 border border-purple-700/50 rounded-xl p-6 text-left hover:border-purple-600 transition-colors"
          >
            <div className="text-2xl mb-2">🧬</div>
            <h3 className="text-xl font-bold">Hybrid Formula</h3>
            <p className="text-gray-400 mt-2 text-sm">
              Blend a proven mechanic with a trending theme - like &quot;Escape Tsunami + Brainrot&quot;
            </p>
            <div className="mt-4 text-purple-400 text-sm font-medium">
              High potential →
            </div>
          </button>

          {/* Start from Scratch */}
          <button
            onClick={() => setMode('scratch')}
            className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 text-left hover:border-gray-700 transition-colors"
          >
            <div className="text-2xl mb-2">✨</div>
            <h3 className="text-xl font-bold">From Scratch</h3>
            <p className="text-gray-400 mt-2 text-sm">
              Have your own idea? Describe it and get AI-powered validation
            </p>
            <div className="mt-4 text-gray-500 text-sm font-medium">
              For experienced →
            </div>
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
          <h3 className="font-bold mb-3">Need Inspiration?</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/emerging" className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium">
              Discover Trending Games
            </Link>
            <Link href="/groups" className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] rounded-lg text-sm">
              View Saved Research
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Formula Selection Mode
  if (mode === 'formula' && step === 1 && !result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <button onClick={() => setMode('choose')} className="text-gray-500 hover:text-white text-sm mb-2">
            ← Back to options
          </button>
          <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Step 1 of 3</div>
          <h1 className="text-3xl font-bold">Pick a Proven Formula</h1>
          <p className="text-gray-400 mt-1">These niches have 2+ emerging stars in the last 6 months</p>
        </div>

        {loadingFormulas ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-700 border-t-green-500"></div>
            <p className="text-gray-500 mt-4">Loading validated formulas...</p>
          </div>
        ) : hotFormulas.length > 0 ? (
          <div className="space-y-4">
            {hotFormulas.map((formula, i) => (
              <div
                key={i}
                className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-5 hover:border-green-700 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-bold">{formula.theme} {formula.template}</h3>
                    <p className="text-gray-400 mt-1">{formula.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-green-400 font-bold">${(formula.avgRevenue / 1000).toFixed(0)}K/mo avg</div>
                    <div className="text-gray-500 text-sm">{formula.emergingCount} emerging stars</div>
                  </div>
                </div>

                {/* Core Pattern */}
                <div className="mt-4 p-3 bg-[#1a1a1a] rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Core Loop</div>
                  <div className="text-sm font-medium">{formula.coreLoop}</div>
                </div>

                {/* Examples */}
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500">Examples:</span>
                  {formula.exampleGames.map((game, j) => (
                    <span key={j} className="px-2 py-1 bg-gray-800 rounded text-xs">{game}</span>
                  ))}
                </div>

                {/* Select Button */}
                <button
                  onClick={() => selectFormula(formula)}
                  className="mt-4 w-full py-3 bg-green-600 hover:bg-green-500 rounded-lg font-medium transition-colors"
                >
                  Use This Formula
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p>No saved research yet.</p>
            <p className="text-sm mt-2">Discover trending games and analyze them to build your formula library.</p>
            <div className="flex gap-3 justify-center mt-4">
              <Link href="/emerging" className="px-6 py-3 bg-green-600 rounded-xl font-semibold text-white">
                Discover Games
              </Link>
              <button
                onClick={() => setMode('scratch')}
                className="px-6 py-3 bg-[#1a1a1a] rounded-xl font-semibold border border-gray-700"
              >
                Start from Scratch
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // HYBRID MODE - Step 1: Pick the BASE mechanic (e.g., Escape/Tsunami)
  if (mode === 'hybrid' && step === 1 && !result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <button onClick={() => setMode('choose')} className="text-gray-500 hover:text-white text-sm mb-2">
            ← Back to options
          </button>
          <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Step 1 of 4</div>
          <h1 className="text-3xl font-bold">Pick the BASE Mechanic</h1>
          <p className="text-gray-400 mt-1">This is the proven gameplay loop you want to use (e.g., Escape/Survival, Simulator, TD)</p>
        </div>

        {loadingFormulas ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-700 border-t-purple-500"></div>
            <p className="text-gray-500 mt-4">Loading your saved research...</p>
          </div>
        ) : hotFormulas.length > 0 ? (
          <div className="space-y-3">
            {hotFormulas.map((formula, i) => (
              <button
                key={i}
                onClick={() => { setHybridBase(formula); setStep(2); }}
                className={`w-full text-left bg-[#0f0f0f] border rounded-xl p-4 transition-colors ${
                  hybridBase?.groupId === formula.groupId ? 'border-purple-500' : 'border-gray-800 hover:border-purple-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{formula.groupName || `${formula.theme} ${formula.template}`}</h3>
                    <p className="text-gray-500 text-sm mt-1">{formula.coreLoop}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-purple-400 font-bold">{formula.qualificationScore}/100</div>
                    <div className="text-gray-500 text-xs">{formula.emergingCount} games</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p>No saved competitor groups found.</p>
            <p className="text-sm mt-2">Research some games first to use hybrid mode.</p>
            <Link href="/emerging" className="mt-4 inline-block px-6 py-3 bg-purple-600 rounded-xl font-semibold">
              Discover Games to Research
            </Link>
          </div>
        )}
      </div>
    )
  }

  // HYBRID MODE - Step 2: Pick the THEME source (e.g., Brainrot, Anime)
  if (mode === 'hybrid' && step === 2 && hybridBase && !result) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <button onClick={() => setStep(1)} className="text-gray-500 hover:text-white text-sm mb-2">
            ← Change base mechanic
          </button>
          <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Step 2 of 4</div>
          <h1 className="text-3xl font-bold">Pick the TRENDING Theme</h1>
          <p className="text-gray-400 mt-1">This is the hot theme/aesthetic to blend in (e.g., Brainrot, Anime)</p>
        </div>

        {/* Show selected base */}
        <div className="bg-purple-900/20 border border-purple-700/50 rounded-xl p-4">
          <div className="text-xs text-purple-400 mb-1">BASE MECHANIC</div>
          <div className="font-bold">{hybridBase.groupName || `${hybridBase.theme} ${hybridBase.template}`}</div>
          <div className="text-gray-400 text-sm">{hybridBase.coreLoop}</div>
        </div>

        <div className="space-y-3">
          <p className="text-gray-500 text-sm">Pick a different formula to blend themes from:</p>
          {hotFormulas
            .filter(f => f.groupId !== hybridBase.groupId) // Don't show the same one
            .map((formula, i) => (
              <button
                key={i}
                onClick={() => { setHybridTheme(formula); setStep(3); }}
                className={`w-full text-left bg-[#0f0f0f] border rounded-xl p-4 transition-colors ${
                  hybridTheme?.groupId === formula.groupId ? 'border-blue-500' : 'border-gray-800 hover:border-blue-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">{formula.groupName || `${formula.theme} ${formula.template}`}</h3>
                    <div className="text-blue-400 text-sm mt-1">Theme: {formula.theme}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-blue-400 font-bold">{formula.qualificationScore}/100</div>
                  </div>
                </div>
              </button>
            ))}

          {/* Or pick a trending theme manually */}
          <div className="pt-4 border-t border-gray-800">
            <p className="text-gray-500 text-sm mb-3">Or pick a trending theme manually:</p>
            <div className="flex flex-wrap gap-2">
              {['Meme/Brainrot', 'Anime', 'Horror', 'Cute/Kawaii', 'Sci-Fi', 'Fantasy'].map((theme) => (
                <button
                  key={theme}
                  onClick={() => {
                    setHybridTheme({
                      template: 'Theme',
                      theme: theme,
                      coreLoop: `Trending ${theme} aesthetic`,
                      description: `${theme} theme`,
                      avgRevenue: 0,
                      emergingCount: 0,
                      mechanics: [],
                      monetization: [],
                      retention: [],
                      exampleGames: []
                    });
                    setStep(3);
                  }}
                  className="px-4 py-2 bg-[#1a1a1a] hover:bg-blue-900/30 hover:border-blue-700 border border-gray-800 rounded-lg text-sm"
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // HYBRID MODE - Step 3: Preview the blend
  if (mode === 'hybrid' && step === 3 && hybridBase && hybridTheme && !result) {
    // Create the hybrid formula description
    const hybridCoreLoop = `${hybridBase.coreLoop} + ${hybridTheme.theme} theme`

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <button onClick={() => setStep(2)} className="text-gray-500 hover:text-white text-sm mb-2">
            ← Change theme
          </button>
          <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Step 3 of 4</div>
          <h1 className="text-3xl font-bold">Your Hybrid Formula</h1>
          <p className="text-gray-400 mt-1">Review the blend and add your unique twist</p>
        </div>

        {/* The Blend */}
        <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-xl p-6">
          <div className="text-center mb-4">
            <div className="text-xs text-gray-500 mb-2">YOUR HYBRID</div>
            <h2 className="text-2xl font-bold">{hybridTheme.theme} {hybridBase.template}</h2>
            <p className="text-gray-400 mt-2">&quot;{hybridBase.template}&quot; mechanics + &quot;{hybridTheme.theme}&quot; theme</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-6">
            <div className="bg-purple-950/30 rounded-lg p-4">
              <div className="text-xs text-purple-400 mb-2">BASE MECHANIC</div>
              <div className="font-medium">{hybridBase.coreLoop}</div>
              {hybridBase.mechanics.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {hybridBase.mechanics.slice(0, 3).map((m, i) => (
                    <span key={i} className="px-2 py-0.5 bg-purple-900/50 rounded text-xs">{m}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="bg-blue-950/30 rounded-lg p-4">
              <div className="text-xs text-blue-400 mb-2">TRENDING THEME</div>
              <div className="font-medium">{hybridTheme.theme}</div>
              {hybridTheme.retention.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {hybridTheme.retention.slice(0, 3).map((r, i) => (
                    <span key={i} className="px-2 py-0.5 bg-blue-900/50 rounded text-xs">{r}</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Details Form */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Game Name</label>
            <input
              type="text"
              value={idea.name}
              onChange={(e) => setIdea(p => ({ ...p, name: e.target.value }))}
              placeholder={`${hybridTheme.theme} ${hybridBase.template}`}
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Your Unique Twist <span className="text-red-400">*</span>
            </label>
            <textarea
              value={idea.uniqueHook}
              onChange={(e) => setIdea(p => ({ ...p, uniqueHook: e.target.value }))}
              placeholder="What makes YOUR version different? Examples:
• Unique character designs
• Different game mode (co-op, PvP)
• New mechanics layered on top
• Different art style"
              className="w-full h-28 bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-600 resize-none"
            />
          </div>

          <button
            onClick={() => {
              // Pre-fill the idea with hybrid data
              setIdea(prev => ({
                ...prev,
                template: hybridBase.template.toLowerCase().replace(' ', '-'),
                theme: hybridTheme.theme,
                coreLoop: hybridCoreLoop,
              }));
              setSelectedFormula({
                ...hybridBase,
                theme: hybridTheme.theme,
                coreLoop: hybridCoreLoop,
                description: `${hybridTheme.theme} ${hybridBase.template} hybrid`
              });
              setStep(4);
            }}
            disabled={idea.uniqueHook.length < 10}
            className="w-full py-3 bg-white text-black rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Validation
          </button>
        </div>
      </div>
    )
  }

  // HYBRID MODE - Step 4: Generate Plan (reuses formula mode step 3)
  if (mode === 'hybrid' && step === 4 && selectedFormula && !result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <button onClick={() => setStep(3)} className="text-gray-500 hover:text-white text-sm mb-2">
            ← Edit details
          </button>
          <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Step 4 of 4</div>
          <h1 className="text-3xl font-bold">Generate Your Game Plan</h1>
        </div>

        {/* Summary */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 space-y-4">
          <div>
            <div className="text-gray-500 text-sm">Game Name</div>
            <div className="font-bold text-lg">{idea.name || `${hybridTheme?.theme} ${hybridBase?.template}`}</div>
          </div>

          <div>
            <div className="text-gray-500 text-sm">Hybrid Formula</div>
            <div className="font-medium">{hybridBase?.template} mechanics + {hybridTheme?.theme} theme</div>
            <div className="text-gray-400 text-sm">{idea.coreLoop}</div>
          </div>

          <div>
            <div className="text-gray-500 text-sm">Your Unique Twist</div>
            <div className="text-gray-300">{idea.uniqueHook}</div>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <div className="text-gray-500 text-sm mb-2">This hybrid combines:</div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-purple-400">{hybridBase?.qualificationScore || '?'}</div>
                <div className="text-xs text-gray-500">Base Score</div>
              </div>
              <div className="text-gray-600">+</div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">{hybridTheme?.theme}</div>
                <div className="text-xs text-gray-500">Trending Theme</div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={qualifyIdea}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
        >
          {loading ? (
            <>
              <span className="animate-spin">⟳</span> AI Generating Your Plan...
            </>
          ) : (
            <>Generate Hybrid Game Plan</>
          )}
        </button>
      </div>
    )
  }

  // Formula Mode - Add Your Twist (Step 2)
  if (mode === 'formula' && step === 2 && selectedFormula && !result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <button onClick={() => setStep(1)} className="text-gray-500 hover:text-white text-sm mb-2">
            ← Change formula
          </button>
          <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Step 2 of 3</div>
          <h1 className="text-3xl font-bold">Add Your Unique Twist</h1>
          <p className="text-gray-400 mt-1">What makes YOUR version different?</p>
        </div>

        {/* Selected Formula Summary */}
        <div className="bg-green-900/20 border border-green-700/50 rounded-xl p-4">
          <div className="text-xs text-green-400 mb-1">BASE FORMULA</div>
          <div className="font-bold text-lg">{selectedFormula.theme} {selectedFormula.template}</div>
          <div className="text-gray-400 text-sm mt-1">{selectedFormula.coreLoop}</div>
        </div>

        {/* The Form */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Game Name</label>
            <input
              type="text"
              value={idea.name}
              onChange={(e) => setIdea(p => ({ ...p, name: e.target.value }))}
              placeholder={`My ${selectedFormula.theme} ${selectedFormula.template}`}
              className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Your Unique Twist <span className="text-red-400">*</span>
            </label>
            <textarea
              value={idea.uniqueHook}
              onChange={(e) => setIdea(p => ({ ...p, uniqueHook: e.target.value }))}
              placeholder="What makes your version different? Examples:
• Different theme combination (e.g., 'Anime + Cooking' instead of 'Anime + Fighting')
• Unique mechanic (e.g., 'co-op boss raids' instead of solo)
• Different target audience (e.g., 'casual players' instead of 'hardcore grinders')
• Visual style (e.g., 'pixel art' instead of 'realistic')"
              className="w-full h-32 bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-600 resize-none"
            />
          </div>

          {/* Built-in mechanics from formula */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Included Mechanics (from formula)</label>
            <div className="flex flex-wrap gap-2">
              {selectedFormula.mechanics.map((m, i) => (
                <span key={i} className="px-3 py-1 bg-green-900/30 text-green-400 rounded-lg text-sm">{m}</span>
              ))}
            </div>
          </div>

          {/* Suggested monetization */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Proven Monetization (you can modify later)</label>
            <div className="flex flex-wrap gap-2">
              {selectedFormula.monetization.map((m, i) => (
                <span key={i} className="px-3 py-1 bg-yellow-900/30 text-yellow-400 rounded-lg text-sm">{m}</span>
              ))}
            </div>
          </div>

          <button
            onClick={() => setStep(3)}
            disabled={idea.uniqueHook.length < 20}
            className="w-full py-3 bg-white text-black rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue to Validation
          </button>
        </div>
      </div>
    )
  }

  // Formula Mode - Final Review & Generate (Step 3)
  if (mode === 'formula' && step === 3 && selectedFormula && !result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <button onClick={() => setStep(2)} className="text-gray-500 hover:text-white text-sm mb-2">
            ← Edit twist
          </button>
          <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Step 3 of 3</div>
          <h1 className="text-3xl font-bold">Review & Generate Plan</h1>
        </div>

        {/* Summary */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 space-y-4">
          <div>
            <div className="text-gray-500 text-sm">Game Name</div>
            <div className="font-bold text-lg">{idea.name || `${selectedFormula.theme} ${selectedFormula.template}`}</div>
          </div>

          <div>
            <div className="text-gray-500 text-sm">Base Formula</div>
            <div className="font-medium">{selectedFormula.theme} {selectedFormula.template}</div>
            <div className="text-gray-400 text-sm">{selectedFormula.coreLoop}</div>
          </div>

          <div>
            <div className="text-gray-500 text-sm">Your Unique Twist</div>
            <div className="text-gray-300">{idea.uniqueHook}</div>
          </div>

          <div className="pt-4 border-t border-gray-800">
            <div className="text-gray-500 text-sm mb-2">This formula is validated by:</div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{selectedFormula.emergingCount}</div>
                <div className="text-xs text-gray-500">Emerging Stars</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">${(selectedFormula.avgRevenue / 1000).toFixed(0)}K</div>
                <div className="text-xs text-gray-500">Avg Revenue/mo</div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={qualifyIdea}
          disabled={loading}
          className="w-full py-4 bg-green-600 hover:bg-green-500 rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2 text-lg"
        >
          {loading ? (
            <>
              <span className="animate-spin">⟳</span> AI Generating Your Plan...
            </>
          ) : (
            <>Generate Complete Game Plan</>
          )}
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header - Scratch Mode */}
      {mode === 'scratch' && !result && (
        <div>
          <button onClick={() => setMode('choose')} className="text-gray-500 hover:text-white text-sm mb-2">
            ← Back to options
          </button>
          <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Idea Validation</div>
          <h1 className="text-3xl font-bold">Qualify Your Game Idea</h1>
          <p className="text-gray-400 mt-1">AI will analyze your concept and create a custom game plan</p>
        </div>
      )}

      {/* Progress - Scratch Mode (5 steps now) */}
      {mode === 'scratch' && !result && (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? 'bg-white' : 'bg-gray-800'}`} />
          ))}
        </div>
      )}

      {/* Step 1: Template */}
      {mode === 'scratch' && step === 1 && !result && (
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-2">What type of game?</h2>
          <p className="text-gray-500 text-sm mb-6">Pick the closest match to your idea</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GAME_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setIdea(p => ({ ...p, template: t.id }))}
                className={`p-4 rounded-xl text-left transition-all ${
                  idea.template === t.id
                    ? 'bg-white text-black'
                    : 'bg-[#1a1a1a] hover:bg-[#222] border border-gray-800'
                }`}
              >
                <div className="font-semibold">{t.label}</div>
                <div className={`text-xs mt-1 ${idea.template === t.id ? 'text-gray-600' : 'text-gray-500'}`}>{t.desc}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!idea.template}
            className="mt-6 w-full py-3 bg-white text-black rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Continue
          </button>
        </div>
      )}

      {/* Step 2: Theme */}
      {mode === 'scratch' && step === 2 && !result && (
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-2">What&apos;s the theme?</h2>
          <p className="text-gray-500 text-sm mb-6">The setting or aesthetic of your game</p>

          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setIdea(p => ({ ...p, theme: t }))}
                className={`px-4 py-2 rounded-lg transition-all ${
                  idea.theme === t
                    ? 'bg-white text-black'
                    : 'bg-[#1a1a1a] hover:bg-[#222]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {idea.theme === 'Other' && (
            <input
              type="text"
              placeholder="Enter your theme..."
              onChange={(e) => setIdea(p => ({ ...p, theme: e.target.value }))}
              className="mt-4 w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-600"
            />
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="px-6 py-3 bg-[#1a1a1a] rounded-xl">Back</button>
            <button
              onClick={() => setStep(3)}
              disabled={!idea.theme}
              className="flex-1 py-3 bg-white text-black rounded-xl font-semibold disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Core Loop - WITH AI HELP */}
      {mode === 'scratch' && step === 3 && !result && (
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-2">Describe your game</h2>
          <p className="text-gray-500 text-sm mb-6">Don&apos;t worry about being perfect - AI will help you refine it</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Game Name (optional)</label>
              <input
                type="text"
                value={idea.name}
                onChange={(e) => setIdea(p => ({ ...p, name: e.target.value }))}
                placeholder="Working title for your game"
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Core Gameplay Loop</label>
              <textarea
                value={idea.coreLoop}
                onChange={(e) => { setIdea(p => ({ ...p, coreLoop: e.target.value })); setLoopSuggestion(null) }}
                placeholder="What do players DO in your game? Example: 'Players click to collect coins, use coins to buy pets that auto-collect for them, then rebirth to get permanent multipliers...'"
                className="w-full h-28 bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-600 resize-none"
              />

              {/* AI Help Button */}
              {idea.coreLoop.length >= 10 && !loopSuggestion && (
                <button
                  onClick={helpWithLoop}
                  disabled={helpingLoop}
                  className="mt-2 text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
                >
                  {helpingLoop ? (
                    <>
                      <span className="animate-spin">⟳</span> AI is thinking...
                    </>
                  ) : (
                    <>✨ Help me explain this better</>
                  )}
                </button>
              )}

              {/* AI Suggestion */}
              {loopSuggestion && (
                <div className="mt-3 p-4 bg-blue-950/30 border border-blue-900/50 rounded-lg">
                  <div className="text-xs text-blue-400 font-semibold mb-2">AI SUGGESTION</div>
                  <div className="text-sm text-gray-300 whitespace-pre-wrap">{loopSuggestion}</div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">What makes it unique? (optional)</label>
              <input
                type="text"
                value={idea.uniqueHook}
                onChange={(e) => setIdea(p => ({ ...p, uniqueHook: e.target.value }))}
                placeholder="Your twist that makes it different from competitors"
                className="w-full bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-600"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(2)} className="px-6 py-3 bg-[#1a1a1a] rounded-xl">Back</button>
            <button
              onClick={() => { setStep(4); researchMarket(); }}
              disabled={idea.coreLoop.length < 20}
              className="flex-1 py-3 bg-white text-black rounded-xl font-semibold disabled:opacity-50"
            >
              Research Market
            </button>
          </div>
        </div>
      )}

      {/* Step 4: MARKET RESEARCH - What's working, what's missing */}
      {mode === 'scratch' && step === 4 && !result && (
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-2">Market Research</h2>
          <p className="text-gray-500 text-sm mb-6">Real data from emerging games in your space</p>

          {researchingMarket ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-gray-700 border-t-green-500"></div>
              <p className="text-gray-500 mt-4">Researching emerging games...</p>
              <p className="text-gray-600 text-sm mt-1">Finding competitors for &quot;{idea.theme} {idea.template}&quot;</p>
            </div>
          ) : marketResearch ? (
            <div className="space-y-6">
              {/* Competitors Found */}
              {marketResearch.competitors.length > 0 && (
                <div>
                  <div className="text-sm text-gray-400 mb-3">EMERGING COMPETITORS ({marketResearch.competitors.length} found)</div>
                  <div className="flex flex-wrap gap-2">
                    {marketResearch.competitors.map((game: any, i: number) => (
                      <div key={i} className="px-3 py-2 bg-[#1a1a1a] rounded-lg text-sm">
                        <span className="text-white">{game.name}</span>
                        <span className="text-green-400 ml-2">{game.metrics?.currentPlayers || 0} CCU</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What's Working */}
              <div>
                <div className="text-sm text-green-400 mb-3">WHAT&apos;S WORKING</div>
                <div className="space-y-2">
                  {marketResearch.whatsWorking.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-green-400">✓</span>
                      <span className="text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gaps / 20% Better Opportunities */}
              <div>
                <div className="text-sm text-yellow-400 mb-3">DIFFERENTIATION OPPORTUNITIES (20% Better)</div>
                <div className="space-y-2">
                  {marketResearch.gaps.map((gap, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="text-yellow-400">→</span>
                      <span className="text-gray-300">{gap}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Suggested Patterns */}
              <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-800">
                <div>
                  <div className="text-xs text-blue-400 mb-2">PROVEN RETENTION</div>
                  <div className="space-y-1">
                    {marketResearch.suggestedPatterns.retention.map((p, i) => (
                      <div key={i} className="text-sm text-gray-400">• {p}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-yellow-400 mb-2">PROVEN MONETIZATION</div>
                  <div className="space-y-1">
                    {marketResearch.suggestedPatterns.monetization.map((p, i) => (
                      <div key={i} className="text-sm text-gray-400">• {p}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-purple-400 mb-2">VIRAL MECHANICS</div>
                  <div className="space-y-1">
                    {marketResearch.suggestedPatterns.viral.map((p, i) => (
                      <div key={i} className="text-sm text-gray-400">• {p}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Refine unique hook based on gaps */}
              <div className="pt-4 border-t border-gray-800">
                <label className="block text-sm text-gray-400 mb-2">
                  Refine Your Unique Twist (based on gaps above)
                </label>
                <textarea
                  value={idea.uniqueHook}
                  onChange={(e) => setIdea(p => ({ ...p, uniqueHook: e.target.value }))}
                  placeholder="How will you be 20% better? Pick from the opportunities above or add your own..."
                  className="w-full h-24 bg-[#1a1a1a] border border-gray-800 rounded-lg px-4 py-3 focus:outline-none focus:border-gray-600 resize-none"
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No research data yet</p>
              <button onClick={researchMarket} className="mt-3 px-4 py-2 bg-green-600 rounded-lg text-white text-sm">
                Research Now
              </button>
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(3)} className="px-6 py-3 bg-[#1a1a1a] rounded-xl">Back</button>
            <button
              onClick={() => setStep(5)}
              disabled={!marketResearch}
              className="flex-1 py-3 bg-white text-black rounded-xl font-semibold disabled:opacity-50"
            >
              Continue to Monetization
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Monetization + Submit */}
      {mode === 'scratch' && step === 5 && !result && (
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-2">Monetization (optional)</h2>
          <p className="text-gray-500 text-sm mb-6">How do you plan to make money? Select all that apply</p>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {MONETIZATION.map((m) => (
              <button
                key={m.id}
                onClick={() => setIdea(p => ({
                  ...p,
                  monetization: p.monetization.includes(m.id)
                    ? p.monetization.filter(x => x !== m.id)
                    : [...p.monetization, m.id]
                }))}
                className={`p-3 rounded-lg text-left flex items-center gap-3 transition-all ${
                  idea.monetization.includes(m.id)
                    ? 'bg-white text-black'
                    : 'bg-[#1a1a1a] hover:bg-[#222]'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                  idea.monetization.includes(m.id) ? 'bg-black border-black text-white' : 'border-gray-600'
                }`}>
                  {idea.monetization.includes(m.id) && '✓'}
                </div>
                {m.label}
              </button>
            ))}
          </div>

          {error && (
            <div className="mt-4 p-4 bg-red-950/30 border border-red-900/50 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(4)} className="px-6 py-3 bg-[#1a1a1a] rounded-xl">Back</button>
            <button
              onClick={qualifyIdea}
              disabled={loading}
              className="flex-1 py-3 bg-white text-black rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⟳</span> AI Analyzing with Market Data...
                </>
              ) : (
                <>Generate Data-Backed Plan</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* RESULTS - AI Generated Game Plan */}
      {result && (
        <div className="space-y-6">
          {/* Score Header */}
          <div className={`p-6 rounded-xl ${
            result.verdict === 'PROMISING' ? 'bg-green-950/30 border border-green-900/50' :
            result.verdict === 'NEEDS_WORK' ? 'bg-yellow-950/30 border border-yellow-900/50' :
            'bg-red-950/30 border border-red-900/50'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold">{idea.name || `${idea.theme} ${idea.template}`}</h2>
                {mode === 'hybrid' && hybridBase && hybridTheme && (
                  <p className="text-gray-500 text-sm">Hybrid: {hybridBase.template} + {hybridTheme.theme} theme</p>
                )}
                {mode === 'formula' && selectedFormula && (
                  <p className="text-gray-500 text-sm">Based on: {selectedFormula.theme} {selectedFormula.template}</p>
                )}
                <p className={`text-lg mt-1 ${
                  result.verdict === 'PROMISING' ? 'text-green-400' :
                  result.verdict === 'NEEDS_WORK' ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {result.verdict.replace('_', ' ')}
                </p>
                <p className="text-gray-400 mt-2">{result.summary}</p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{result.score}</div>
                <div className="text-gray-500 text-sm">/100</div>
              </div>
            </div>
          </div>

          {/* Unique Advice Callout */}
          {result.uniqueAdvice && (
            <div className="p-4 bg-purple-950/30 border border-purple-900/50 rounded-xl">
              <div className="text-xs text-purple-400 font-semibold mb-1">AI INSIGHT</div>
              <p className="text-gray-200">{result.uniqueAdvice}</p>
            </div>
          )}

          {/* Game Plan Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            <PlanSection title="Core Mechanics" color="green" items={result.coreMechanics} />
            <PlanSection title="Monetization Plan" color="yellow" items={result.monetizationPlan} />
            <PlanSection title="Retention Hooks" color="blue" items={result.retentionHooks} />
            <PlanSection title="Viral Strategy" color="purple" items={result.viralStrategy} />
          </div>

          {/* Development Roadmap */}
          <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
            <h3 className="font-bold text-orange-400 mb-4">Development Roadmap</h3>
            <div className="space-y-2">
              {result.weekByWeekPlan.map((week, i) => (
                <div key={i} className="flex gap-3 p-3 bg-[#1a1a1a] rounded-lg">
                  <span className="text-orange-400 font-mono text-sm">{week.split(':')[0]}:</span>
                  <span className="text-gray-300">{week.split(':').slice(1).join(':')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Risks */}
          {result.risks.length > 0 && (
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
              <h3 className="font-bold text-red-400 mb-4">Risks to Watch</h3>
              <div className="grid md:grid-cols-2 gap-2">
                {result.risks.map((risk, i) => (
                  <div key={i} className="flex gap-2 p-3 bg-red-950/20 rounded-lg text-sm">
                    <span className="text-red-400">!</span>
                    <span className="text-gray-300">{risk}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Competitors */}
          {result.competitors.length > 0 && (
            <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
              <h3 className="font-bold mb-4">Study These Competitors</h3>
              <div className="flex flex-wrap gap-2">
                {result.competitors.map((comp, i) => (
                  <span key={i} className="px-3 py-1 bg-[#1a1a1a] rounded-lg text-sm">{comp}</span>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={reset} className="px-6 py-3 bg-[#1a1a1a] rounded-xl hover:bg-[#222]">
              Start Over
            </button>
            <button
              onClick={() => { setResult(null); setStep(mode === 'hybrid' ? 3 : mode === 'formula' ? 2 : 4); }}
              className="flex-1 py-3 bg-white text-black rounded-xl font-semibold"
            >
              Refine & Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function PlanSection({ title, color, items }: { title: string; color: string; items: string[] }) {
  const colors: Record<string, string> = {
    green: 'text-green-400 bg-green-500/10',
    yellow: 'text-yellow-400 bg-yellow-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
  }

  return (
    <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-5">
      <h3 className={`font-bold mb-3 ${colors[color].split(' ')[0]}`}>{title}</h3>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className={`px-3 py-2 rounded-lg text-sm ${colors[color]}`}>
            {item}
          </div>
        ))}
      </div>
    </div>
  )
}

// Helper functions for formula generation
function getCoreLoop(template: string): string {
  const loops: Record<string, string> = {
    'Simulator': 'Collect → Upgrade → Prestige → Repeat with multipliers',
    'Tower Defense': 'Place units → Upgrade → Defend waves → Unlock new units',
    'Action RPG': 'Fight → Loot → Level up → Fight stronger enemies',
    'Tycoon': 'Build → Earn → Expand → Automate',
    'Obby': 'Navigate → Checkpoint → Progress → Unlock',
    'Horror/Escape': 'Survive → Solve → Escape → Win',
  }
  return loops[template] || 'Core gameplay loop'
}

function getDescription(template: string, theme: string): string {
  return `${theme}-themed ${template.toLowerCase()} with proven market demand`
}

function getMechanics(template: string): string[] {
  const mechanics: Record<string, string[]> = {
    'Simulator': ['Click/tap collection', 'Upgrade tree', 'Prestige system', 'Pet companions', 'Auto-collectors'],
    'Tower Defense': ['Unit placement', 'Wave defense', 'Unit upgrades', 'Boss fights', 'Co-op mode'],
    'Action RPG': ['Combat system', 'Loot drops', 'Level progression', 'Boss raids', 'Equipment'],
    'Tycoon': ['Building placement', 'Income generation', 'Expansion system', 'Automation'],
    'Obby': ['Obstacle navigation', 'Checkpoints', 'Stage progression', 'Time trials'],
    'Horror/Escape': ['Survival mechanics', 'Puzzle solving', 'Chase sequences', 'Multiplayer'],
  }
  return mechanics[template] || ['Core mechanics']
}

function getMonetization(template: string): string[] {
  const monetization: Record<string, string[]> = {
    'Simulator': ['2x/3x Multipliers', 'Auto-collect', 'VIP Benefits', 'Currency packs'],
    'Tower Defense': ['Unit crates/gacha', 'Extra slots', 'Premium units', 'Battle pass'],
    'Action RPG': ['Gacha weapons', 'Battle pass', 'Premium gear', 'XP boosters'],
    'Tycoon': ['Auto-rebirth', 'Expansion packs', 'Premium buildings', 'VIP'],
    'Obby': ['Skip stages', 'Cosmetics', 'Trail effects', 'Premium areas'],
    'Horror/Escape': ['Character skins', 'Emotes', 'Premium roles', 'Private servers'],
  }
  return monetization[template] || ['Gamepasses', 'Dev products']
}

function getRetention(template: string): string[] {
  const retention: Record<string, string[]> = {
    'Simulator': ['Daily rewards', 'Prestige goals', 'Collection completion', 'Events'],
    'Tower Defense': ['Unit collection', 'Challenge modes', 'Leaderboards', 'Updates'],
    'Action RPG': ['Daily quests', 'Raid resets', 'PvP seasons', 'New content'],
    'Tycoon': ['Milestones', 'Competitions', 'Seasonal themes', 'Achievements'],
    'Obby': ['New stages', 'Speedrun boards', 'Daily challenges', 'Cosmetic unlocks'],
    'Horror/Escape': ['New maps', 'Seasonal events', 'Role variety', 'Friend invites'],
  }
  return retention[template] || ['Daily rewards', 'Updates']
}
