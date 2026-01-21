'use client'

import { useState } from 'react'

interface QualificationResult {
  qualified: boolean
  score: number
  checks: Array<{
    criterion: string
    passed: boolean
    feedback: string
  }>
  suggestions: string[]
  similarGames: Array<{
    name: string
    why: string
  }>
  nextSteps: string[]
}

const GAME_TEMPLATES = [
  { id: 'simulator', label: 'Simulator', example: 'Pet collecting with click mechanics' },
  { id: 'tycoon', label: 'Tycoon', example: 'Build and manage a business empire' },
  { id: 'tower-defense', label: 'Tower Defense', example: 'Place units to defend against waves' },
  { id: 'horror', label: 'Horror', example: 'Escape from monsters in scary environments' },
  { id: 'roleplay', label: 'Roleplay', example: 'Social life simulation with houses/jobs' },
  { id: 'obby', label: 'Obby', example: 'Obstacle course platforming' },
  { id: 'fighting', label: 'Fighting/Combat', example: 'PvP or PvE combat game' },
  { id: 'racing', label: 'Racing', example: 'Vehicle racing competition' },
]

const THEMES = [
  'Anime', 'Pets', 'Fantasy', 'Sci-Fi', 'Horror', 'Military',
  'Sports', 'Food', 'Nature', 'Superhero', 'Pirates', 'Zombies'
]

const MONETIZATION_OPTIONS = [
  { id: 'gamepass', label: 'Gamepasses (one-time purchases)' },
  { id: 'devproduct', label: 'Developer Products (consumables)' },
  { id: 'premium', label: 'Premium Payouts' },
  { id: 'trading', label: 'Trading System' },
  { id: 'battlepass', label: 'Battle Pass / Season Pass' },
  { id: 'gacha', label: 'Gacha / Loot Boxes' },
]

