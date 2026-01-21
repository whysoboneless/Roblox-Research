'use client'

import { useState } from 'react'
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
}

const IDEA_STARTERS = [
  { id: 'trending', label: 'What\'s trending right now?' },
  { id: 'underserved', label: 'Find underserved niches' },
  { id: 'mashup', label: 'Combine two popular genres' },
  { id: 'improve', label: 'Improve an existing game type' },
  { id: 'theme', label: 'Suggest a theme for my template' },
  { id: 'random', label: 'Generate random idea' },
]

const TRENDING_PATTERNS = [
  {
    name: 'Anime Defenders Clone',
    template: 'Tower Defense',
    theme: 'Anime',
    coreLoop: 'Summon anime characters via gacha, place them as towers, upgrade with duplicates, defend waves, earn currency for more summons',
    uniqueHook: 'Add unique co-op raid bosses or PvP tower battles',
    monetization: ['Gacha summons', 'Battle pass', 'Premium currency'],
    whyItWorks: 'Anime TD is proven with multiple $100k+/month games. Collection mechanics drive long-term engagement.',
    risks: ['Saturated market', 'High content expectations', 'Balancing gacha rates'],
    firstSteps: ['Design 20-30 starter units', 'Build wave system prototype', 'Create gacha UI']
  },
  {
    name: 'Survival Crafting Game',
    template: 'Survival',
    theme: 'Post-Apocalyptic',
    coreLoop: 'Gather resources, craft tools/weapons, build base, survive against environment and enemies, progress through technology tiers',
    uniqueHook: 'Procedurally generated world with seasons affecting gameplay',
    monetization: ['Cosmetic skins', 'Base decorations', 'Premium tools'],
    whyItWorks: 'Survival games have dedicated audiences. Base building provides social sharing opportunities.',
    risks: ['Complex development', 'Performance optimization', 'Griefing in multiplayer'],
    firstSteps: ['Core resource gathering loop', 'Basic crafting system', 'Simple building mechanics']
  },
  {
    name: 'Clicker Tycoon Hybrid',
    template: 'Simulator',
    theme: 'Business',
    coreLoop: 'Click to earn currency, buy automated earners, prestige for multipliers, unlock new areas and upgrades',
    uniqueHook: 'Real business simulation with market dynamics',
    monetization: ['2x earnings pass', 'Auto-clicker', 'Skip timers', 'Premium areas'],
    whyItWorks: 'Low barrier to entry, satisfying progression, works well with minimal art',
    risks: ['Can feel too simple', 'Balancing progression curve', 'Player fatigue'],
    firstSteps: ['Core click + currency system', 'First 5 purchasable upgrades', 'Basic prestige system']
  }
]

const UNDERSERVED_NICHES = [
  {
    name: 'Cooking Competition Game',
    template: 'Simulation',
    theme: 'Food/Cooking',
    coreLoop: 'Compete in timed cooking challenges, unlock recipes, customize restaurant, climb leaderboards',
    uniqueHook: 'Real-time multiplayer cooking competitions like MasterChef',
    monetization: ['Recipe packs', 'Kitchen cosmetics', 'Chef outfits'],
    whyItWorks: 'Cooking games are popular on mobile but underrepresented on Roblox',
    risks: ['Niche audience', 'Complex cooking mechanics', 'Recipe variety needed'],
    firstSteps: ['Core cooking minigame', 'Recipe unlock system', 'Kitchen customization']
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
    firstSteps: ['Note highway system', 'Scoring mechanics', 'Song import system']
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
    firstSteps: ['Core battle system', 'Starter deck design', 'Basic AI opponent']
  }
]

const MASHUP_IDEAS = [
  {
    name: 'Horror Simulator',
    template: 'Simulator + Horror',
    theme: 'Paranormal',
    coreLoop: 'Investigate haunted locations, collect evidence, upgrade equipment, survive encounters',
    uniqueHook: 'Phasmophobia-style ghost hunting with progression',
    monetization: ['Equipment upgrades', 'Flashlight skins', 'Vehicle cosmetics'],
    whyItWorks: 'Combines horror engagement with simulator progression hooks',
    risks: ['Balancing scares vs grinding', 'Multiplayer sync', 'Performance with effects'],
    firstSteps: ['Ghost AI behavior', 'Evidence collection system', 'Basic progression']
  },
  {
    name: 'Tycoon TD',
    template: 'Tycoon + Tower Defense',
    theme: 'Medieval',
    coreLoop: 'Build castle economy, spawn defenders, manage resources during waves, expand territory',
    uniqueHook: 'Economic management between waves with base building',
    monetization: ['Castle packs', 'Troop skins', 'Resource boosters'],
    whyItWorks: 'Two proven mechanics combined - broader appeal',
    risks: ['Pacing between genres', 'Complexity creep', 'Balancing economy'],
    firstSteps: ['Resource generation loop', 'Basic wave combat', 'Castle builder UI']
  },
  {
    name: 'Racing Obby',
    template: 'Racing + Obby',
    theme: 'Futuristic',
    coreLoop: 'Race through obstacle courses, unlock vehicles, compete on leaderboards, create custom tracks',
    uniqueHook: 'Fall Guys style elimination races with vehicles',
    monetization: ['Vehicle skins', 'Trail effects', 'Track creator pass'],
    whyItWorks: 'Combines accessibility of obby with competitive racing',
    risks: ['Vehicle physics', 'Level design variety', 'Matchmaking'],
    firstSteps: ['Vehicle controller', 'Checkpoint system', 'Obstacle physics']
  }
]

