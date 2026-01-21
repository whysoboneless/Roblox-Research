'use client'

import { useState } from 'react'

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
  'Sports', 'Food', 'Nature', 'Superhero', 'Pirates', 'Zombies', 'Other'
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
          data: idea
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
    setIdea({ name: '', template: '', theme: '', coreLoop: '', monetization: [], uniqueHook: '' })
    setLoopSuggestion(null)
    setError(null)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Qualify Your Game Idea</h1>
        <p className="text-gray-400 mt-1">AI will analyze your concept and create a custom game plan</p>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-1.5 rounded-full ${s <= step ? 'bg-white' : 'bg-gray-800'}`} />
        ))}
      </div>

      {/* Step 1: Template */}
      {step === 1 && !result && (
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
      {step === 2 && !result && (
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-2">What's the theme?</h2>
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
      {step === 3 && !result && (
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-2">Describe your game</h2>
          <p className="text-gray-500 text-sm mb-6">Don't worry about being perfect - AI will help you refine it</p>

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
      {step === 4 && !result && (
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
            {/* Core Mechanics */}
            <PlanSection title="Core Mechanics" color="green" items={result.coreMechanics} />

            {/* Monetization */}
            <PlanSection title="Monetization Plan" color="yellow" items={result.monetizationPlan} />

            {/* Retention */}
            <PlanSection title="Retention Hooks" color="blue" items={result.retentionHooks} />

            {/* Viral */}
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
              onClick={() => { setResult(null); setStep(3); }}
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
