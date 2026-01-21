'use client'

import { useState } from 'react'

// Pattern database - same structure as patterns page
const PATTERNS: Record<string, {
  name: string
  template: string
  mechanic: string
  examples: string[]
  complexity: string
  retention: string[]
  monetization: string[]
  viral: string[]
  coreRequirements: string[]
  pitfalls: string[]
  contentRoadmap: string[]
}> = {
  'tower-defense-anime': {
    name: 'Anime Tower Defense',
    template: 'Anime + Tower Defense',
    mechanic: 'Place anime characters as towers → Upgrade → Unlock new characters',
    examples: ['Anime Adventures', 'All Star Tower Defense', 'Anime Defenders'],
    complexity: 'High',
    retention: ['Gacha/summon system', 'Character collection', 'Meta progression', 'Co-op multiplayer', 'Daily login rewards'],
    monetization: ['Premium currency for summons', 'Battle passes', 'Limited time banners', 'Gems for stamina', 'VIP servers'],
    viral: ['Trading communities', 'Tier list discussions', 'Update hype cycles', 'YouTuber summon videos', 'Discord servers'],
    coreRequirements: [
      'Character collection system (50+ units)',
      'Gacha/summon mechanic with rates',
      'Tower placement + wave defense',
      'Upgrade/evolution system',
      'Multiplayer co-op'
    ],
    pitfalls: ['Poor gacha rates frustrate players', 'Unbalanced units kill meta diversity', 'Slow content updates cause churn', 'Performance issues from too many units'],
    contentRoadmap: ['Week 1-2: Core TD mechanics + 10 starter units', 'Week 3-4: Gacha system + 20 more units', 'Week 5-6: Multiplayer co-op', 'Week 7-8: First limited banner event', 'Monthly: New units, balance patches, events']
  },
  'tower-defense': {
    name: 'Tower Defense',
    template: 'Classic Tower Defense',
    mechanic: 'Place towers → Upgrade → Defend against waves',
    examples: ['Tower Defense Simulator', 'Toilet Tower Defense'],
    complexity: 'Medium',
    retention: ['Tower unlocks', 'Map progression', 'Challenge modes', 'Leaderboards'],
    monetization: ['Premium towers', 'Skins', 'Boosts', 'VIP servers'],
    viral: ['Speedrun community', 'Strategy guides', 'Multiplayer clips'],
    coreRequirements: ['Tower placement system', 'Wave spawning', 'Upgrade paths', 'Multiple maps'],
    pitfalls: ['Boring early game', 'OP meta towers', 'Lack of variety'],
    contentRoadmap: ['Week 1-2: Core mechanics + 5 towers', 'Week 3-4: More maps and towers', 'Week 5-6: Challenge modes', 'Monthly: New towers and events']
  },
  'simulator-pets': {
    name: 'Pet Simulator',
    template: 'X Simulator + Pet Collection',
    mechanic: 'Click/tap to collect → Pets multiply earnings → Rebirth for permanent bonuses',
    examples: ['Pet Simulator 99', 'Pet Simulator X', 'Muscle Legends'],
    complexity: 'Medium',
    retention: ['Pet collection/fusion', 'Rebirth system', 'Eggs/hatching', 'Limited events', 'Trading'],
    monetization: ['Gamepasses (auto-click, luck boost)', 'Premium eggs', 'VIP areas', 'Event passes'],
    viral: ['Trading economy', 'Rare pet flexing', 'Youtuber giveaways', 'Egg opening videos'],
    coreRequirements: ['Click-to-earn base mechanic', 'Pet system with rarities', 'Egg hatching animation', 'Fusion/upgrade system', 'Rebirth for multipliers'],
    pitfalls: ['Economy inflation (numbers grow too fast)', 'Trading exploits crash value', 'Boring late-game grind', 'Over-reliance on gamepasses'],
    contentRoadmap: ['Week 1-2: Core clicking + first pets', 'Week 3-4: Egg system + more areas', 'Week 5-6: Rebirth system', 'Week 7-8: Trading + events', 'Bi-weekly: New eggs and limited pets']
  },
  'simulator': {
    name: 'Incremental Simulator',
    template: 'Simulator + Incremental',
    mechanic: 'Do action → Get stronger → Rebirth → Repeat',
    examples: ['Strongman Simulator', 'Mining Simulator 2'],
    complexity: 'Low-Medium',
    retention: ['Rebirth system', 'Automation unlocks', 'Leaderboards', 'Daily rewards'],
    monetization: ['x2 earnings passes', 'Auto-collect', 'Premium areas', 'Exclusive tools'],
    viral: ['Big number flexing', 'Speedrun prestige', 'Leaderboard competition'],
    coreRequirements: ['Clear progression path', 'Visual feedback (numbers flying)', 'Prestige with meaningful bonuses', 'Automation as reward', 'Leaderboard system'],
    pitfalls: ['Wall hits too early', 'Prestige feels unrewarding', 'No visual variety', 'P2W perception'],
    contentRoadmap: ['Week 1-2: Core loop + first area', 'Week 3-4: Rebirth system', 'Week 5-6: More areas + automation', 'Weekly: Balance patches and new content']
  },
  'horror': {
    name: 'Horror Multiplayer',
    template: 'Horror + Multiplayer',
    mechanic: 'Survive/escape from monsters → Round-based → Unlock new levels',
    examples: ['Doors', 'Apeirophobia', 'Pressure', 'The Mimic'],
    complexity: 'Medium-High',
    retention: ['Procedural elements', 'Lore/story discovery', 'Unlockable items', 'Challenge modes', 'Multiplayer'],
    monetization: ['Cosmetics', 'Revives/lives', 'Hint systems', 'Story DLC'],
    viral: ['Jump scare reactions', 'Lore theory videos', 'Speedrun community', 'Horror compilations'],
    coreRequirements: ['Atmospheric sound design', 'Hiding/escape mechanics', 'Monster AI or player-controlled threat', 'Checkpoint/progression system', 'Multiplayer lobby system'],
    pitfalls: ['Cheap scares lose novelty fast', 'Performance tanks with lighting', 'Toxic player behavior', 'Story too confusing'],
    contentRoadmap: ['Week 1-3: First chapter/level', 'Week 4-6: Second chapter', 'Week 7-8: Cosmetics + challenge mode', 'Monthly: New chapters and lore']
  },
  'tycoon': {
    name: 'Incremental Tycoon',
    template: 'Tycoon + Automation',
    mechanic: 'Build droppers → Collect → Upgrade → Automate → Prestige',
    examples: ['Arm Wrestle Simulator', 'My Restaurant', 'Retail Tycoon 2'],
    complexity: 'Low-Medium',
    retention: ['Prestige/rebirth system', 'Automation unlocks', 'Competitive leaderboards', 'Daily rewards'],
    monetization: ['x2 earnings passes', 'Auto-collect', 'Premium areas', 'Exclusive items'],
    viral: ['Big number flexing', 'Speedrun prestige', 'Tycoon building showcases'],
    coreRequirements: ['Clear progression path', 'Visual feedback', 'Prestige with meaningful bonuses', 'Automation as reward'],
    pitfalls: ['Wall hits too early', 'Prestige feels unrewarding', 'No visual variety'],
    contentRoadmap: ['Week 1-2: Core tycoon mechanics', 'Week 3-4: Prestige system', 'Week 5-6: Automation + new areas', 'Weekly: New items and balance']
  },
  'roleplay': {
    name: 'Roleplay Life Sim',
    template: 'Life Simulation + Social',
    mechanic: 'Pick role/house → Customize → Social interaction → Live virtual life',
    examples: ['Brookhaven RP', 'Bloxburg', 'Livetopia', 'Berry Avenue'],
    complexity: 'High',
    retention: ['House building', 'Vehicle collection', 'Friend systems', 'Seasonal updates', 'Jobs/roles'],
    monetization: ['Premium currency', 'House/vehicle packs', 'Clothing items', 'Special roles'],
    viral: ['Roleplay content', 'Building showcases', 'Drama/story content', 'TikTok clips'],
    coreRequirements: ['Detailed character customization', 'Housing system', 'Vehicle system', 'Role selection (jobs)', 'Social features'],
    pitfalls: ['Moderation nightmare', 'Content expectations too high', 'Performance with large maps', 'Monetization seen as greedy'],
    contentRoadmap: ['Week 1-4: Core map + houses + jobs', 'Week 5-8: Vehicles + customization', 'Week 9-12: Social features', 'Monthly: New items, houses, vehicles']
  },
  'fighting-anime': {
    name: 'Anime Fighting',
    template: 'Anime + Combat',
    mechanic: 'Train stats → Learn abilities → Fight players/NPCs → Get stronger',
    examples: ['Blox Fruits', 'King Legacy', 'Anime Fighting Simulator'],
    complexity: 'High',
    retention: ['Ability unlocks', 'Rare item hunting', 'PvP ranking', 'Boss fights', 'Quests'],
    monetization: ['Fruit/ability rerolls', 'XP boosts', 'Private servers', 'Premium abilities'],
    viral: ['PvP montages', 'Rare drop reveals', 'Update trailers', 'Trading'],
    coreRequirements: ['Combat system with combos', 'Multiple abilities/fighting styles', 'Leveling system', 'Open world exploration', 'Boss NPCs'],
    pitfalls: ['Balancing PvP is hard', 'Grinding feels boring', 'Hackers/exploiters', 'Too grindy for casuals'],
    contentRoadmap: ['Week 1-4: Core combat + first island', 'Week 5-8: More abilities + bosses', 'Week 9-12: PvP arena', 'Weekly: Balance patches, new abilities']
  },
  'fighting': {
    name: 'Combat Game',
    template: 'Fighting/Combat',
    mechanic: 'Learn moves → Fight → Rank up',
    examples: ['Arsenal', 'Murder Mystery 2'],
    complexity: 'Medium',
    retention: ['Weapon unlocks', 'Ranking system', 'Daily challenges', 'Cosmetics'],
    monetization: ['Weapon skins', 'Character skins', 'Battle passes', 'Crates'],
    viral: ['Montage clips', 'Pro player content', 'Tournament streams'],
    coreRequirements: ['Smooth combat mechanics', 'Matchmaking', 'Progression system', 'Variety of weapons/modes'],
    pitfalls: ['Bad netcode ruins experience', 'Skill gap too high', 'Cheaters'],
    contentRoadmap: ['Week 1-3: Core combat + modes', 'Week 4-6: Ranking system', 'Week 7-8: Cosmetics', 'Monthly: New maps and weapons']
  },
  'obby': {
    name: 'Obby',
    template: 'Obstacle Course',
    mechanic: 'Jump through obstacles → Reach checkpoints → Complete stages',
    examples: ['Tower of Hell', 'Escape Room'],
    complexity: 'Low',
    retention: ['Stage progression', 'Time challenges', 'Cosmetic unlocks', 'Leaderboards'],
    monetization: ['Skip stage', 'Cosmetics', 'VIP areas', 'Checkpoint saves'],
    viral: ['Speedrun clips', 'Fail compilations', 'Challenge videos'],
    coreRequirements: ['Smooth movement', 'Good checkpoint system', 'Variety of obstacles', 'Clear visual feedback'],
    pitfalls: ['Frustrating difficulty spikes', 'Repetitive obstacles', 'No sense of progression'],
    contentRoadmap: ['Week 1-2: First 50 stages', 'Week 3-4: Cosmetics + leaderboards', 'Weekly: New stages']
  },
  'racing': {
    name: 'Racing',
    template: 'Vehicle Racing',
    mechanic: 'Race against others → Earn currency → Upgrade/buy vehicles',
    examples: ['Jailbreak (has racing)', 'Driving Simulator'],
    complexity: 'Medium',
    retention: ['Vehicle collection', 'Track variety', 'Ranking system', 'Customization'],
    monetization: ['Premium vehicles', 'Vehicle skins', 'Speed boosts', 'VIP'],
    viral: ['Race clips', 'Car showcases', 'Time trial records'],
    coreRequirements: ['Good vehicle physics', 'Multiple tracks', 'Matchmaking', 'Vehicle progression'],
    pitfalls: ['Pay to win vehicles', 'Bad physics feel', 'Empty lobbies'],
    contentRoadmap: ['Week 1-3: Core racing + vehicles', 'Week 4-6: More tracks', 'Week 7-8: Customization', 'Monthly: New vehicles and tracks']
  }
}

