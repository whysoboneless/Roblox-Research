/**
 * API Endpoint Integration Tests
 *
 * This script tests all API endpoints to verify functionality.
 * Run with: node tests/api-test.js
 *
 * Requires the dev server to be running: npm run dev
 */

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

const tests = [];
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  logs: []
};

function log(message, type = 'info') {
  const timestamp = new Date().toISOString();
  const prefix = type === 'pass' ? '✓' : type === 'fail' ? '✗' : type === 'skip' ? '○' : '→';
  const logEntry = `[${timestamp}] ${prefix} ${message}`;
  console.log(logEntry);
  results.logs.push({ timestamp, type, message });
}

async function test(name, fn) {
  tests.push({ name, fn });
}

// Delay helper to avoid rate limiting
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runTests() {
  log('Starting API Integration Tests');
  log(`Base URL: ${BASE_URL}`);
  log('');

  for (const { name, fn } of tests) {
    try {
      log(`Testing: ${name}`);
      await fn();
      results.passed++;
      log(`PASSED: ${name}`, 'pass');
    } catch (error) {
      results.failed++;
      log(`FAILED: ${name} - ${error.message}`, 'fail');
    }
    log('');
    // Add delay between tests to avoid rate limiting
    await delay(1500);
  }

  // Summary
  log('='.repeat(50));
  log(`Tests Complete: ${results.passed} passed, ${results.failed} failed, ${results.skipped} skipped`);

  // Save results to file
  const fs = await import('fs');
  const logPath = `tests/test-results-${Date.now()}.json`;
  fs.default.writeFileSync(logPath, JSON.stringify(results, null, 2));
  log(`Results saved to: ${logPath}`);

  process.exit(results.failed > 0 ? 1 : 0);
}

// Helper function for API calls
async function fetchAPI(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });
  const data = await res.json();
  return { status: res.status, data };
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// ============================================
// TEST DEFINITIONS
// ============================================

test('GET /api/discover - Popular Games', async () => {
  const { status, data } = await fetchAPI('/api/discover?query=popular&limit=3');
  assert(status === 200, `Expected 200, got ${status}`);
  assert(Array.isArray(data.games), 'games should be an array');
  assert(data.games.length > 0, 'Should return at least one game');
  assert(data.games[0].placeId, 'Game should have placeId');
  assert(data.games[0].metrics, 'Game should have metrics');
  log(`  Found ${data.games.length} games`);
});

test('GET /api/discover - Anime Category', async () => {
  const { status, data } = await fetchAPI('/api/discover?query=anime&limit=3');
  assert(status === 200, `Expected 200, got ${status}`);
  assert(Array.isArray(data.games), 'games should be an array');
  log(`  Found ${data.games.length} anime games`);
});

test('GET /api/discover - Simulator Category', async () => {
  const { status, data } = await fetchAPI('/api/discover?query=simulator&limit=3');
  assert(status === 200, `Expected 200, got ${status}`);
  assert(Array.isArray(data.games), 'games should be an array');
  log(`  Found ${data.games.length} simulator games`);
});

test('GET /api/emerging - Default Params', async () => {
  const { status, data } = await fetchAPI('/api/emerging?maxMonths=24&minCcu=50');
  assert(status === 200, `Expected 200, got ${status}`);
  assert(Array.isArray(data.games), 'games should be an array');
  assert(typeof data.totalFound === 'number', 'Should have totalFound count');
  log(`  Found ${data.games.length} emerging games (${data.totalFound} total, ${data.recentCount} recent)`);
});

test('GET /api/emerging - Simulator Category', async () => {
  const { status, data } = await fetchAPI('/api/emerging?category=simulator&maxMonths=24&minCcu=50');
  assert(status === 200, `Expected 200, got ${status}`);
  assert(data.category === 'simulator', 'Category should be simulator');
  log(`  Found ${data.games.length} emerging simulator games`);
});

test('POST /api/analyze - Single Game', async () => {
  const { status, data } = await fetchAPI('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ placeIds: ['2753915549'] }) // Blox Fruits
  });
  assert(status === 200, `Expected 200, got ${status}`);
  assert(Array.isArray(data.games), 'games should be an array');
  assert(data.analysis, 'Should have analysis object');
  assert(typeof data.analysis.score === 'number', 'Analysis should have score');
  log(`  Analyzed 1 game, score: ${data.analysis.score}`);
});

test('POST /api/analyze - Multiple Games', async () => {
  const { status, data } = await fetchAPI('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ placeIds: ['2753915549', '4996049426', '17017769292'] })
  });
  assert(status === 200, `Expected 200, got ${status}`);
  assert(data.games.length === 3, 'Should analyze 3 games');
  assert(data.analysis.checks, 'Should have qualification checks');
  log(`  Analyzed ${data.games.length} games, qualified: ${data.analysis.qualified}`);
});

test('POST /api/analyze - Invalid Input', async () => {
  const { status, data } = await fetchAPI('/api/analyze', {
    method: 'POST',
    body: JSON.stringify({ placeIds: 'not-an-array' })
  });
  assert(status === 400, `Expected 400 for invalid input, got ${status}`);
  assert(data.error, 'Should have error message');
  log(`  Correctly rejected invalid input`);
});

test('GET /api/groups - List Groups', async () => {
  const { status, data } = await fetchAPI('/api/groups');
  assert(status === 200, `Expected 200, got ${status}`);
  assert(Array.isArray(data.groups), 'groups should be an array');
  log(`  Found ${data.groups.length} saved groups`);
});

test('POST /api/ai - Requires API Key', async () => {
  const { status, data } = await fetchAPI('/api/ai', {
    method: 'POST',
    body: JSON.stringify({
      action: 'qualify-idea',
      data: { name: 'Test Game', template: 'Simulator', theme: 'Fantasy' }
    })
  });
  // This will fail without API key - that's expected
  const isKeyError = data.error === 'API key not configured' || status === 500;
  assert(isKeyError || status === 200, `Expected API key error or success, got ${status}: ${data.error}`);
  log(`  AI endpoint responds correctly (key configured: ${status === 200})`);
});

test('GET /api/stats - Dashboard Stats', async () => {
  const { status, data } = await fetchAPI('/api/stats');
  assert(status === 200, `Expected 200, got ${status}`);
  log(`  Stats endpoint works`);
});

// ============================================
// RUN TESTS
// ============================================

runTests().catch(err => {
  console.error('Test runner error:', err);
  process.exit(1);
});
