/* A small sliding-window limiter, kept apart from the route so it can be unit tested.
   Only requests that are let through are counted. If refused ones counted too, a busy shared address (a class on
   one school network) would keep its own window full and stay locked out. */
export function createLimiter(limit: number, windowMs: number, maxKeys = 5000) {
  const hits = new Map<string, number[]>();
  /** True when this request is over the limit. `now` is a parameter so tests can move the clock. */
  return function limited(key: string, now: number = Date.now()): boolean {
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= limit) {
      hits.set(key, recent);
      return true;
    }
    if (hits.size >= maxKeys && !hits.has(key)) hits.clear();
    recent.push(now);
    hits.set(key, recent);
    return false;
  };
}
