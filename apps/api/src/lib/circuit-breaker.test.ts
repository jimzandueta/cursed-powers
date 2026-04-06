import { describe, it, expect, vi, beforeEach } from "vitest";
import { CircuitBreaker } from "./circuit-breaker.js";

const logger = {
  info: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

function createBreaker(overrides = {}) {
  return new CircuitBreaker({
    name: "test",
    failureThreshold: 3,
    cooldownMs: 1000,
    ...overrides,
  });
}

describe("CircuitBreaker", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("starts in CLOSED state", () => {
    const cb = createBreaker();
    expect(cb.getMetrics().state).toBe("CLOSED");
  });

  it("tracks successful requests", async () => {
    const cb = createBreaker();
    const result = await cb.execute(() => Promise.resolve("ok"), logger);
    expect(result).toBe("ok");

    const m = cb.getMetrics();
    expect(m.totalRequests).toBe(1);
    expect(m.totalSuccesses).toBe(1);
    expect(m.totalFailures).toBe(0);
    expect(m.consecutiveFailures).toBe(0);
    expect(m.lastSuccessTime).not.toBeNull();
  });

  it("tracks failed requests", async () => {
    const cb = createBreaker();
    await expect(
      cb.execute(() => Promise.reject(new Error("fail")), logger),
    ).rejects.toThrow("fail");

    const m = cb.getMetrics();
    expect(m.totalRequests).toBe(1);
    expect(m.totalFailures).toBe(1);
    expect(m.consecutiveFailures).toBe(1);
    expect(m.lastFailureTime).not.toBeNull();
  });

  it("opens circuit after reaching failure threshold", async () => {
    const cb = createBreaker({ failureThreshold: 2 });

    for (let i = 0; i < 2; i++) {
      await cb
        .execute(() => Promise.reject(new Error("fail")), logger)
        .catch(() => {});
    }

    expect(cb.getMetrics().state).toBe("OPEN");
  });

  it("fast-fails when circuit is OPEN", async () => {
    const cb = createBreaker({ failureThreshold: 1, cooldownMs: 60_000 });

    await cb
      .execute(() => Promise.reject(new Error("fail")), logger)
      .catch(() => {});

    expect(cb.getMetrics().state).toBe("OPEN");

    await expect(
      cb.execute(() => Promise.resolve("ok"), logger),
    ).rejects.toThrow("Circuit breaker [test] is OPEN");

    expect(logger.warn).toHaveBeenCalled();
  });

  it("transitions to HALF_OPEN after cooldown", async () => {
    const cb = createBreaker({ failureThreshold: 1, cooldownMs: 10 });

    await cb
      .execute(() => Promise.reject(new Error("fail")), logger)
      .catch(() => {});
    expect(cb.getMetrics().state).toBe("OPEN");

    await new Promise((r) => setTimeout(r, 20));

    const result = await cb.execute(() => Promise.resolve("ok"), logger);
    expect(result).toBe("ok");
    expect(cb.getMetrics().state).toBe("CLOSED");
  });

  it("returns to OPEN from HALF_OPEN on failure", async () => {
    const cb = createBreaker({ failureThreshold: 1, cooldownMs: 10 });

    await cb
      .execute(() => Promise.reject(new Error("fail")), logger)
      .catch(() => {});

    await new Promise((r) => setTimeout(r, 20));

    await expect(
      cb.execute(() => Promise.reject(new Error("fail again")), logger),
    ).rejects.toThrow("fail again");

    expect(cb.getMetrics().state).toBe("OPEN");
  });

  it("resets consecutive failures on success", async () => {
    const cb = createBreaker({ failureThreshold: 3 });

    await cb
      .execute(() => Promise.reject(new Error("fail")), logger)
      .catch(() => {});
    await cb
      .execute(() => Promise.reject(new Error("fail")), logger)
      .catch(() => {});
    expect(cb.getMetrics().consecutiveFailures).toBe(2);

    await cb.execute(() => Promise.resolve("ok"), logger);
    expect(cb.getMetrics().consecutiveFailures).toBe(0);
  });

  it("logs state transitions", async () => {
    const cb = createBreaker({ failureThreshold: 1 });

    await cb
      .execute(() => Promise.reject(new Error("fail")), logger)
      .catch(() => {});

    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        circuit: "test",
        from: "CLOSED",
        to: "OPEN",
      }),
      expect.stringContaining("CLOSED → OPEN"),
    );
  });

  it("getMetrics returns complete metrics object", () => {
    const cb = createBreaker();
    const m = cb.getMetrics();

    expect(m).toEqual({
      state: "CLOSED",
      consecutiveFailures: 0,
      totalRequests: 0,
      totalFailures: 0,
      totalSuccesses: 0,
      lastFailureTime: null,
      lastSuccessTime: null,
      stateChangedAt: expect.any(Number),
    });
  });
});

describe("singleton circuit breakers", () => {
  it("exports geminiCircuitBreaker", async () => {
    const { geminiCircuitBreaker } = await import("./circuit-breaker.js");
    expect(geminiCircuitBreaker).toBeInstanceOf(CircuitBreaker);
    expect(geminiCircuitBreaker.getMetrics().state).toBe("CLOSED");
  });

  it("exports openaiCircuitBreaker", async () => {
    const { openaiCircuitBreaker } = await import("./circuit-breaker.js");
    expect(openaiCircuitBreaker).toBeInstanceOf(CircuitBreaker);
    expect(openaiCircuitBreaker.getMetrics().state).toBe("CLOSED");
  });
});
