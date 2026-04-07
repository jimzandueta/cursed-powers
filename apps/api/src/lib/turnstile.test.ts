import { describe, it, expect, vi, afterEach } from "vitest";
import { verifyTurnstileToken } from "./turnstile.js";

describe("verifyTurnstileToken", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when Cloudflare validates token", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      }),
    );

    await expect(
      verifyTurnstileToken("token", "secret", "1.2.3.4"),
    ).resolves.toBe(true);
  });

  it("returns false when verification endpoint returns non-2xx", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ success: false }),
      }),
    );

    await expect(verifyTurnstileToken("token", "secret")).resolves.toBe(false);
  });

  it("returns false when Cloudflare marks token invalid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ success: false, "error-codes": ["invalid-input-response"] }),
      }),
    );

    await expect(verifyTurnstileToken("bad", "secret")).resolves.toBe(false);
  });
});
