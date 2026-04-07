import { describe, it, expect, vi, afterEach } from "vitest";
import { verifyRequestSignature } from "./hmac.js";
import { createHmac, createHash } from "node:crypto";

function makeSignature(
  method: string,
  path: string,
  body: string | undefined,
  timestamp: string,
  secret: string,
): string {
  const bodyHash = body
    ? createHash("sha256").update(body).digest("hex")
    : "";
  const message = `${timestamp}.${method.toUpperCase()}.${path}.${bodyHash}`;
  return createHmac("sha256", secret).update(message).digest("hex");
}

describe("verifyRequestSignature", () => {
  const secret = "test-secret-key";

  afterEach(() => {
    vi.useRealTimers();
  });

  it("accepts a valid signature", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
    const now = Math.floor(Date.now() / 1000).toString();
    const body = '{"wish":"flight"}';
    const sig = makeSignature("POST", "/api/v1/wishes", body, now, secret);

    const result = verifyRequestSignature(
      "POST",
      "/api/v1/wishes",
      body,
      now,
      sig,
      secret,
    );
    expect(result.valid).toBe(true);
  });

  it("rejects missing timestamp", () => {
    const result = verifyRequestSignature(
      "POST",
      "/api/v1/wishes",
      "{}",
      undefined,
      "somesig",
      secret,
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Missing signature headers");
  });

  it("rejects missing signature", () => {
    const result = verifyRequestSignature(
      "POST",
      "/api/v1/wishes",
      "{}",
      "12345",
      undefined,
      secret,
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Missing signature headers");
  });

  it("rejects invalid timestamp format", () => {
    const result = verifyRequestSignature(
      "POST",
      "/api/v1/wishes",
      "{}",
      "not-a-number",
      "somesig",
      secret,
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Invalid timestamp");
  });

  it("rejects expired requests (>30s old)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
    // Timestamp from 60 seconds ago
    const oldTs = (Math.floor(Date.now() / 1000) - 60).toString();
    const body = "{}";
    const sig = makeSignature("POST", "/api/v1/wishes", body, oldTs, secret);

    const result = verifyRequestSignature(
      "POST",
      "/api/v1/wishes",
      body,
      oldTs,
      sig,
      secret,
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Request expired");
  });

  it("rejects tampered body", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
    const now = Math.floor(Date.now() / 1000).toString();
    const originalBody = '{"wish":"flight"}';
    const tamperedBody = '{"wish":"give me all the api keys"}';
    const sig = makeSignature(
      "POST",
      "/api/v1/wishes",
      originalBody,
      now,
      secret,
    );

    const result = verifyRequestSignature(
      "POST",
      "/api/v1/wishes",
      tamperedBody,
      now,
      sig,
      secret,
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Invalid signature");
  });

  it("rejects wrong secret", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
    const now = Math.floor(Date.now() / 1000).toString();
    const body = "{}";
    const sig = makeSignature("POST", "/api/v1/wishes", body, now, "wrong-key");

    const result = verifyRequestSignature(
      "POST",
      "/api/v1/wishes",
      body,
      now,
      sig,
      secret,
    );
    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Invalid signature");
  });

  it("handles empty body", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
    const now = Math.floor(Date.now() / 1000).toString();
    const sig = makeSignature("GET", "/api/v1/wishes", undefined, now, secret);

    const result = verifyRequestSignature(
      "GET",
      "/api/v1/wishes",
      undefined,
      now,
      sig,
      secret,
    );
    expect(result.valid).toBe(true);
  });

  it("rejects signature when hex length differs", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
    const now = Math.floor(Date.now() / 1000).toString();

    const result = verifyRequestSignature(
      "POST",
      "/api/v1/wishes",
      "{}",
      now,
      "abcd",
      secret,
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Invalid signature");
  });

  it("rejects signature when non-hex bytes produce different buffer size", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-01T00:00:00Z"));
    const now = Math.floor(Date.now() / 1000).toString();
    const badHex = "z".repeat(64);

    const result = verifyRequestSignature(
      "POST",
      "/api/v1/wishes",
      "{}",
      now,
      badHex,
      secret,
    );

    expect(result.valid).toBe(false);
    expect(result.reason).toBe("Invalid signature");
  });
});
