// Simple in-memory rate limiting for demo purposes
// In production, use Redis or a proper rate limiting service

const userLimits = new Map<string, { count: number; resetTime: number }>();
const ipLimits = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_USER = 30;
const MAX_REQUESTS_PER_IP = 100;

function cleanupExpired(limits: Map<string, { count: number; resetTime: number }>) {
  const now = Date.now();
  for (const [key, limit] of limits.entries()) {
    if (now > limit.resetTime) {
      limits.delete(key);
    }
  }
}

export function checkRateLimit(userId: string | null, ip: string): boolean {
  const now = Date.now();
  
  // Clean up expired entries
  cleanupExpired(userLimits);
  cleanupExpired(ipLimits);
  
  // Check user rate limit
  if (userId) {
    const userLimit = userLimits.get(userId);
    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= MAX_REQUESTS_PER_USER) {
          return false;
        }
        userLimit.count++;
      } else {
        userLimits.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
      }
    } else {
      userLimits.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }
  }
  
  // Check IP rate limit
  const ipLimit = ipLimits.get(ip);
  if (ipLimit) {
    if (now < ipLimit.resetTime) {
      if (ipLimit.count >= MAX_REQUESTS_PER_IP) {
        return false;
      }
      ipLimit.count++;
    } else {
      ipLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    }
  } else {
    ipLimits.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
  }
  
  return true;
}