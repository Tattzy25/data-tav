const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function checkRateLimit(identifier: string, limit = 10, windowMs = 60000): boolean {
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

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  return forwarded ? forwarded.split(",")[0] : "unknown"
}
