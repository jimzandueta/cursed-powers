import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Env } from "../../config/env.js";

vi.mock("openai", () => {
  return {
    default: vi.fn(),
  };
});

describe("getOpenAIClient", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("creates a singleton client", async () => {
    const { getOpenAIClient } = await import("./openai.client.js");
    const env = { OPENAI_API_KEY: "test-key" } as Env;

    const client1 = getOpenAIClient(env);
    const client2 = getOpenAIClient(env);
    expect(client1).toBe(client2);
  });
});

describe("constants", () => {
  it("exports OPENAI_MODEL", async () => {
    const { OPENAI_MODEL } = await import("./openai.client.js");
    expect(OPENAI_MODEL).toBe("gpt-4.1-mini");
  });
});
