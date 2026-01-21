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
  const [mode, setMode] = useState<'choose' | 'scratch' | 'formula'>('choose')
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

  // Load hot formulas from auto-cluster
  const loadHotFormulas = async () => {
    setLoadingFormulas(true)
    try {
      const res = await fetch('/api/auto-cluster?maxMonths=6&minCcu=100')
      const data = await res.json()

      if (data.hotNiches && data.hotNiches.length > 0) {
        // Convert clusters to formulas
        const formulas: ProvenFormula[] = data.hotNiches.map((cluster: any) => ({
          template: cluster.template,
          theme: cluster.theme,
          coreLoop: getCoreLoop(cluster.template),
          description: getDescription(cluster.template, cluster.theme),
          avgRevenue: cluster.avgRevenue,
          emergingCount: cluster.qualifiedCount,
          mechanics: getMechanics(cluster.template),
          monetization: getMonetization(cluster.template),
          retention: getRetention(cluster.template),
          exampleGames: cluster.emergingStars.slice(0, 3).map((s: any) => s.name)
        }))
        setHotFormulas(formulas)
      }
    } catch (err) {
      console.error('Failed to load formulas:', err)
    } finally {
      setLoadingFormulas(false)
    }
  }

  // When entering formula mode, load hot formulas
  useEffect(() => {
    if (mode === 'formula' && hotFormulas.length === 0) {
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
            baseFormula: selectedFormula ? `${selectedFormula.theme} ${selectedFormula.template}` : null
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
    setIdea({ name: '', template: '', theme: '', coreLoop: '', monetization: [], uniqueHook: '' })
    setLoopSuggestion(null)
    setError(null)
  }

  // Mode Selection
  if (mode === 'choose' && !result) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Idea Lab</div>
          <h1 className="text-3xl font-bold">Create Your Game Concept</h1>
          <p className="text-gray-400 mt-1">Choose how you want to start</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Start from Proven Formula */}
          <button
            onClick={() => setMode('formula')}
            className="bg-gradient-to-br from-green-900/30 to-green-800/10 border border-green-700/50 rounded-xl p-6 text-left hover:border-green-600 transition-colors"
          >
            <div className="text-2xl mb-2">🔥</div>
            <h3 className="text-xl font-bold">Start from Proven Formula</h3>
            <p className="text-gray-400 mt-2 text-sm">
              Pick a validated niche with 2+ recent successes, then add your unique twist
            </p>
            <div className="mt-4 text-green-400 text-sm font-medium">
              Recommended for beginners →
            </div>
          </button>

          {/* Start from Scratch */}
          <button
            onClick={() => setMode('scratch')}
            className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6 text-left hover:border-gray-700 transition-colors"
          >
            <div className="text-2xl mb-2">✨</div>
            <h3 className="text-xl font-bold">Start from Scratch</h3>
            <p className="text-gray-400 mt-2 text-sm">
              Have your own idea? Describe it and get AI-powered validation and planning
            </p>
            <div className="mt-4 text-gray-500 text-sm font-medium">
              For experienced creators →
            </div>
          </button>
        </div>

        {/* Quick Links */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
          <h3 className="font-bold mb-3">Need Inspiration?</h3>
          <div className="flex flex-wrap gap-3">
            <Link href="/niches" className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium">
              Browse Hot Niches
            </Link>
            <Link href="/emerging" className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] rounded-lg text-sm">
              See Emerging Games
            </Link>
            <Link href="/patterns" className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] rounded-lg text-sm">
              Study Proven Patterns
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
            <p>No hot formulas found at the moment.</p>
            <p className="text-sm mt-2">Try the manual approach or check back later.</p>
            <button
              onClick={() => setMode('scratch')}
              className="mt-4 px-6 py-3 bg-white text-black rounded-xl font-semibold"
            >
              Start from Scratch Instead
            </button>
          </div>
        )}
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

      {/* Progress - Scratch Mode */}
      {mode === 'scratch' && !result && (
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((s) => (
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
              onClick={() => setStep(4)}
              disabled={idea.coreLoop.length < 20}
              className="flex-1 py-3 bg-white text-black rounded-xl font-semibold disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Monetization + Submit */}
      {mode === 'scratch' && step === 4 && !result && (
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
            <button onClick={() => setStep(3)} className="px-6 py-3 bg-[#1a1a1a] rounded-xl">Back</button>
            <button
              onClick={qualifyIdea}
              disabled={loading}
              className="flex-1 py-3 bg-white text-black rounded-xl font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⟳</span> AI Analyzing...
                </>
              ) : (
                <>Generate Game Plan</>
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
                {selectedFormula && (
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
              onClick={() => { setResult(null); setStep(mode === 'formula' ? 2 : 3); }}
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
