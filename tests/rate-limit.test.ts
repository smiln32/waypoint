import { beforeEach, describe, expect, it } from "vitest";
import { clientKey, rateLimit, resetRateLimits } from "../lib/rate-limit";

describe("rateLimit", () => {
  beforeEach(() => resetRateLimits());

  it("allows requests up to the limit, then blocks", () => {
    const t0 = 1_000_000;
    for (let i = 0; i < 3; i++) {
      expect(rateLimit("ip-a", 3, 60_000, t0).ok).toBe(true);
    }
    const blocked = rateLimit("ip-a", 3, 60_000, t0);
    expect(blocked.ok).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("reports decreasing remaining allowance", () => {
    const t0 = 2_000_000;
    expect(rateLimit("ip-b", 3, 60_000, t0).remaining).toBe(2);
    expect(rateLimit("ip-b", 3, 60_000, t0).remaining).toBe(1);
    expect(rateLimit("ip-b", 3, 60_000, t0).remaining).toBe(0);
  });

  it("resets after the window elapses", () => {
    const t0 = 3_000_000;
    for (let i = 0; i < 3; i++) rateLimit("ip-c", 3, 60_000, t0);
    expect(rateLimit("ip-c", 3, 60_000, t0).ok).toBe(false);
    // One millisecond past the window boundary the bucket is fresh again.
    expect(rateLimit("ip-c", 3, 60_000, t0 + 60_001).ok).toBe(true);
  });

  it("tracks each key independently", () => {
    const t0 = 4_000_000;
    for (let i = 0; i < 3; i++) rateLimit("ip-d", 3, 60_000, t0);
    expect(rateLimit("ip-d", 3, 60_000, t0).ok).toBe(false);
    expect(rateLimit("ip-e", 3, 60_000, t0).ok).toBe(true);
  });
});

describe("clientKey", () => {
  it("uses the first x-forwarded-for hop", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
    });
    expect(clientKey(request)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip, then to a stable sentinel", () => {
    expect(clientKey(new Request("https://example.com", { headers: { "x-real-ip": "198.51.100.4" } }))).toBe("198.51.100.4");
    expect(clientKey(new Request("https://example.com"))).toBe("unknown");
  });
});
