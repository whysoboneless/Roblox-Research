'use client'

const PATTERNS = [
  {
    id: 'anime-tower-defense',
    name: 'Anime Tower Defense',
    template: 'Anime + Tower Defense',
    mechanic: 'Place anime characters as towers → Upgrade → Unlock new characters',
    examples: ['Anime Adventures', 'All Star Tower Defense', 'Anime Defenders'],
    complexity: 'High',
    retention: ['Gacha/summon system', 'Character collection', 'Meta progression', 'Co-op multiplayer'],
    monetization: ['Premium currency for summons', 'Battle passes', 'Limited time banners', 'Gems for stamina'],
    viral: ['Trading communities', 'Tier list discussions', 'Update hype cycles'],
    coreRequirements: [
      'Character collection system (50+ units)',
      'Gacha/summon mechanic with rates',
      'Tower placement + wave defense',
      'Upgrade/evolution system',
      'Multiplayer co-op',
    ],
    pitfalls: [
      'Poor gacha rates frustrate players',
      'Unbalanced units kill meta diversity',
      'Slow content updates cause churn',
      'Performance issues from too many units',
    ]
  },
  {
    id: 'pet-simulator',
    name: 'Pet Simulator',
    template: 'X Simulator + Pet Collection',
    mechanic: 'Click/tap to collect → Pets multiply earnings → Rebirth for permanent bonuses',
    examples: ['Pet Simulator X', 'Pet Simulator 99', 'Muscle Legends'],
    complexity: 'Medium',
    retention: ['Pet collection/fusion', 'Rebirth system', 'Eggs/hatching', 'Limited events'],
    monetization: ['Gamepasses (auto-click, luck boost)', 'Premium eggs', 'VIP areas', 'Event passes'],
    viral: ['Trading economy', 'Rare pet flexing', 'Youtuber giveaways'],
    coreRequirements: [
      'Click-to-earn base mechanic',
      'Pet system with rarities',
      'Egg hatching animation',
      'Fusion/upgrade system',
      'Rebirth for multipliers',
    ],
    pitfalls: [
      'Economy inflation (numbers grow too fast)',
      'Trading exploits crash value',
      'Boring late-game grind',
      'Over-reliance on gamepasses',
    ]
  },
  {
    id: 'horror-multiplayer',
    name: 'Horror Multiplayer',
    template: 'Horror + Asymmetric Multiplayer',
    mechanic: 'One player hunts, others survive/escape → Round-based → Role switching',
    examples: ['Doors', 'Apeirophobia', 'Pressure', 'The Mimic'],
    complexity: 'Medium-High',
    retention: ['Procedural elements', 'Lore/story discovery', 'Unlockable items', 'Challenge modes'],
    monetization: ['Cosmetics', 'Revives/lives', 'Hint systems', 'Story DLC'],
    viral: ['Jump scare reactions', 'Lore theory videos', 'Speedrun community'],
    coreRequirements: [
      'Atmospheric sound design',
      'Hiding/escape mechanics',
      'Monster AI or player-controlled threat',
      'Checkpoint/progression system',
      'Multiplayer lobby system',
    ],
    pitfalls: [
      'Cheap scares lose novelty fast',
      'Performance tanks with lighting',
      'Toxic player behavior',
      'Story too confusing',
    ]
  },
  {
    id: 'incremental-tycoon',
    name: 'Incremental Tycoon',
    template: 'Tycoon + Automation + Incremental',
    mechanic: 'Build droppers → Collect → Upgrade → Automate → Prestige',
    examples: ['Arm Wrestle Simulator', 'Strongman Simulator', 'Mining Simulator 2'],
    complexity: 'Low-Medium',
    retention: ['Prestige/rebirth system', 'Automation unlocks', 'Competitive leaderboards', 'Daily rewards'],
    monetization: ['x2 earnings passes', 'Auto-collect', 'Premium areas', 'Exclusive tools'],
    viral: ['Big number flexing', 'Speedrun prestige', 'Leaderboard competition'],
    coreRequirements: [
      'Clear progression path',
      'Visual feedback (numbers flying)',
      'Prestige with meaningful bonuses',
      'Automation as reward',
      'Leaderboard system',
    ],
    pitfalls: [
      'Wall hits too early',
      'Prestige feels unrewarding',
      'No visual variety',
      'P2W perception',
    ]
  },
  {
    id: 'roleplay-life-sim',
    name: 'Roleplay Life Sim',
    template: 'Life Simulation + Social Roleplay',
    mechanic: 'Pick role/house → Customize → Social interaction → Live your virtual life',
    examples: ['Brookhaven RP', 'Bloxburg', 'Livetopia', 'Berry Avenue'],
    complexity: 'High',
    retention: ['House building', 'Vehicle collection', 'Friend systems', 'Seasonal updates'],
    monetization: ['Premium currency', 'House/vehicle packs', 'Clothing items', 'Special roles'],
    viral: ['Roleplay content', 'Building showcases', 'Drama/story content'],
    coreRequirements: [
      'Detailed character customization',
      'Housing system',
      'Vehicle system',
      'Role selection (jobs)',
      'Social features (friends, chat)',
    ],
    pitfalls: [
      'Moderation nightmare',
      'Content expectations too high',
      'Performance with large maps',
      'Monetization seen as greedy',
    ]
  }
]

export default function PatternsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pattern Library</h1>
        <p className="text-gray-400 mt-1">Proven game formats and reverse-engineering guides</p>
      </div>

      <div className="grid gap-6">
        {PATTERNS.map((pattern) => (
          <div key={pattern.id} className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-800">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold">{pattern.name}</h2>
                  <p className="text-gray-400 mt-1">Template: {pattern.template}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  pattern.complexity === 'Low' ? 'bg-green-900/50 text-green-400' :
                  pattern.complexity === 'Low-Medium' ? 'bg-green-900/50 text-green-400' :
                  pattern.complexity === 'Medium' ? 'bg-yellow-900/50 text-yellow-400' :
                  pattern.complexity === 'Medium-High' ? 'bg-orange-900/50 text-orange-400' :
                  'bg-red-900/50 text-red-400'
                }`}>
                  {pattern.complexity} Complexity
                </span>
              </div>
            </div>

            {/* Core Mechanic */}
            <div className="p-6 bg-[#111] border-b border-gray-800">
              <h3 className="text-sm text-gray-500 mb-2">Core Mechanic</h3>
              <p className="text-lg">{pattern.mechanic}</p>
            </div>

            {/* Examples */}
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-sm text-gray-500 mb-2">Example Games</h3>
              <div className="flex flex-wrap gap-2">
                {pattern.examples.map((ex) => (
                  <span key={ex} className="px-3 py-1 bg-[#111] rounded-lg text-sm">
                    {ex}
                  </span>
                ))}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-800">
              {/* Retention */}
              <div className="p-6">
                <h3 className="text-sm text-green-500 mb-3">Retention Drivers</h3>
                <ul className="space-y-2">
                  {pattern.retention.map((r, i) => (
                    <li key={i} className="text-sm text-gray-400 flex items-start gap-2">
                      <span className="text-green-500">+</span>
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
                      <span className="text-yellow-500">$</span>
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
                      <span className="text-blue-500">↗</span>
                      {v}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Implementation Guide */}
            <div className="p-6 bg-[#111] border-t border-gray-800">
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
        ))}
      </div>
    </div>
  )
}
