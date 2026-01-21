/**
 * ENVIRONMENT VARIABLE VALIDATION
 * Validates required env vars at build/runtime
 */

interface EnvConfig {
  SUPABASE_URL: string
  SUPABASE_ANON_KEY: string
  ANTHROPIC_API_KEY?: string // Optional - app works without AI features
}

// Required environment variables
const REQUIRED_VARS = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const

// Optional but recommended
const OPTIONAL_VARS = ['ANTHROPIC_API_KEY'] as const

export function validateEnv(): { valid: boolean; missing: string[]; warnings: string[] } {
  const missing: string[] = []
  const warnings: string[] = []

  // Check required vars
  for (const varName of REQUIRED_VARS) {
    if (!process.env[varName]) {
      missing.push(varName)
    }
  }

  // Check optional vars
  for (const varName of OPTIONAL_VARS) {
    if (!process.env[varName]) {
      warnings.push(`${varName} not set - some features may be limited`)
    }
  }

  return {
    valid: missing.length === 0,
    missing,
    warnings
  }
}

export function getEnv(): EnvConfig {
  return {
    SUPABASE_URL: process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
  }
}

// Check if AI features are available
export function hasAIFeatures(): boolean {
  return !!process.env.ANTHROPIC_API_KEY
}

// Log validation results on startup (for debugging)
if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
  const { valid, missing, warnings } = validateEnv()
  if (!valid) {
    console.error('❌ Missing required environment variables:', missing.join(', '))
  }
  if (warnings.length > 0) {
    console.warn('⚠️ Environment warnings:', warnings.join('; '))
  }
}
