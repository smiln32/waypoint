/**
 * Minimal in-memory fixed-window rate limiter for the cost-incurring API routes.
 *
 * No external store, so on serverless this is PER-INSTANCE and best-effort: the
 * window resets on cold start and is not shared across concurrently running
 * instances. It is a first throttle against a naive abuse loop, not a hard
 * distributed guarantee. When a cross-instance limit is required, swap the
 * implementation of `rateLimit` for `@upstash/ratelimit` backed by Vercel KV /
 * Upstash Redis — the call sites and return shape stay the same.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

/**
 * Record one hit against `key` and report whether it is within `limit` per
 * `windowMs`. Uses the caller-supplied `now` (defaults to `Date.now()`) so the
 * window is deterministically testable.
 */
export function rateLimit(key: string, limit: number, windowMs: number, now: number = Date.now()): RateLimitResult {
  // Opportunistically prune expired buckets so the map cannot grow without bound.
  if (buckets.size > 5000) {
    for (const [existingKey, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(existingKey);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }
  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }
  bucket.count += 1;
  return { ok: true, remaining: limit - bucket.count, retryAfterSeconds: 0 };
}

/** Best-effort client identity from the proxy headers Vercel sets. */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return (
    forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    "unknown"
  );
}

/** Test-only: clear all recorded windows. */
export function resetRateLimits(): void {
  buckets.clear();
}
