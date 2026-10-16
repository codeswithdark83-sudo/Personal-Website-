// Fixed-window in-memory limiter. LIMITATION: state is per server instance, so on serverless hosting it only
// slows bursts hitting one instance. For strong guarantees add a shared store (e.g. Upstash Redis) or Vercel's
// WAF rate limiting — documented in the README.
const hits = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): { allowed: boolean; retryAfterSec: number } {
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
  const entry = hits.get(key);
  if (!entry || entry.reset <= now) { hits.set(key, { count: 1, reset: now + windowMs }); return { allowed: true, retryAfterSec: 0 }; }
  entry.count += 1;
  return entry.count <= limit ? { allowed: true, retryAfterSec: 0 } : { allowed: false, retryAfterSec: Math.ceil((entry.reset - now) / 1000) };
}

export function clientIp(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown";
}
