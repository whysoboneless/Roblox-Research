/**
 * TEST SCRIPT: Classification System Validation
 *
 * Tests the classification constants and helper functions
 * Run with: npx tsx scripts/test-classification.ts
 */

import {
  CATEGORIES,
  VERTICALS,
  THEMES,
  TARGET_AUDIENCES
} from '../lib/roblox-classification'

import {
  calculateQualificationScore,
  findOverlappingPatterns,
  generateSubVertical
} from '../lib/classification-system'

console.log('\n========================================')
console.log('CLASSIFICATION SYSTEM TESTS')
console.log('========================================\n')

let passed = 0
let failed = 0

function test(name: string, fn: () => boolean) {
  try {
    if (fn()) {
      console.log(`✓ ${name}`)
      passed++
    } else {
      console.log(`✗ ${name} - Assertion failed`)
      failed++
    }
  } catch (err: any) {
    console.log(`✗ ${name} - ${err.message}`)
    failed++
  }
}

// Test Categories
console.log('\n--- CATEGORIES ---')
test('CATEGORIES is defined', () => !!CATEGORIES)
test('Has SIMULATION category', () => !!CATEGORIES.SIMULATION)
test('Has ACTION category', () => !!CATEGORIES.ACTION)
test('Has STRATEGY category', () => !!CATEGORIES.STRATEGY)
test('SIMULATION has verticals', () => CATEGORIES.SIMULATION.verticals.length > 0)

// Test Verticals
console.log('\n--- VERTICALS ---')
test('VERTICALS is defined', () => !!VERTICALS)
test('Has SIMULATOR vertical', () => !!VERTICALS.SIMULATOR)
test('Has TOWER_DEFENSE vertical', () => !!VERTICALS.TOWER_DEFENSE)
test('Has TYCOON vertical', () => !!VERTICALS.TYCOON)
test('SIMULATOR has name and category', () =>
  VERTICALS.SIMULATOR.name === 'Simulator' && VERTICALS.SIMULATOR.category === 'Simulation'
)

// Test Themes
console.log('\n--- THEMES ---')
test('THEMES is defined', () => !!THEMES)
test('Has ANIME theme', () => !!THEMES.ANIME)
test('Has MEME_BRAINROT theme', () => !!THEMES.MEME_BRAINROT)
test('Has HORROR theme', () => !!THEMES.HORROR)
test('Themes have name and description', () =>
  !!THEMES.ANIME.name && !!THEMES.ANIME.description
)

// Test Target Audiences
console.log('\n--- TARGET AUDIENCES ---')
test('TARGET_AUDIENCES is defined', () => !!TARGET_AUDIENCES)
test('Has KIDS audience', () => !!TARGET_AUDIENCES.KIDS)
test('Kids has age range 8-12', () => TARGET_AUDIENCES.KIDS.ageRange === '8-12')

// Test Helper Functions
console.log('\n--- HELPER FUNCTIONS ---')

test('generateSubVertical works', () => {
  const result = generateSubVertical('Simulator', 'Anime')
  return result === 'Anime Simulator'
})

test('calculateQualificationScore with high revenue', () => {
  const games = [
    { metrics: { estimatedRevenue: 15000, likeRatio: '95' } },
    { metrics: { estimatedRevenue: 12000, likeRatio: '92' } }
  ]
  const result = calculateQualificationScore(games)
  return result.score > 50 && result.checks.hasRevenueProof === true
})

test('calculateQualificationScore with low revenue', () => {
  const games = [
    { metrics: { estimatedRevenue: 500, likeRatio: '75' } }
  ]
  const result = calculateQualificationScore(games)
  return result.score < 50 && result.isQualified === false
})

test('findOverlappingPatterns finds common patterns', () => {
  const classifications = [
    {
      coreLoop: { name: 'Collect → Upgrade → Prestige' },
      monetizationHooks: ['2x pass', 'VIP'],
      retentionHooks: ['prestige', 'daily'],
      viralHooks: ['codes']
    },
    {
      coreLoop: { name: 'Collect → Upgrade → Prestige' },
      monetizationHooks: ['2x pass', 'auto-collect'],
      retentionHooks: ['prestige', 'leaderboards'],
      viralHooks: ['codes', 'big numbers']
    }
  ]

  const result = findOverlappingPatterns(classifications)

  // Should find "2x pass" as 100% in monetization
  const twoXPass = result.monetization.find(m => m.pattern === '2x pass')
  const hasPrestige = result.retention.find(r => r.pattern === 'prestige')

  return twoXPass?.percentage === 100 && hasPrestige?.percentage === 100
})

test('findOverlappingPatterns calculates percentages correctly', () => {
  const classifications = [
    { monetizationHooks: ['A', 'B'] },
    { monetizationHooks: ['A', 'C'] },
    { monetizationHooks: ['A', 'D'] },
    { monetizationHooks: ['B', 'D'] }
  ]

  const result = findOverlappingPatterns(classifications as any)

  // A appears in 3/4 = 75%
  // B appears in 2/4 = 50%
  const patternA = result.monetization.find(m => m.pattern === 'A')
  const patternB = result.monetization.find(m => m.pattern === 'B')

  return patternA?.percentage === 75 && patternB?.percentage === 50
})

// Summary
console.log('\n========================================')
console.log(`RESULTS: ${passed} passed, ${failed} failed`)
console.log('========================================\n')

if (failed > 0) {
  process.exit(1)
}