export default function IdeaPage() {
  const [step, setStep] = useState(1)
  const [idea, setIdea] = useState({
    name: '',
    template: '',
    theme: '',
    description: '',
    coreLoop: '',
    monetization: [] as string[],
    uniqueHook: '',
    targetAudience: '',
  })
  const [result, setResult] = useState<QualificationResult | null>(null)
  const [loading, setLoading] = useState(false)

  const handleTemplateSelect = (templateId: string) => {
    setIdea(prev => ({ ...prev, template: templateId }))
  }

  const handleThemeSelect = (theme: string) => {
    setIdea(prev => ({ ...prev, theme }))
  }

  const toggleMonetization = (optionId: string) => {
    setIdea(prev => ({
      ...prev,
      monetization: prev.monetization.includes(optionId)
        ? prev.monetization.filter(m => m !== optionId)
        : [...prev.monetization, optionId]
    }))
  }

  const qualifyIdea = async () => {
    setLoading(true)

    // Simulate API call - in production this would call an AI endpoint
    await new Promise(r => setTimeout(r, 1500))

    // Score the idea based on criteria
    const checks = [
      {
        criterion: 'Clear Template Match',
        passed: !!idea.template,
        feedback: idea.template
          ? `"${GAME_TEMPLATES.find(t => t.id === idea.template)?.label}" is a proven format with existing successful games`
          : 'Select a game template to match against proven formats'
      },
      {
        criterion: 'Theme Viability',
        passed: !!idea.theme && ['Anime', 'Pets', 'Horror', 'Fantasy'].includes(idea.theme),
        feedback: ['Anime', 'Pets', 'Horror', 'Fantasy'].includes(idea.theme)
          ? `"${idea.theme}" themes have high engagement on Roblox`
          : idea.theme
            ? `"${idea.theme}" is less common - could be opportunity or risk`
            : 'Select a theme for your game'
      },
      {
        criterion: 'Monetization Strategy',
        passed: idea.monetization.length >= 2,
        feedback: idea.monetization.length >= 2
          ? 'Multiple revenue streams increase earning potential'
          : 'Add at least 2 monetization methods for sustainable revenue'
      },
      {
        criterion: 'Core Loop Defined',
        passed: idea.coreLoop.length > 20,
        feedback: idea.coreLoop.length > 20
          ? 'Clear gameplay loop helps with retention design'
          : 'Describe your core gameplay loop in more detail'
      },
      {
        criterion: 'Unique Hook',
        passed: idea.uniqueHook.length > 10,
        feedback: idea.uniqueHook.length > 10
          ? 'Having a differentiator helps stand out in the market'
          : 'What makes your game different from competitors?'
      },
      {
        criterion: 'Market Fit',
        passed: idea.template && idea.theme ? true : false,
        feedback: idea.template && idea.theme
          ? `${idea.theme} + ${GAME_TEMPLATES.find(t => t.id === idea.template)?.label} has market precedent`
          : 'Complete template and theme to assess market fit'
      }
    ]

    const passedCount = checks.filter(c => c.passed).length
    const score = Math.round((passedCount / checks.length) * 100)

    // Generate similar games based on template + theme
    const similarGames = []
    if (idea.template === 'tower-defense' && idea.theme === 'Anime') {
      similarGames.push(
        { name: 'Anime Adventures', why: 'Same template + theme combination' },
        { name: 'All Star Tower Defense', why: 'Anime TD with gacha mechanics' },
        { name: 'Anime Defenders', why: 'Recent success in this niche' }
      )
    } else if (idea.template === 'simulator' && idea.theme === 'Pets') {
      similarGames.push(
        { name: 'Pet Simulator 99', why: 'Market leader in pet simulators' },
        { name: 'Pet Simulator X', why: 'Established pet collection game' }
      )
    } else if (idea.template === 'horror') {
      similarGames.push(
        { name: 'Doors', why: 'Top horror game format' },
        { name: 'The Mimic', why: 'Story-driven horror' },
        { name: 'Apeirophobia', why: 'Backrooms-style horror' }
      )
    }

    // Generate suggestions
    const suggestions = []
    if (!idea.monetization.includes('gamepass')) {
      suggestions.push('Consider adding gamepasses for permanent upgrades (2x luck, auto-collect, etc.)')
    }
    if (!idea.monetization.includes('battlepass')) {
      suggestions.push('Battle passes provide recurring revenue and keep players engaged')
    }
    if (idea.template === 'simulator' && !idea.coreLoop.toLowerCase().includes('rebirth')) {
      suggestions.push('Add a rebirth/prestige system for long-term progression')
    }
    if (idea.template === 'tower-defense' && !idea.monetization.includes('gacha')) {
      suggestions.push('Gacha/summon mechanics are essential for TD games - adds collection incentive')
    }
    if (!idea.uniqueHook) {
      suggestions.push('Define what makes your game special - a unique mechanic, art style, or twist')
    }

    // Next steps
    const nextSteps = [
      'Research top 5 competitors using the Discover page',
      'Analyze their monetization and retention strategies',
      'Prototype core gameplay loop first',
      'Test with small group before full development',
      'Plan content update schedule (new content every 2-4 weeks)'
    ]

    setResult({
      qualified: score >= 70,
      score,
      checks,
      suggestions,
      similarGames,
      nextSteps
    })

    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Qualify Your Game Idea</h1>
        <p className="text-gray-400 mt-1">
          Validate your concept against the Nicole Search criteria before building
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`flex-1 h-2 rounded-full ${
              s <= step ? 'bg-red-600' : 'bg-gray-800'
            }`}
          />
        ))}
      </div>

      {/* Step 1: Template Selection */}
      {step === 1 && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Step 1: Choose a Game Template</h2>
          <p className="text-gray-400 mb-6">What type of game are you building?</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GAME_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`p-4 rounded-lg text-left transition-all ${
                  idea.template === template.id
                    ? 'bg-red-600 border-2 border-red-400'
                    : 'bg-[#111] border border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="font-bold">{template.label}</div>
                <div className="text-xs text-gray-400 mt-1">{template.example}</div>
              </button>
            ))}
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!idea.template}
            className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Next: Choose Theme
          </button>
        </div>
      )}

      {/* Step 2: Theme Selection */}
      {step === 2 && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Step 2: Pick a Theme</h2>
          <p className="text-gray-400 mb-6">What setting or aesthetic will your game have?</p>

          <div className="flex flex-wrap gap-2">
            {THEMES.map((theme) => (
              <button
                key={theme}
                onClick={() => handleThemeSelect(theme)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  idea.theme === theme
                    ? 'bg-red-600 text-white'
                    : 'bg-[#111] border border-gray-700 hover:border-gray-500'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>

          <div className="mt-4">
            <label className="block text-sm text-gray-400 mb-2">Or enter custom theme:</label>
            <input
              type="text"
              value={THEMES.includes(idea.theme) ? '' : idea.theme}
              onChange={(e) => setIdea(prev => ({ ...prev, theme: e.target.value }))}
              placeholder="e.g., Dinosaurs, Space, Medieval..."
              className="w-full bg-[#111] border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!idea.theme}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Next: Details
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Game Details */}
      {step === 3 && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Step 3: Define Your Game</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Game Name (working title)</label>
              <input
                type="text"
                value={idea.name}
                onChange={(e) => setIdea(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Anime Tower Legends"
                className="w-full bg-[#111] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">Core Gameplay Loop</label>
              <textarea
                value={idea.coreLoop}
                onChange={(e) => setIdea(prev => ({ ...prev, coreLoop: e.target.value }))}
                placeholder="Describe what players do repeatedly: e.g., 'Players summon anime characters, place them on the map, upgrade them with duplicates, and defend against enemy waves. After each round, they earn currency to summon more characters.'"
                className="w-full h-24 bg-[#111] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">What makes your game unique?</label>
              <input
                type="text"
                value={idea.uniqueHook}
                onChange={(e) => setIdea(prev => ({ ...prev, uniqueHook: e.target.value }))}
                placeholder="e.g., 'First TD with real-time PvP tower battles'"
                className="w-full bg-[#111] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(2)}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={() => setStep(4)}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
            >
              Next: Monetization
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Monetization */}
      {step === 4 && !result && (
        <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Step 4: Monetization Strategy</h2>
          <p className="text-gray-400 mb-6">How will your game make money? (Select all that apply)</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MONETIZATION_OPTIONS.map((option) => (
              <button
                key={option.id}
                onClick={() => toggleMonetization(option.id)}
                className={`p-4 rounded-lg text-left transition-all flex items-center gap-3 ${
                  idea.monetization.includes(option.id)
                    ? 'bg-red-600/20 border-2 border-red-600'
                    : 'bg-[#111] border border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  idea.monetization.includes(option.id)
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-500'
                }`}>
                  {idea.monetization.includes(option.id) && (
                    <span className="text-white text-xs">✓</span>
                  )}
                </div>
                {option.label}
              </button>
            ))}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setStep(3)}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Back
            </button>
            <button
              onClick={qualifyIdea}
              disabled={loading}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              {loading ? 'Analyzing...' : 'Qualify My Idea'}
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-6">
          {/* Score Card */}
          <div className={`p-6 rounded-xl border ${
            result.qualified
              ? 'bg-green-900/20 border-green-800'
              : 'bg-yellow-900/20 border-yellow-800'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{idea.name || 'Your Game Idea'}</h2>
                <p className="text-gray-400">{idea.theme} {GAME_TEMPLATES.find(t => t.id === idea.template)?.label}</p>
                <p className={`text-lg mt-2 ${result.qualified ? 'text-green-400' : 'text-yellow-400'}`}>
                  {result.qualified ? '✓ LOOKS PROMISING' : '⚠ NEEDS WORK'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{result.score}</div>
                <div className="text-gray-400 text-sm">/ 100</div>
              </div>
            </div>
          </div>

          {/* Qualification Checks */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Qualification Checks</h3>
            <div className="space-y-3">
              {result.checks.map((check, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-[#111] rounded-lg">
                  <span className={`text-xl ${check.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {check.passed ? '✓' : '✗'}
                  </span>
                  <div>
                    <span className="font-medium">{check.criterion}</span>
                    <p className="text-gray-400 text-sm mt-1">{check.feedback}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Similar Games */}
          {result.similarGames.length > 0 && (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Similar Successful Games</h3>
              <div className="space-y-2">
                {result.similarGames.map((game, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-[#111] rounded-lg">
                    <span className="font-medium">{game.name}</span>
                    <span className="text-gray-400 text-sm">{game.why}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-sm mt-3">
                Use the Discover page to analyze these competitors in detail
              </p>
            </div>
          )}

          {/* Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Suggestions to Improve</h3>
              <ul className="space-y-2">
                {result.suggestions.map((suggestion, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300">
                    <span className="text-yellow-500">→</span>
                    {suggestion}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Recommended Next Steps</h3>
            <ol className="space-y-2">
              {result.nextSteps.map((step, i) => (
                <li key={i} className="flex items-start gap-3 text-gray-300">
                  <span className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm flex-shrink-0">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setResult(null)
                setStep(1)
                setIdea({
                  name: '',
                  template: '',
                  theme: '',
                  description: '',
                  coreLoop: '',
                  monetization: [],
                  uniqueHook: '',
                  targetAudience: '',
                })
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Start Over
            </button>
            <button
              onClick={() => {
                setResult(null)
                setStep(4)
              }}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-medium transition-colors"
            >
              Refine & Re-qualify
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
