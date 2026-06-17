import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };

const store = new Map<string, Bucket>();

/**
 * Rate limiter en mémoire (par instance serverless — non distribué).
 * Pour un usage à grande échelle, migrer vers Upstash Redis.
 */
export function rateLimit(key: string, maxHits: number, windowMs: number) {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || now > bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: maxHits - 1, resetAt: now + windowMs };
  }

  if (bucket.count >= maxHits) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt };
  }

  bucket.count += 1;
  return { ok: true, remaining: maxHits - bucket.count, resetAt: bucket.resetAt };
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}
