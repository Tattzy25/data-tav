const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

// Cleanup old entries every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL = 5 * 60 * 1000 // 5 minutes
let lastCleanup = Date.now()

function cleanupExpiredEntries() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) {
    return
  }

  lastCleanup = now
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key)
    }
  }
}

/**
 * Check if request is within rate limits
 * @param identifier - Unique identifier (usually IP address)
 * @param limit - Maximum requests allowed in window (default: 10)
 * @param windowMs - Time window in milliseconds (default: 60000 = 1 minute)
 * @returns true if request is allowed, false if rate limited
 */
export function checkRateLimit(identifier: string, limit = 10, windowMs = 60000): boolean {
  // Periodically cleanup old entries
  cleanupExpiredEntries()

  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(identifier, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (userLimit.count >= limit) {
    return false
  }

  userLimit.count++
  return true
}

/**
 * Extract client IP address from request headers
 * Handles various proxy headers and fallback scenarios
 */
export function getClientIp(request: Request): string {
  // Try x-forwarded-for first (most common proxy header)
  const forwarded = request.headers.get("x-forwarded-for")
  if (forwarded) {
    // x-forwarded-for can contain multiple IPs, use the first (original client)
    const ip = forwarded.split(",")[0].trim()
    if (ip) return ip
  }

  // Try x-real-ip (used by some proxies)
  const realIp = request.headers.get("x-real-ip")
  if (realIp) return realIp.trim()

  // Try cf-connecting-ip (Cloudflare)
  const cfIp = request.headers.get("cf-connecting-ip")
  if (cfIp) return cfIp.trim()

  // Fallback to "unknown" if no IP found
  return "unknown"
}

/**
 * Get remaining requests for an identifier
 */
export function getRateLimitInfo(identifier: string, limit = 10): {
  remaining: number
  resetTime: number
  isLimited: boolean
} {
  const now = Date.now()
  const userLimit = rateLimitMap.get(identifier)

  if (!userLimit || now > userLimit.resetTime) {
    return {
      remaining: limit,
      resetTime: now + 60000,
      isLimited: false,
    }
  }

  return {
    remaining: Math.max(0, limit - userLimit.count),
    resetTime: userLimit.resetTime,
    isLimited: userLimit.count >= limit,
  }
}
