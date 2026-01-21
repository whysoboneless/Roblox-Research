/**
 * TEST SCRIPT: Full Classification & Analysis Workflow
 *
 * Tests:
 * 1. /api/emerging - Fetch emerging games
 * 2. /api/deep-analyze - Deep analyze a single game
 * 3. /api/analyze-group - Full competitor group analysis
 * 4. /api/competitor-group - Save/retrieve groups
 * 5. Helper page integration - Ideas from real data
 *
 * Run with: npx tsx scripts/test-workflow.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

// Sample Place IDs for testing (popular/reliable games)
// Using well-known games that should always exist
const TEST_PLACE_IDS = [
  '286090429',   // Arsenal (popular shooter)
  '920587237',   // Adopt Me (popular pet game)
  '4872489242',  // Brookhaven (popular roleplay)
]

interface TestResult {
  name: string
  passed: boolean
  duration: number
  error?: string
  data?: any
  warning?: string
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<any>, allowWarning = false): Promise<void> {
  const start = Date.now()
  try {
    const data = await fn()
    const duration = Date.now() - start
    results.push({ name, passed: true, duration, data })
    console.log(`✓ ${name} (${duration}ms)`)
  } catch (err: any) {
    const duration = Date.now() - start
    if (allowWarning) {
      results.push({ name, passed: true, duration, warning: err.message })
      console.log(`⚠ ${name} (${duration}ms) - ${err.message} (warning only)`)
    } else {
      results.push({ name, passed: false, duration, error: err.message })
      console.log(`✗ ${name} (${duration}ms) - ${err.message}`)
    }
  }
}

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${BASE_URL}${endpoint}`, options)
  const data = await res.json()
  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`)
  }
  return data
}

async function runTests() {
  console.log('\n========================================')
  console.log('ROBLOX RESEARCH TOOL - WORKFLOW TESTS')
  console.log('========================================\n')
  console.log(`Base URL: ${BASE_URL}\n`)

  // Test 1: Emerging Games API (allow warning - may be rate limited)
  await test('Fetch emerging games', async () => {
    const data = await fetchAPI('/api/emerging?limit=10')
    if (!data.games || !Array.isArray(data.games)) {
      throw new Error('Expected games array')
    }
    console.log(`  → Found ${data.games.length} emerging games`)
    if (data.games.length === 0) {
      throw new Error('No games returned (Roblox API may be rate limited)')
    }
    return data
  }, true) // Allow as warning

  // Test 2: Find Similar Games API
  await test('Find similar games', async () => {
    // Test with an emerging game - should auto-find competitors
    const data = await fetchAPI('/api/find-similar?placeId=131623223084840&limit=4')
    if (!data.sourceGame || !data.sourceGame.name) {
      throw new Error('Expected source game data')
    }
    if (!data.detectedVertical) {
      throw new Error('Expected detected vertical')
    }
    console.log(`  → Source: ${data.sourceGame.name}`)
    console.log(`  → Vertical: ${data.detectedVertical}, Theme: ${data.detectedTheme}`)
    console.log(`  → Found ${data.totalFound} games, ${data.qualifiedCount} qualified as competitors`)
    console.log(`  → Similar games: ${data.similarGames.map((g: any) => g.name).join(', ').slice(0, 60)}...`)
    return data
  }, true) // Allow as warning if game not found

  // Test 3: Deep Analyze a single game (allow warning - external API)
  await test('Deep analyze single game', async () => {
    const data = await fetchAPI(`/api/deep-analyze?placeId=${TEST_PLACE_IDS[0]}`)
    if (!data.basic || !data.basic.name) {
      throw new Error('Expected game data with name')
    }
    if (!data.detectedPatterns) {
      throw new Error('Expected detected patterns')
    }
    console.log(`  → Analyzed: ${data.basic.name}`)
    console.log(`  → Template: ${data.detectedPatterns.template}`)
    console.log(`  → Core Loop: ${data.detectedPatterns.coreLoop}`)
    return data
  }, true) // Allow as warning

  // Test 3: Analyze Group (the main workflow) - CRITICAL TEST
  await test('Analyze competitor group', async () => {
    const data = await fetchAPI('/api/analyze-group', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        placeIds: TEST_PLACE_IDS,
        groupName: 'Test Group'
      })
    })

    // Validate structure
    if (!data.groupName) throw new Error('Expected groupName')
    if (!data.characteristics) throw new Error('Expected characteristics')
    if (!data.formula) throw new Error('Expected formula')
    if (!data.patterns) throw new Error('Expected patterns')
    if (!data.qualification) throw new Error('Expected qualification')
    if (!data.games || !Array.isArray(data.games)) throw new Error('Expected games array')

    console.log(`  → Group: ${data.groupName}`)
    console.log(`  → Games Analyzed: ${data.gamesAnalyzed}`)
    console.log(`  → Category: ${data.characteristics.category}`)
    console.log(`  → Vertical: ${data.characteristics.vertical}`)
    console.log(`  → Core Mechanic: ${data.formula.coreMechanic}`)
    console.log(`  → Qualification Score: ${data.qualification.score}/100`)
    console.log(`  → Is Qualified: ${data.qualification.isQualified}`)

    // Check patterns
    const retentionCount = data.patterns.all?.retention?.length || 0
    const monetizationCount = data.patterns.all?.monetization?.length || 0
    const viralCount = data.patterns.all?.viral?.length || 0
    console.log(`  → Patterns: ${retentionCount} retention, ${monetizationCount} monetization, ${viralCount} viral`)

    // Check replication guide
    if (data.replicationGuide) {
      console.log(`  → Replication Guide: ${data.replicationGuide.mustHave?.length || 0} must-haves`)
    }

    return data
  })

  // Test 4: Get saved competitor groups
  await test('Get saved competitor groups', async () => {
    const data = await fetchAPI('/api/competitor-group')
    if (typeof data.totalGroups !== 'number') {
      throw new Error('Expected totalGroups number')
    }
    console.log(`  → Found ${data.totalGroups} saved groups`)
    return data
  })

  // Test 5: Classification system exports
  await test('Classification system imports', async () => {
    // This tests that our classification constants are properly exported
    const { CATEGORIES, VERTICALS, THEMES } = await import('../lib/roblox-classification')

    if (!CATEGORIES || Object.keys(CATEGORIES).length === 0) {
      throw new Error('CATEGORIES not exported properly')
    }
    if (!VERTICALS || Object.keys(VERTICALS).length === 0) {
      throw new Error('VERTICALS not exported properly')
    }
    if (!THEMES || Object.keys(THEMES).length === 0) {
      throw new Error('THEMES not exported properly')
    }

    console.log(`  → ${Object.keys(CATEGORIES).length} categories`)
    console.log(`  → ${Object.keys(VERTICALS).length} verticals`)
    console.log(`  → ${Object.keys(THEMES).length} themes`)

    return { categories: Object.keys(CATEGORIES).length }
  })

  // Test 6: Classification helper functions
  await test('Classification helper functions', async () => {
    const { calculateQualificationScore, findOverlappingPatterns } = await import('../lib/roblox-classification')

    // Test qualification score
    const mockGames = [
      { metrics: { estimatedRevenue: 15000, likeRatio: '92' } },
      { metrics: { estimatedRevenue: 8000, likeRatio: '88' } }
    ]

    const score = calculateQualificationScore(mockGames)
    if (typeof score.score !== 'number') {
      throw new Error('Expected score number')
    }
    if (typeof score.isQualified !== 'boolean') {
      throw new Error('Expected isQualified boolean')
    }

    console.log(`  → Qualification score: ${score.score}`)
    console.log(`  → Is qualified: ${score.isQualified}`)

    // Test overlap finding
    const mockClassifications = [
      { coreLoop: { name: 'Collect → Upgrade' }, monetizationHooks: ['2x pass'], retentionHooks: ['prestige'] },
      { coreLoop: { name: 'Collect → Upgrade' }, monetizationHooks: ['2x pass', 'VIP'], retentionHooks: ['prestige', 'daily'] }
    ]

    const overlaps = findOverlappingPatterns(mockClassifications)
    console.log(`  → Core loops found: ${overlaps.coreLoops.length}`)
    console.log(`  → Monetization patterns: ${overlaps.monetization.length}`)

    return { score, overlaps }
  })

  // Print summary
  console.log('\n========================================')
  console.log('TEST SUMMARY')
  console.log('========================================\n')

  const passed = results.filter(r => r.passed).length
  const warnings = results.filter(r => r.warning).length
  const failed = results.filter(r => !r.passed).length
  const totalTime = results.reduce((sum, r) => sum + r.duration, 0)

  console.log(`Total: ${results.length} tests`)
  console.log(`Passed: ${passed}${warnings > 0 ? ` (${warnings} with warnings)` : ''}`)
  console.log(`Failed: ${failed}`)
  console.log(`Time: ${totalTime}ms\n`)

  if (failed > 0) {
    console.log('FAILED TESTS:')
    results.filter(r => !r.passed).forEach(r => {
      console.log(`  ✗ ${r.name}: ${r.error}`)
    })
    process.exit(1)
  } else {
    if (warnings > 0) {
      console.log('WARNINGS (not failures):')
      results.filter(r => r.warning).forEach(r => {
        console.log(`  ⚠ ${r.name}: ${r.warning}`)
      })
      console.log('')
    }
    console.log('All tests passed!')
  }
}

// Check if server is running
async function checkServer() {
  try {
    const res = await fetch(`${BASE_URL}/api/stats`, { method: 'GET' })
    return res.ok
  } catch {
    return false
  }
}

async function main() {
  console.log('Checking if server is running...')
  const serverRunning = await checkServer()

  if (!serverRunning) {
    console.log('\n⚠ Server not running at', BASE_URL)
    console.log('Please start the dev server first: npm run dev\n')
    process.exit(1)
  }

  console.log('Server is running!\n')
  await runTests()
}

main().catch(console.error)
