'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface GeneratedIdea {
  name: string
  template: string
  theme: string
  coreLoop: string
  uniqueHook: string
  monetization: string[]
  whyItWorks: string
  risks: string[]
  firstSteps: string[]
  complexity?: string
  sourceData?: {
    gamesAnalyzed: number
    avgRevenue: number
    qualificationScore: number
  }
}

interface SavedGroup {
  id: string
  group_name: string
  structural_characteristics: {
    category?: string
    vertical?: string
    subVertical?: string
    theme?: string
    dominantCoreLoop?: string
  }
  qualification_score: number
  analysis_notes?: {
    patterns?: any
    replicationGuide?: any
    metrics?: any
  }
}

interface EmergingGame {
  placeId: string
  name: string
  metrics: {
    currentPlayers: number
    estimatedRevenue: number
    likeRatio: string
  }
  daysOld: number
  classification?: {
    vertical?: string
    theme?: string
    coreLoop?: string
  }
}

const IDEA_STARTERS = [
  { id: 'trending', label: 'What\'s trending right now?', description: 'Based on real emerging games' },
  { id: 'saved', label: 'From my research', description: 'Use saved competitor groups' },
  { id: 'underserved', label: 'Find underserved niches', description: 'Low competition opportunities' },
  { id: 'mashup', label: 'Combine two formulas', description: 'Mix proven mechanics' },
  { id: 'improve', label: 'Improve an existing type', description: 'Better execution' },
  { id: 'random', label: 'Generate random idea', description: 'Surprise me' },
]

// Fallback static ideas for when API fails
const FALLBACK_TRENDING = [
  {
    name: 'Brainrot Simulator',
    template: 'Simulator',
    theme: 'Meme/Brainrot',
    coreLoop: 'Click to collect brainrot items, upgrade collection speed, prestige for multipliers, unlock new brainrot characters',
    uniqueHook: 'Trending meme characters with constant updates',
    monetization: ['2x earnings pass', 'Auto-collect', 'VIP bundle', 'Premium brainrot packs'],
    whyItWorks: 'Low complexity, meme themes drive viral growth, proven simulator formula',
    risks: ['Meme trends fade quickly', 'IP concerns with characters', 'Balancing prestige'],
    firstSteps: ['Core click + currency system', 'First 10 brainrot items', 'Basic prestige'],
    complexity: 'Low-Medium'
  },
  {
    name: 'Anime Tower Defense',
    template: 'Tower Defense',
    theme: 'Anime',
    coreLoop: 'Summon anime units via gacha, place to defend waves, upgrade with duplicates, progress through stages',
    uniqueHook: 'Popular anime characters with trading economy',
    monetization: ['Gacha summons', 'Battle pass', 'Premium currency', 'Trading passes'],
    whyItWorks: 'Multiple proven $100k+/month games. Collection + trading drives retention.',
    risks: ['Saturated market', 'High content expectations', 'Balancing gacha rates'],
    firstSteps: ['20-30 starter units', 'Wave system prototype', 'Gacha UI'],
    complexity: 'Medium'
  }
]

