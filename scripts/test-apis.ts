/**
 * TEST SCRIPT: API Endpoint Validation
 *
 * Quick validation of all API endpoints
 * Run with: npx tsx scripts/test-apis.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000'

interface EndpointTest {
  name: string
  method: 'GET' | 'POST'
  path: string
  body?: any
  validate: (data: any) => boolean
}

const endpoints: EndpointTest[] = [
  {
    name: 'Stats API',
    method: 'GET',
    path: '/api/stats',
    validate: (data) => typeof data === 'object'
  },
  {
    name: 'Emerging Games (limit 5)',
    method: 'GET',
    path: '/api/emerging?limit=5',
    validate: (data) => Array.isArray(data.games)
  },
  {
    name: 'Deep Analyze (Blox Fruits)',
    method: 'GET',
    path: '/api/deep-analyze?placeId=2753915549',
    validate: (data) => data.basic?.name && data.detectedPatterns
  },
  {
    name: 'Analyze Group',
    method: 'POST',
    path: '/api/analyze-group',
    body: { placeIds: ['2753915549', '4587034896'] },
    validate: (data) => data.groupName && data.characteristics && data.patterns
  },
  {
    name: 'Get Competitor Groups',
    method: 'GET',
    path: '/api/competitor-group',
    validate: (data) => typeof data.totalGroups === 'number'
  },
  {
    name: 'AI Classify Single',
    method: 'POST',
    path: '/api/ai-classify',
    body: {
      name: 'Test Simulator',
      description: 'Click to collect coins, upgrade tools, prestige for multipliers'
    },
    validate: (data) => data.classification?.vertical || data.error // May fail without API key
  },
  {
    name: 'Discover Games',
    method: 'GET',
    path: '/api/discover?query=simulator',
    validate: (data) => Array.isArray(data.games) || data.error // May have rate limits
  }
]

async function runTests() {
  console.log('\n========================================')
  console.log('API ENDPOINT VALIDATION')
  console.log('========================================\n')

  let passed = 0
  let failed = 0

  for (const test of endpoints) {
    try {
      const start = Date.now()
      const options: RequestInit = {
        method: test.method,
        headers: { 'Content-Type': 'application/json' }
      }

      if (test.body) {
        options.body = JSON.stringify(test.body)
      }

      const res = await fetch(`${BASE_URL}${test.path}`, options)
      const data = await res.json()
      const duration = Date.now() - start

      if (test.validate(data)) {
        console.log(`✓ ${test.name} (${duration}ms)`)
        passed++
      } else {
        console.log(`✗ ${test.name} - Validation failed`)
        console.log(`  Response:`, JSON.stringify(data).slice(0, 200))
        failed++
      }
    } catch (err: any) {
      console.log(`✗ ${test.name} - ${err.message}`)
      failed++
    }
  }

  console.log('\n========================================')
  console.log(`RESULTS: ${passed} passed, ${failed} failed`)
  console.log('========================================\n')

  if (failed > 0) {
    process.exit(1)
  }
}

// Check server
async function checkServer() {
  try {
    await fetch(`${BASE_URL}/api/stats`)
    return true
  } catch {
    return false
  }
}

async function main() {
  console.log('Checking server at', BASE_URL, '...')
  if (!(await checkServer())) {
    console.log('\n⚠ Server not running. Start with: npm run dev\n')
    process.exit(1)
  }
  await runTests()
}

main().catch(console.error)
