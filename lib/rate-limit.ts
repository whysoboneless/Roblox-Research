/**
 * RATE LIMITING MIDDLEWARE
 * Production-ready rate limiting for API routes
 * Uses in-memory for Next.js serverless (with Vercel KV upgrade path)
 */

import { NextResponse } from 'next/server'

// Rate limit configuration per endpoint type
export const RATE_LIMITS = {
  // AI endpoints - expensive, limit strictly
  ai: { windowMs: 60000, maxRequests: 10 },        // 10 per minute
  'analyze-group': { windowMs: 60000, maxRequests: 5 }, // 5 per minute (expensive)

  // Roblox API endpoints - external calls
  emerging: { windowMs: 60000, maxRequests: 30 },   // 30 per minute
  'find-similar': { windowMs: 60000, maxRequests: 20 }, // 20 per minute

  // Database endpoints - moderate
  default: { windowMs: 60000, maxRequests: 60 },    // 60 per minute
}

// In-memory store (works for Vercel serverless with caveats)
// For true production at scale, upgrade to Vercel KV or Upstash Redis
const requestCounts = new Map<string, { count: number; resetAt: number }>()

// Cleanup old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of requestCounts.entries()) {
      if (now > value.resetAt) {
        requestCounts.delete(key)
      }
    }
  }, 300000)
}

export function getClientIdentifier(request: Request): string {
  // Get IP from various headers (Vercel, Cloudflare, etc.)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfIp = request.headers.get('cf-connecting-ip')

  // Use first IP from forwarded chain, or fallback
  const ip = forwarded?.split(',')[0]?.trim() || realIp || cfIp || 'unknown'

  return ip
}

export function checkRateLimit(
  identifier: string,
  endpoint: keyof typeof RATE_LIMITS = 'default'
): { allowed: boolean; remaining: number; resetIn: number } {
  const config = RATE_LIMITS[endpoint] || RATE_LIMITS.default
  const now = Date.now()
  const key = `${identifier}:${endpoint}`

  let record = requestCounts.get(key)

  // Create new record if doesn't exist or window has passed
  if (!record || now > record.resetAt) {
    record = { count: 0, resetAt: now + config.windowMs }
    requestCounts.set(key, record)
  }

  record.count++

  const allowed = record.count <= config.maxRequests
  const remaining = Math.max(0, config.maxRequests - record.count)
  const resetIn = Math.max(0, record.resetAt - now)

  return { allowed, remaining, resetIn }
}

export function rateLimitResponse(resetIn: number): NextResponse {
  return NextResponse.json(
    {
      error: 'Too many requests. Please wait before trying again.',
      retryAfter: Math.ceil(resetIn / 1000)
    },
    {
      status: 429,
      headers: {
        'Retry-After': Math.ceil(resetIn / 1000).toString(),
        'X-RateLimit-Reset': new Date(Date.now() + resetIn).toISOString()
      }
    }
  )
}

/**
 * Rate limit wrapper for API route handlers
 * Usage:
 *   export const GET = withRateLimit(handler, 'emerging')
 */
export function withRateLimit<T extends (...args: any[]) => Promise<NextResponse>>(
  handler: T,
  endpoint: keyof typeof RATE_LIMITS = 'default'
): T {
  return (async (request: Request, ...args: any[]) => {
    const identifier = getClientIdentifier(request)
    const { allowed, remaining, resetIn } = checkRateLimit(identifier, endpoint)

    if (!allowed) {
      return rateLimitResponse(resetIn)
    }

    const response = await handler(request, ...args)

    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Remaining', remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(Date.now() + resetIn).toISOString())

    return response
  }) as T
}