export default function HelperPage() {
  const [selectedStarter, setSelectedStarter] = useState<string | null>(null)
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([])
  const [savedGroups, setSavedGroups] = useState<SavedGroup[]>([])
  const [emergingGames, setEmergingGames] = useState<EmergingGame[]>([])
  const [customInput, setCustomInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [dataLoaded, setDataLoaded] = useState(false)

  // Fetch saved groups and emerging games on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [groupsRes, emergingRes] = await Promise.all([
          fetch('/api/competitor-group').catch(() => null),
          fetch('/api/emerging?limit=20').catch(() => null)
        ])

        if (groupsRes?.ok) {
          const groupsData = await groupsRes.json()
          setSavedGroups(groupsData.groups || [])
        }

        if (emergingRes?.ok) {
          const emergingData = await emergingRes.json()
          setEmergingGames(emergingData.games || [])
        }

        setDataLoaded(true)
      } catch (err) {
        console.error('Failed to fetch data:', err)
        setDataLoaded(true)
      }
    }

    fetchData()
  }, [])

  const generateIdeas = async (starterId: string) => {
    setLoading(true)
    setSelectedStarter(starterId)

    let ideas: GeneratedIdea[] = []

    try {
      switch (starterId) {
        case 'trending':
          ideas = await generateTrendingIdeas()
          break
        case 'saved':
          ideas = generateFromSavedGroups()
          break
        case 'underserved':
          ideas = generateUnderservedIdeas()
          break
        case 'mashup':
          ideas = generateMashupIdeas()
          break
        case 'improve':
          ideas = generateImprovementIdeas()
          break
        case 'random':
          ideas = await generateRandomIdeas()
          break
      }
    } catch (err) {
      console.error('Error generating ideas:', err)
      ideas = FALLBACK_TRENDING
    }

    setGeneratedIdeas(ideas)
    setLoading(false)
  }

  const generateTrendingIdeas = async (): Promise<GeneratedIdea[]> => {
    // If we have emerging games, group them by vertical and generate ideas
    if (emergingGames.length > 0) {
      const verticalGroups: Record<string, EmergingGame[]> = {}

      for (const game of emergingGames) {
        const vertical = game.classification?.vertical || 'Simulator'
        if (!verticalGroups[vertical]) {
          verticalGroups[vertical] = []
        }
        verticalGroups[vertical].push(game)
      }

      // Find verticals with multiple games (trending patterns)
      const trendingVerticals = Object.entries(verticalGroups)
        .filter(([_, games]) => games.length >= 2)
        .sort((a, b) => {
          const avgRevA = a[1].reduce((sum, g) => sum + g.metrics.estimatedRevenue, 0) / a[1].length
          const avgRevB = b[1].reduce((sum, g) => sum + g.metrics.estimatedRevenue, 0) / b[1].length
          return avgRevB - avgRevA
        })
        .slice(0, 3)

      return trendingVerticals.map(([vertical, games]) => {
        const avgRevenue = Math.round(games.reduce((sum, g) => sum + g.metrics.estimatedRevenue, 0) / games.length)
        const theme = games[0].classification?.theme || 'Fantasy'
        const coreLoop = games[0].classification?.coreLoop || 'Collect, upgrade, progress'

        return {
          name: `${theme} ${vertical}`,
          template: vertical,
          theme: theme,
          coreLoop: coreLoop,
          uniqueHook: `Based on ${games.length} trending games with avg $${avgRevenue.toLocaleString()}/mo`,
          monetization: getDefaultMonetization(vertical),
          whyItWorks: `${games.length} emerging games using this formula. Recent success indicates market demand.`,
          risks: getDefaultRisks(vertical),
          firstSteps: getDefaultFirstSteps(vertical),
          complexity: getComplexity(vertical),
          sourceData: {
            gamesAnalyzed: games.length,
            avgRevenue,
            qualificationScore: avgRevenue > 10000 ? 80 : 50
          }
        }
      })
    }

    return FALLBACK_TRENDING
  }

  const generateFromSavedGroups = (): GeneratedIdea[] => {
    if (savedGroups.length === 0) {
      return [{
        name: 'No Saved Research',
        template: 'Research Required',
        theme: 'Unknown',
        coreLoop: 'First, analyze some competitor groups using the Analyze page',
        uniqueHook: 'Save competitor group research to generate ideas based on real patterns',
        monetization: [],
        whyItWorks: 'Ideas from saved research are grounded in proven patterns',
        risks: ['No research data available yet'],
        firstSteps: ['Go to /analyze', 'Enter 5-10 similar game Place IDs', 'Save the competitor group']
      }]
    }

    return savedGroups.slice(0, 3).map(group => {
      const guide = group.analysis_notes?.replicationGuide || {}
      const patterns = group.analysis_notes?.patterns || {}
      const metrics = group.analysis_notes?.metrics || {}

      return {
        name: `${group.group_name} Clone`,
        template: group.structural_characteristics?.vertical || 'Unknown',
        theme: group.structural_characteristics?.theme || 'Unknown',
        coreLoop: group.structural_characteristics?.dominantCoreLoop || 'Based on analyzed competitors',
        uniqueHook: guide.differentiation?.[0] || 'Add your unique twist to the proven formula',
        monetization: patterns.mustHave?.monetization || guide.mustHave?.filter((m: string) => m.toLowerCase().includes('pass') || m.toLowerCase().includes('gamepass')) || [],
        whyItWorks: `Based on ${metrics.avgRevenue ? `$${metrics.avgRevenue.toLocaleString()}/mo avg` : 'your research'}. Qualification score: ${group.qualification_score}/100`,
        risks: guide.pitfalls || ['See your saved research for detailed pitfalls'],
        firstSteps: guide.coreRequirements || guide.mustHave?.slice(0, 3) || ['Implement core loop', 'Add monetization', 'Test retention'],
        complexity: 'Medium',
        sourceData: {
          gamesAnalyzed: 5,
          avgRevenue: metrics.avgRevenue || 0,
          qualificationScore: group.qualification_score
        }
      }
    })
  }

  const generateUnderservedIdeas = (): GeneratedIdea[] => {
    // Ideas for verticals with less competition
    return [
      {
        name: 'Cooking Competition Game',
        template: 'Simulation',
        theme: 'Food/Cooking',
        coreLoop: 'Compete in timed cooking challenges, unlock recipes, customize restaurant, climb leaderboards',
        uniqueHook: 'Real-time multiplayer cooking competitions like MasterChef',
        monetization: ['Recipe packs', 'Kitchen cosmetics', 'Chef outfits'],
        whyItWorks: 'Cooking games popular on mobile but underrepresented on Roblox',
        risks: ['Niche audience', 'Complex cooking mechanics', 'Recipe variety needed'],
        firstSteps: ['Core cooking minigame', 'Recipe unlock system', 'Kitchen customization'],
        complexity: 'Medium'
      },
      {
        name: 'Music/Rhythm Game',
        template: 'Rhythm',
        theme: 'Music',
        coreLoop: 'Hit notes to the beat, unlock songs, customize character, compete for high scores',
        uniqueHook: 'User-generated beatmaps with social sharing',
        monetization: ['Song packs', 'Character skins', 'Instruments'],
        whyItWorks: 'Rhythm games have passionate communities. Few quality options on Roblox.',
        risks: ['Music licensing', 'Timing precision on Roblox', 'Content creation tools'],
        firstSteps: ['Note highway system', 'Scoring mechanics', 'Song import system'],
        complexity: 'Medium-High'
      },
      {
        name: 'Card Battler',
        template: 'Strategy',
        theme: 'Fantasy',
        coreLoop: 'Build decks, battle AI or players, earn cards from victories, climb ranked ladder',
        uniqueHook: 'Simplified mechanics for younger audience with deep strategy potential',
        monetization: ['Card packs', 'Cosmetic card backs', 'Battle pass with exclusive cards'],
        whyItWorks: 'Huge market on PC/mobile, limited competition on Roblox',
        risks: ['Balancing 100+ cards', 'UI complexity', 'Teaching new players'],
        firstSteps: ['Core battle system', 'Starter deck design', 'Basic AI opponent'],
        complexity: 'High'
      }
    ]
  }

  const generateMashupIdeas = (): GeneratedIdea[] => {
    const baseIdeas = [
      {
        name: 'Horror Simulator',
        template: 'Simulator + Horror',
        theme: 'Paranormal',
        coreLoop: 'Investigate haunted locations, collect evidence, upgrade equipment, survive encounters',
        uniqueHook: 'Phasmophobia-style ghost hunting with progression',
        monetization: ['Equipment upgrades', 'Flashlight skins', 'Vehicle cosmetics'],
        whyItWorks: 'Combines horror engagement with simulator progression hooks',
        risks: ['Balancing scares vs grinding', 'Multiplayer sync', 'Performance with effects'],
        firstSteps: ['Ghost AI behavior', 'Evidence collection system', 'Basic progression'],
        complexity: 'Medium'
      },
      {
        name: 'Tycoon Tower Defense',
        template: 'Tycoon + Tower Defense',
        theme: 'Medieval',
        coreLoop: 'Build castle economy, spawn defenders, manage resources during waves, expand territory',
        uniqueHook: 'Economic management between waves with base building',
        monetization: ['Castle packs', 'Troop skins', 'Resource boosters'],
        whyItWorks: 'Two proven mechanics combined - broader appeal',
        risks: ['Pacing between genres', 'Complexity creep', 'Balancing economy'],
        firstSteps: ['Resource generation loop', 'Basic wave combat', 'Castle builder UI'],
        complexity: 'Medium-High'
      }
    ]

    // If we have saved groups, try to create mashups from them
    if (savedGroups.length >= 2) {
      const group1 = savedGroups[0]
      const group2 = savedGroups[1]

      baseIdeas.push({
        name: `${group1.structural_characteristics?.vertical || 'Unknown'} x ${group2.structural_characteristics?.theme || 'Unknown'}`,
        template: `${group1.structural_characteristics?.vertical} + ${group2.structural_characteristics?.vertical}`,
        theme: group2.structural_characteristics?.theme || 'Mixed',
        coreLoop: `Combine ${group1.structural_characteristics?.dominantCoreLoop || 'Formula 1'} with ${group2.structural_characteristics?.theme || 'Theme 2'} aesthetics`,
        uniqueHook: 'Novel combination of proven formulas from your research',
        monetization: ['Combined monetization from both formulas'],
        whyItWorks: 'Based on your qualified competitor groups',
        risks: ['Complexity from combining mechanics', 'May confuse target audience'],
        firstSteps: ['Identify which mechanics to combine', 'Create unified progression', 'Test with target audience'],
        complexity: 'Medium-High'
      })
    }

    return baseIdeas
  }

  const generateImprovementIdeas = (): GeneratedIdea[] => {
    // If we have emerging games, suggest improvements to top performers
    if (emergingGames.length > 0) {
      return emergingGames.slice(0, 3).map(game => ({
        name: `Better ${game.name}`,
        template: game.classification?.vertical || 'Simulator',
        theme: game.classification?.theme || 'Various',
        coreLoop: game.classification?.coreLoop || 'Study the original and improve',
        uniqueHook: 'Better UX, more content, unique twist on proven formula',
        monetization: getDefaultMonetization(game.classification?.vertical || 'Simulator'),
        whyItWorks: `${game.name} is doing $${game.metrics.estimatedRevenue.toLocaleString()}/mo - formula is proven`,
        risks: ['Competing with established game', 'Need clear differentiation', 'Player loyalty to original'],
        firstSteps: ['Play the original extensively', 'Identify pain points', 'Build improved version'],
        complexity: 'Medium',
        sourceData: {
          gamesAnalyzed: 1,
          avgRevenue: game.metrics.estimatedRevenue,
          qualificationScore: 70
        }
      }))
    }

    return [
      {
        name: 'Better Pet Simulator',
        template: 'Simulator',
        theme: 'Pets',
        coreLoop: 'Hatch eggs, collect pets, fuse for rarer ones, explore worlds, trade with players',
        uniqueHook: 'Focus on pet personalities and mini-games with your pets',
        monetization: ['Premium eggs', 'Pet accessories', 'VIP worlds'],
        whyItWorks: 'Improves on existing formula with more pet interaction',
        risks: ['Competing with established games', 'Content expectations', 'Trading economy'],
        firstSteps: ['Core hatching system', 'Pet stats and leveling', 'First 20 pets'],
        complexity: 'Medium'
      },
      {
        name: 'Improved Horror Experience',
        template: 'Horror',
        theme: 'Psychological',
        coreLoop: 'Explore environments, solve puzzles, evade threats, uncover story, survive',
        uniqueHook: 'Dynamic scares that adapt to player behavior',
        monetization: ['Chapter DLCs', 'Cosmetics', 'Hint system'],
        whyItWorks: 'Most Roblox horror is jumpscare-focused - room for psychological horror',
        risks: ['Higher development bar', 'Replay value', 'Age appropriateness'],
        firstSteps: ['Scare system design', 'First puzzle set', 'Monster AI'],
        complexity: 'Medium-High'
      }
    ]
  }

  const generateRandomIdeas = async (): Promise<GeneratedIdea[]> => {
    const allIdeas = [
      ...FALLBACK_TRENDING,
      ...generateUnderservedIdeas(),
      ...generateMashupIdeas()
    ]

    // Add ideas from research if available
    if (savedGroups.length > 0) {
      allIdeas.push(...generateFromSavedGroups())
    }

    // Shuffle and return 3
    return allIdeas.sort(() => Math.random() - 0.5).slice(0, 3)
  }

  // Helper functions
  const getDefaultMonetization = (vertical: string): string[] => {
    const map: Record<string, string[]> = {
      'Simulator': ['2x earnings pass', 'Auto-collect', 'VIP bundle', 'Premium areas'],
      'Tower Defense': ['Gacha summons', 'Battle pass', 'Premium currency', 'Trading passes'],
      'Tycoon': ['2x earnings', 'Auto-manager', 'Premium buildings', 'Decorations'],
      'Horror': ['Extra lives', 'Cosmetics', 'Chapter unlocks', 'Hints'],
      'Obby': ['Skip stages', 'Trails', 'Pets', 'Checkpoints'],
      'Survival': ['Starter kits', 'Base blueprints', 'Cosmetics', 'Premium resources']
    }
    return map[vertical] || ['Gamepasses', 'Premium currency', 'Cosmetics']
  }

  const getDefaultRisks = (vertical: string): string[] => {
    const map: Record<string, string[]> = {
      'Simulator': ['Balancing progression curve', 'Content variety', 'Player fatigue'],
      'Tower Defense': ['Unit balancing', 'Content expectations', 'Gacha fairness'],
      'Tycoon': ['Performance optimization', 'Scaling issues', 'Progression pacing'],
      'Horror': ['Replay value', 'Age ratings', 'Scare effectiveness'],
      'Obby': ['Level design variety', 'Difficulty curve', 'Competition'],
      'Survival': ['Multiplayer sync', 'Performance', 'Griefing']
    }
    return map[vertical] || ['Market competition', 'Development complexity', 'Content needs']
  }

  const getDefaultFirstSteps = (vertical: string): string[] => {
    const map: Record<string, string[]> = {
      'Simulator': ['Core click/collect loop', 'Currency + upgrade system', 'Prestige mechanics'],
      'Tower Defense': ['Wave system', 'Unit placement', 'Upgrade paths'],
      'Tycoon': ['Building placement', 'Income generation', 'Employee AI'],
      'Horror': ['Monster AI', 'Scare triggers', 'Objective system'],
      'Obby': ['Obstacle physics', 'Checkpoint system', 'Level design'],
      'Survival': ['Resource gathering', 'Crafting system', 'Health/hunger']
    }
    return map[vertical] || ['Core gameplay loop', 'Progression system', 'Basic monetization']
  }

  const getComplexity = (vertical: string): string => {
    const map: Record<string, string> = {
      'Simulator': 'Low-Medium',
      'Obby': 'Low',
      'Tycoon': 'Low-Medium',
      'Tower Defense': 'Medium',
      'Horror': 'Medium',
      'Survival': 'Medium-High',
      'Action RPG': 'High'
    }
    return map[vertical] || 'Medium'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Brainstorming</div>
        <h1 className="text-3xl font-bold">Idea Helper</h1>
        <p className="text-gray-400 mt-1">Get data-driven game ideas based on real market research</p>
      </div>

      {/* Data Status */}
      {dataLoaded && (
        <div className="flex gap-4 text-sm">
          {emergingGames.length > 0 && (
            <span className="text-green-400">{emergingGames.length} emerging games loaded</span>
          )}
          {savedGroups.length > 0 && (
            <span className="text-blue-400">{savedGroups.length} saved groups available</span>
          )}
          {emergingGames.length === 0 && savedGroups.length === 0 && (
            <span className="text-yellow-400">No research data - using default patterns</span>
          )}
        </div>
      )}

      {/* Starter Options */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {IDEA_STARTERS.map((starter) => (
          <button
            key={starter.id}
            onClick={() => generateIdeas(starter.id)}
            disabled={loading}
            className={`p-4 rounded-xl text-left transition-all ${
              selectedStarter === starter.id
                ? 'bg-white text-black border-2 border-white'
                : 'bg-[#0f0f0f] border border-gray-800 hover:border-gray-600'
            }`}
          >
            <p className="font-medium">{starter.label}</p>
            <p className={`text-xs mt-1 ${selectedStarter === starter.id ? 'text-gray-600' : 'text-gray-500'}`}>
              {starter.description}
            </p>
          </button>
        ))}
      </div>

      {/* Custom Input */}
      <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-6">
        <label className="block text-sm text-gray-400 mb-2">Or describe what you're looking for:</label>
        <div className="flex gap-3">
          <input
            type="text"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="e.g., 'A game that combines anime with survival mechanics'"
            className="flex-1 bg-[#1a1a1a] border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-green-500"
          />
          <button
            onClick={() => generateIdeas('random')}
            disabled={loading}
            className="px-6 py-3 bg-green-600 hover:bg-green-500 disabled:bg-gray-700 rounded-lg font-medium transition-colors"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-700 border-t-green-500"></div>
          <p className="text-gray-400 mt-4">Generating ideas from research data...</p>
        </div>
      )}

      {/* Generated Ideas */}
      {!loading && generatedIdeas.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold">Generated Ideas</h2>

          {generatedIdeas.map((idea, index) => (
            <div key={index} className="bg-[#0f0f0f] border border-gray-800 rounded-xl overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-800">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold">{idea.name}</h3>
                    <div className="flex gap-2 mt-2">
                      <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                        {idea.template}
                      </span>
                      <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                        {idea.theme}
                      </span>
                      {idea.complexity && (
                        <span className={`px-3 py-1 rounded-full text-sm ${
                          idea.complexity === 'Low' ? 'bg-green-900/50 text-green-400' :
                          idea.complexity === 'Low-Medium' ? 'bg-blue-900/50 text-blue-400' :
                          idea.complexity === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
                          'bg-red-900/50 text-red-400'
                        }`}>
                          {idea.complexity}
                        </span>
                      )}
                    </div>
                  </div>
                  {idea.sourceData && (
                    <div className="text-right text-sm">
                      <div className="text-gray-500">Based on {idea.sourceData.gamesAnalyzed} games</div>
                      <div className="text-green-400">${idea.sourceData.avgRevenue.toLocaleString()}/mo avg</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Core Loop */}
              <div className="p-6 bg-[#111] border-b border-gray-800">
                <h4 className="text-sm text-gray-500 mb-2">Core Gameplay Loop</h4>
                <p>{idea.coreLoop}</p>
              </div>

              {/* Unique Hook */}
              <div className="p-6 border-b border-gray-800">
                <h4 className="text-sm text-gray-500 mb-2">Unique Hook</h4>
                <p className="text-green-400">{idea.uniqueHook}</p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-800">
                {/* Monetization */}
                <div className="p-6">
                  <h4 className="text-sm text-yellow-500 mb-3">Monetization</h4>
                  <ul className="space-y-1">
                    {idea.monetization.map((m, i) => (
                      <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="text-yellow-500">$</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Risks */}
                <div className="p-6">
                  <h4 className="text-sm text-red-500 mb-3">Risks to Consider</h4>
                  <ul className="space-y-1">
                    {idea.risks.map((r, i) => (
                      <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="text-red-500">!</span>
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* First Steps */}
                <div className="p-6">
                  <h4 className="text-sm text-blue-500 mb-3">First Steps</h4>
                  <ul className="space-y-1">
                    {idea.firstSteps.map((s, i) => (
                      <li key={i} className="text-sm text-gray-400 flex items-center gap-2">
                        <span className="text-blue-500">{i + 1}.</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Why It Works */}
              <div className="p-6 bg-[#111] border-t border-gray-800">
                <h4 className="text-sm text-gray-500 mb-2">Why This Could Work</h4>
                <p className="text-gray-300">{idea.whyItWorks}</p>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-800 flex gap-3">
                <Link
                  href={`/analyze`}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Find Competitors to Analyze
                </Link>
                <Link
                  href={`/emerging?vertical=${encodeURIComponent(idea.template)}`}
                  className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  View Emerging Games
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && generatedIdeas.length === 0 && (
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl p-12 text-center">
          <p className="text-gray-400 mb-4">
            Select an option above to get game idea suggestions
          </p>
          <p className="text-gray-600 text-sm">
            Ideas are generated from real market data and your saved research
          </p>
        </div>
      )}
    </div>
  )
}
