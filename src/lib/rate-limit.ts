// Simple in-memory rate limiter for demo purposes
// In production, use Redis or a proper rate limiting service

interface RateLimit {
  count: number;
  resetTime: number;
}

const rateLimits = new Map<string, RateLimit>();

export interface RateLimitConfig {
  max: number;
  windowMs: number;
}

export const defaultLimits = {
  post: { max: 10, windowMs: 15 * 60 * 1000 }, // 10 posts per 15 minutes
  comment: { max: 20, windowMs: 15 * 60 * 1000 }, // 20 comments per 15 minutes
  profileComment: { max: 5, windowMs: 60 * 60 * 1000 }, // 5 profile comments per hour
  friendship: { max: 10, windowMs: 60 * 60 * 1000 }, // 10 friend requests per hour
  general: { max: 100, windowMs: 15 * 60 * 1000 }, // 100 general actions per 15 minutes
};

export function rateLimit(
  identifier: string, 
  config: RateLimitConfig = defaultLimits.general
): { success: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const key = identifier;
  
  // Clean up expired entries periodically
  if (Math.random() < 0.01) {
    for (const [k, limit] of rateLimits.entries()) {
      if (now > limit.resetTime) {
        rateLimits.delete(k);
      }
    }
  }
  
  const existing = rateLimits.get(key);
  
  if (!existing || now > existing.resetTime) {
    // Create new or reset expired limit
    const resetTime = now + config.windowMs;
    rateLimits.set(key, { count: 1, resetTime });
    return { success: true, remaining: config.max - 1, resetTime };
  }
  
  if (existing.count >= config.max) {
    return { success: false, remaining: 0, resetTime: existing.resetTime };
  }
  
  existing.count++;
  return { success: true, remaining: config.max - existing.count, resetTime: existing.resetTime };
}

export function createRateLimiter(userId: string, ip: string, action: keyof typeof defaultLimits) {
  const config = defaultLimits[action];
  
  // Check both user and IP based limits
  const userLimit = rateLimit(`user:${userId}:${action}`, config);
  const ipLimit = rateLimit(`ip:${ip}:${action}`, config);
  
  return {
    success: userLimit.success && ipLimit.success,
    remaining: Math.min(userLimit.remaining, ipLimit.remaining),
    resetTime: Math.max(userLimit.resetTime, ipLimit.resetTime),
    limitedBy: !userLimit.success ? 'user' : !ipLimit.success ? 'ip' : null
  };
}