export default function HelperPage() {
  const [selectedStarter, setSelectedStarter] = useState<string | null>(null)
  const [generatedIdeas, setGeneratedIdeas] = useState<GeneratedIdea[]>([])
  const [customInput, setCustomInput] = useState('')
  const [loading, setLoading] = useState(false)

  const generateIdeas = async (starterId: string) => {
    setLoading(true)
    setSelectedStarter(starterId)

    // Simulate loading
    await new Promise(r => setTimeout(r, 800))

    let ideas: GeneratedIdea[] = []

    switch (starterId) {
      case 'trending':
        ideas = TRENDING_PATTERNS
        break
      case 'underserved':
        ideas = UNDERSERVED_NICHES
        break
      case 'mashup':
        ideas = MASHUP_IDEAS
        break
      case 'improve':
        ideas = [
          {
            name: 'Better Pet Simulator',
            template: 'Simulator',
            theme: 'Pets',
            coreLoop: 'Hatch eggs, collect pets, fuse for rarer ones, explore worlds, trade with players',
            uniqueHook: 'Focus on pet personalities and mini-games with your pets',
            monetization: ['Premium eggs', 'Pet accessories', 'VIP worlds'],
            whyItWorks: 'Improves on existing formula with more pet interaction',
            risks: ['Competing with established games', 'Content expectations', 'Trading economy'],
            firstSteps: ['Core hatching system', 'Pet stats and leveling', 'First 20 pets']
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
            firstSteps: ['Scare system design', 'First puzzle set', 'Monster AI']
          }
        ]
        break
      case 'theme':
        ideas = [
          {
            name: 'Dinosaur Tycoon',
            template: 'Tycoon',
            theme: 'Dinosaurs',
            coreLoop: 'Build dinosaur park, breed dinos, attract visitors, manage resources',
            uniqueHook: 'Jurassic Park style with genetics and breeding',
            monetization: ['Rare dino eggs', 'Park decorations', 'Premium enclosures'],
            whyItWorks: 'Dinosaurs are evergreen popular with kids',
            risks: ['Asset creation for dinos', 'Balancing visitor AI', 'Performance'],
            firstSteps: ['Dino breeding system', 'Enclosure building', 'Visitor AI']
          },
          {
            name: 'Space Simulator',
            template: 'Simulator',
            theme: 'Space',
            coreLoop: 'Mine asteroids, upgrade ship, explore planets, trade resources, build space station',
            uniqueHook: 'Open world space exploration with base building',
            monetization: ['Ship skins', 'Space suits', 'Premium planets'],
            whyItWorks: 'Space theme is underutilized on Roblox',
            risks: ['Scale of space', 'Performance with large maps', 'Content variety'],
            firstSteps: ['Ship flying mechanics', 'Mining system', 'First 3 planets']
          }
        ]
        break
      case 'random':
        const allIdeas = [...TRENDING_PATTERNS, ...UNDERSERVED_NICHES, ...MASHUP_IDEAS]
        const shuffled = allIdeas.sort(() => Math.random() - 0.5)
        ideas = shuffled.slice(0, 3)
        break
    }

    setGeneratedIdeas(ideas)
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="text-sm text-gray-500 mb-1 uppercase tracking-wider">Brainstorming</div>
        <h1 className="text-3xl font-bold">Idea Helper</h1>
        <p className="text-gray-400 mt-1">Get help brainstorming your next Roblox game concept</p>
      </div>

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
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-700 border-t-red-500"></div>
          <p className="text-gray-400 mt-4">Generating ideas...</p>
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
                <h3 className="text-2xl font-bold">{idea.name}</h3>
                <div className="flex gap-2 mt-2">
                  <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                    {idea.template}
                  </span>
                  <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full text-sm">
                    {idea.theme}
                  </span>
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
                  href={`/idea?template=${idea.template.split(' ')[0].toLowerCase()}&theme=${idea.theme}`}
                  className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
                >
                  Validate This Idea
                </Link>
                <Link
                  href={`/discover?query=${encodeURIComponent(idea.template)}`}
                  className="px-4 py-2 bg-[#1a1a1a] hover:bg-[#222] border border-gray-700 rounded-lg text-sm font-medium transition-colors"
                >
                  Find Competitors
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
            Ideas are based on proven patterns and market analysis
          </p>
        </div>
      )}
    </div>
  )
}
