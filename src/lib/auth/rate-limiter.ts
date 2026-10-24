// In-memory sliding window rate limiter for sensitive authentication endpoints
interface RateLimitRecord {
  count: number;
  resetAt: number;
}

const memoryStore = new Map<string, RateLimitRecord>();

export function checkRateLimit(
  identifier: string,
  limit: number = 5,
  windowSeconds: number = 60
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = memoryStore.get(identifier);

  if (!existing || existing.resetAt < now) {
    const record: RateLimitRecord = {
      count: 1,
      resetAt: now + windowSeconds * 1000,
    };
    memoryStore.set(identifier, record);
    return {
      success: true,
      remaining: limit - 1,
      resetAt: record.resetAt,
    };
  }

  if (existing.count >= limit) {
    return {
      success: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  return {
    success: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}
