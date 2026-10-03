// 簡易レート制限（サーバーのプロセスごと）。本番で複数台に広げる場合は Upstash などに置き換える
const buckets = new Map<string, { n: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.reset < now) buckets.delete(k);
    return true;
  }
  b.n += 1;
  return b.n <= limit;
}

export const clientIp = (h: Headers) => h.get("x-forwarded-for")?.split(",")[0].trim() || h.get("x-real-ip") || "unknown";