interface GamePlan {
  qualified: boolean
  score: number
  pattern: typeof PATTERNS[string] | null
  checks: Array<{ criterion: string; passed: boolean; feedback: string }>
  gamePlan: {
    coreMechanics: string[]
    monetizationStrategy: string[]
    viralHooks: string[]
    retentionSystems: string[]
    contentRoadmap: string[]
    pitfallsToAvoid: string[]
  }
  similarGames: Array<{ name: string; why: string }>
}

const GAME_TEMPLATES = [
  { id: 'simulator', label: 'Simulator', example: 'Click and collect mechanics' },
  { id: 'tycoon', label: 'Tycoon', example: 'Build and manage empire' },
  { id: 'tower-defense', label: 'Tower Defense', example: 'Place units to defend' },
  { id: 'horror', label: 'Horror', example: 'Scary escape/survival' },
  { id: 'roleplay', label: 'Roleplay', example: 'Social life simulation' },
  { id: 'obby', label: 'Obby', example: 'Obstacle course' },
  { id: 'fighting', label: 'Fighting/Combat', example: 'PvP or PvE combat' },
  { id: 'racing', label: 'Racing', example: 'Vehicle competition' },
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
    coreLoop: '',
    monetization: [] as string[],
    uniqueHook: '',
  })
  const [result, setResult] = useState<GamePlan | null>(null)
  const [loading, setLoading] = useState(false)

  // Find the best matching pattern based on template + theme
  const findMatchingPattern = () => {
    const key1 = `${idea.template}-${idea.theme.toLowerCase()}`
    const key2 = idea.template

    // Try specific combo first (e.g., "tower-defense-anime")
    if (PATTERNS[key1]) return PATTERNS[key1]

    // Try template only
    if (PATTERNS[key2]) return PATTERNS[key2]

    // Special cases
    if (idea.template === 'simulator' && idea.theme === 'Pets') return PATTERNS['simulator-pets']
    if (idea.template === 'fighting' && idea.theme === 'Anime') return PATTERNS['fighting-anime']
    if (idea.template === 'tower-defense' && idea.theme === 'Anime') return PATTERNS['tower-defense-anime']

    // Default to basic template
    return PATTERNS[idea.template] || null
  }

  const qualifyIdea = async () => {
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))

    const pattern = findMatchingPattern()

    // Score the idea
    const checks = [
      {
        criterion: 'Clear Template Match',
        passed: !!idea.template,
        feedback: idea.template
          ? `"${GAME_TEMPLATES.find(t => t.id === idea.template)?.label}" is a proven format`
          : 'Select a game template'
      },
      {
        criterion: 'Theme Viability',
        passed: !!idea.theme && ['Anime', 'Pets', 'Horror', 'Fantasy'].includes(idea.theme),
        feedback: ['Anime', 'Pets', 'Horror', 'Fantasy'].includes(idea.theme)
          ? `"${idea.theme}" has high engagement on Roblox`
          : idea.theme ? `"${idea.theme}" is less common - could be opportunity` : 'Select a theme'
      },
      {
        criterion: 'Monetization Strategy',
        passed: idea.monetization.length >= 2,
        feedback: idea.monetization.length >= 2
          ? 'Multiple revenue streams are good'
          : 'Add at least 2 monetization methods'
      },
      {
        criterion: 'Core Loop Defined',
        passed: idea.coreLoop.length > 20,
        feedback: idea.coreLoop.length > 20 ? 'Clear gameplay loop defined' : 'Describe your core loop in more detail'
      },
      {
        criterion: 'Unique Hook',
        passed: idea.uniqueHook.length > 10,
        feedback: idea.uniqueHook.length > 10 ? 'Differentiation helps stand out' : 'What makes your game different?'
      },
      {
        criterion: 'Pattern Match Found',
        passed: !!pattern,
        feedback: pattern ? `Matched to "${pattern.name}" pattern with proven success` : 'No proven pattern found'
      }
    ]

    const passedCount = checks.filter(c => c.passed).length
    const score = Math.round((passedCount / checks.length) * 100)

    // Generate game plan based on pattern
    let gamePlan = {
      coreMechanics: [] as string[],
      monetizationStrategy: [] as string[],
      viralHooks: [] as string[],
      retentionSystems: [] as string[],
      contentRoadmap: [] as string[],
      pitfallsToAvoid: [] as string[]
    }

    if (pattern) {
      gamePlan = {
        coreMechanics: pattern.coreRequirements,
        monetizationStrategy: pattern.monetization,
        viralHooks: pattern.viral,
        retentionSystems: pattern.retention,
        contentRoadmap: pattern.contentRoadmap,
        pitfallsToAvoid: pattern.pitfalls
      }
    }

    // Similar games
    const similarGames = pattern?.examples.map(name => ({
      name,
      why: `Uses the ${pattern.name} pattern`
    })) || []

    setResult({
      qualified: score >= 70,
      score,
      pattern,
      checks,
      gamePlan,
      similarGames
    })

    setLoading(false)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">Qualify Your Game Idea</h1>
        <p className="text-gray-400 mt-1">
          Validate your concept and get a complete game plan based on proven patterns
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className={`flex-1 h-2 rounded-full ${s <= step ? 'bg-red-600' : 'bg-gray-800'}`} />
        ))}
      </div>

      {/* Step 1: Template */}
      {step === 1 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Step 1: Choose a Game Template</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {GAME_TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setIdea(prev => ({ ...prev, template: t.id }))}
                className={`p-4 rounded-lg text-left transition-all ${
                  idea.template === t.id ? 'bg-red-600 border-2 border-red-400' : 'bg-gray-800 border border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="font-bold">{t.label}</div>
                <div className="text-xs text-gray-400 mt-1">{t.example}</div>
              </button>
            ))}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!idea.template}
            className="mt-6 px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 rounded-lg font-medium"
          >
            Next: Choose Theme
          </button>
        </div>
      )}

      {/* Step 2: Theme */}
      {step === 2 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Step 2: Pick a Theme</h2>
          <div className="flex flex-wrap gap-2">
            {THEMES.map((t) => (
              <button
                key={t}
                onClick={() => setIdea(prev => ({ ...prev, theme: t }))}
                className={`px-4 py-2 rounded-lg ${
                  idea.theme === t ? 'bg-red-600 text-white' : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="mt-4">
            <input
              type="text"
              value={THEMES.includes(idea.theme) ? '' : idea.theme}
              onChange={(e) => setIdea(prev => ({ ...prev, theme: e.target.value }))}
              placeholder="Or enter custom theme..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-red-500"
            />
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(1)} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg">Back</button>
            <button onClick={() => setStep(3)} disabled={!idea.theme} className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 rounded-lg">Next: Details</button>
          </div>
        </div>
      )}

      {/* Step 3: Details */}
      {step === 3 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Step 3: Define Your Game</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">Game Name</label>
              <input
                type="text"
                value={idea.name}
                onChange={(e) => setIdea(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Anime Tower Legends"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">Core Gameplay Loop</label>
              <textarea
                value={idea.coreLoop}
                onChange={(e) => setIdea(prev => ({ ...prev, coreLoop: e.target.value }))}
                placeholder="Describe what players do repeatedly..."
                className="w-full h-24 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-2">What makes it unique?</label>
              <input
                type="text"
                value={idea.uniqueHook}
                onChange={(e) => setIdea(prev => ({ ...prev, uniqueHook: e.target.value }))}
                placeholder="e.g., First TD with real-time PvP battles"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(2)} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg">Back</button>
            <button onClick={() => setStep(4)} className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg">Next: Monetization</button>
          </div>
        </div>
      )}

      {/* Step 4: Monetization */}
      {step === 4 && !result && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4">Step 4: Monetization Strategy</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MONETIZATION_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setIdea(prev => ({
                  ...prev,
                  monetization: prev.monetization.includes(opt.id)
                    ? prev.monetization.filter(m => m !== opt.id)
                    : [...prev.monetization, opt.id]
                }))}
                className={`p-4 rounded-lg text-left flex items-center gap-3 ${
                  idea.monetization.includes(opt.id)
                    ? 'bg-red-600/20 border-2 border-red-600'
                    : 'bg-gray-800 border border-gray-700 hover:border-gray-500'
                }`}
              >
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                  idea.monetization.includes(opt.id) ? 'border-red-500 bg-red-500 text-white' : 'border-gray-500'
                }`}>
                  {idea.monetization.includes(opt.id) && '✓'}
                </div>
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setStep(3)} className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg">Back</button>
            <button onClick={qualifyIdea} disabled={loading} className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-gray-700 rounded-lg">
              {loading ? 'Generating Plan...' : 'Generate Game Plan'}
            </button>
          </div>
        </div>
      )}

      {/* Results with Game Plan */}
      {result && (
        <div className="space-y-6">
          {/* Score Card */}
          <div className={`p-6 rounded-xl border ${result.qualified ? 'bg-green-900/20 border-green-800' : 'bg-yellow-900/20 border-yellow-800'}`}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{idea.name || 'Your Game Idea'}</h2>
                <p className="text-gray-400">{idea.theme} {GAME_TEMPLATES.find(t => t.id === idea.template)?.label}</p>
                {result.pattern && (
                  <p className="text-purple-400 mt-1">Matched Pattern: {result.pattern.name}</p>
                )}
                <p className={`text-lg mt-2 ${result.qualified ? 'text-green-400' : 'text-yellow-400'}`}>
                  {result.qualified ? 'LOOKS PROMISING' : 'NEEDS WORK'}
                </p>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold">{result.score}</div>
                <div className="text-gray-400 text-sm">/ 100</div>
              </div>
            </div>
          </div>

          {/* GAME PLAN SECTION */}
          {result.pattern && (
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-700/50 rounded-xl p-6">
              <h2 className="text-2xl font-bold mb-6">Your Game Plan</h2>

              {/* Core Mechanics */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-green-400 mb-3">Core Mechanics to Build</h3>
                <div className="grid gap-2">
                  {result.gamePlan.coreMechanics.map((m, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-black/30 rounded-lg">
                      <span className="text-green-400 font-bold">{i + 1}.</span>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Monetization Strategy */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-yellow-400 mb-3">Monetization Strategy</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {result.gamePlan.monetizationStrategy.map((m, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-black/30 rounded-lg">
                      <span className="text-yellow-400">$</span>
                      <span>{m}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Viral Hooks */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-blue-400 mb-3">Viral/Growth Hooks</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {result.gamePlan.viralHooks.map((v, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-black/30 rounded-lg">
                      <span className="text-blue-400">↗</span>
                      <span>{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Retention Systems */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-cyan-400 mb-3">Retention Systems</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {result.gamePlan.retentionSystems.map((r, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-black/30 rounded-lg">
                      <span className="text-cyan-400">+</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Content Roadmap */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-orange-400 mb-3">Suggested Content Roadmap</h3>
                <div className="space-y-2">
                  {result.gamePlan.contentRoadmap.map((c, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-black/30 rounded-lg">
                      <span className="text-orange-400 font-mono text-sm whitespace-nowrap">{c.split(':')[0]}:</span>
                      <span className="text-gray-300">{c.split(':').slice(1).join(':')}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pitfalls to Avoid */}
              <div>
                <h3 className="text-lg font-bold text-red-400 mb-3">Pitfalls to Avoid</h3>
                <div className="grid md:grid-cols-2 gap-2">
                  {result.gamePlan.pitfallsToAvoid.map((p, i) => (
                    <div key={i} className="flex items-start gap-2 p-3 bg-red-900/20 rounded-lg border border-red-800/50">
                      <span className="text-red-400">!</span>
                      <span className="text-gray-300">{p}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Similar Games */}
          {result.similarGames.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4">Study These Competitors</h3>
              <div className="space-y-2">
                {result.similarGames.map((g, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg">
                    <span className="font-medium">{g.name}</span>
                    <span className="text-gray-400 text-sm">{g.why}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Qualification Checks */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-bold mb-4">Qualification Checks</h3>
            <div className="space-y-2">
              {result.checks.map((c, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                  <span className={`text-xl ${c.passed ? 'text-green-400' : 'text-red-400'}`}>
                    {c.passed ? '✓' : '✗'}
                  </span>
                  <div>
                    <span className="font-medium">{c.criterion}</span>
                    <p className="text-gray-400 text-sm">{c.feedback}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setResult(null)
                setStep(1)
                setIdea({ name: '', template: '', theme: '', coreLoop: '', monetization: [], uniqueHook: '' })
              }}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-medium"
            >
              Start Over
            </button>
            <button
              onClick={() => { setResult(null); setStep(4) }}
              className="px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg font-medium"
            >
              Refine & Regenerate
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
