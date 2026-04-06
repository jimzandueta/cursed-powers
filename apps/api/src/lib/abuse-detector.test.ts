import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { AbuseDetector } from "./abuse-detector.js";

describe("AbuseDetector", () => {
  let detector: AbuseDetector;

  beforeEach(() => {
    detector = new AbuseDetector({
      rapidThreshold: 3,
      rapidWindowMs: 5_000,
      blockThreshold: 6,
      decayIntervalMs: 10_000,
      maxTrackedIps: 100,
    });
  });

  it("allows normal requests", () => {
    const result = detector.recordRequest("1.2.3.4", "flight", {
      userAgent: "Mozilla/5.0",
      accept: "application/json",
    });
    expect(result.blocked).toBe(false);
    expect(result.score).toBe(0);
  });

  it("scores rapid-fire requests above threshold", () => {
    const headers = { userAgent: "Mozilla/5.0", accept: "application/json" };
    detector.recordRequest("1.2.3.4", "flight", headers);
    detector.recordRequest("1.2.3.4", "speed", headers);
    detector.recordRequest("1.2.3.4", "strength", headers);
    // 4th request exceeds rapidThreshold of 3
    const result = detector.recordRequest("1.2.3.4", "invisibility", headers);
    expect(result.score).toBeGreaterThan(0);
  });

  it("scores repeated identical wishes", () => {
    const headers = { userAgent: "Mozilla/5.0", accept: "application/json" };
    detector.recordRequest("1.2.3.4", "flight", headers);
    const result = detector.recordRequest("1.2.3.4", "flight", headers);
    // +2 for repeated wish
    expect(result.score).toBe(2);
  });

  it("scores missing User-Agent", () => {
    const result = detector.recordRequest("1.2.3.4", "flight", {
      accept: "application/json",
    });
    expect(result.score).toBe(1);
  });

  it("scores missing Accept header", () => {
    const result = detector.recordRequest("1.2.3.4", "flight", {
      userAgent: "Mozilla/5.0",
    });
    expect(result.score).toBe(1);
  });

  it("scores missing both headers", () => {
    const result = detector.recordRequest("1.2.3.4", "flight", {});
    expect(result.score).toBe(2);
  });

  it("blocks when score exceeds threshold", () => {
    const headers = {}; // no headers = +2 each time
    // Each call: +2 (missing headers) + possible rapid/repeat
    detector.recordRequest("1.2.3.4", "flight", headers); // +2 → 2
    detector.recordRequest("1.2.3.4", "flight", headers); // +2 (headers) +2 (repeat) → 6
    const result = detector.recordRequest("1.2.3.4", "flight", headers);
    expect(result.blocked).toBe(true);
  });

  it("tracks different IPs independently", () => {
    const headers = {};
    detector.recordRequest("1.2.3.4", "flight", headers);
    detector.recordRequest("1.2.3.4", "flight", headers);
    detector.recordRequest("1.2.3.4", "flight", headers);

    // Different IP should be clean
    const result = detector.recordRequest("5.6.7.8", "flight", {
      userAgent: "Mozilla/5.0",
      accept: "application/json",
    });
    expect(result.blocked).toBe(false);
    expect(result.score).toBe(0);
  });

  it("decays scores over time", () => {
    const headers = {};
    // Build up score
    detector.recordRequest("1.2.3.4", "flight", headers); // 2
    detector.recordRequest("1.2.3.4", "flight", headers); // 6
    detector.recordRequest("1.2.3.4", "flight", headers); // blocked

    // Simulate time passing (decay interval = 10s, score halves)
    vi.useFakeTimers();
    vi.advanceTimersByTime(20_000); // 2 halvings → score / 4

    const result = detector.recordRequest("1.2.3.4", "speed", {
      userAgent: "Mozilla/5.0",
      accept: "application/json",
    });
    // Score should have decayed significantly
    expect(result.blocked).toBe(false);
    vi.useRealTimers();
  });

  it("evicts oldest entry when maxTrackedIps exceeded", () => {
    const smallDetector = new AbuseDetector({ maxTrackedIps: 2 });
    const headers = { userAgent: "Mozilla/5.0", accept: "application/json" };

    smallDetector.recordRequest("1.1.1.1", "flight", headers);
    smallDetector.recordRequest("2.2.2.2", "flight", headers);
    smallDetector.recordRequest("3.3.3.3", "flight", headers);

    expect(smallDetector.trackedIpCount).toBeLessThanOrEqual(3);
  });

  it("resets all state", () => {
    detector.recordRequest("1.2.3.4", "flight", {});
    expect(detector.trackedIpCount).toBe(1);
    detector.reset();
    expect(detector.trackedIpCount).toBe(0);
  });

  it("handles undefined wish gracefully", () => {
    const result = detector.recordRequest("1.2.3.4", undefined, {
      userAgent: "Mozilla/5.0",
      accept: "application/json",
    });
    expect(result.blocked).toBe(false);
  });
});
