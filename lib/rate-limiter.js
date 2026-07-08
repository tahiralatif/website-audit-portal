// In-memory rate limiter — 5 requests per 10 minutes per key.

const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_REQUESTS = 5;

// Map<key, { count, resetAt }>
const buckets = new Map();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (now > bucket.resetAt) {
      buckets.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Check rate limit for a given key.
 * @param {string} key - e.g. "user:1" or "ip:127.0.0.1"
 * @returns {{ allowed: boolean, retryAfterMs?: number }}
 */
export function checkRateLimit(key) {
  const now = Date.now();
  let bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    bucket = { count: 1, resetAt: now + WINDOW_MS };
    buckets.set(key, bucket);
    return { allowed: true };
  }

  bucket.count++;

  if (bucket.count > MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterMs: bucket.resetAt - now,
    };
  }

  return { allowed: true };
}
