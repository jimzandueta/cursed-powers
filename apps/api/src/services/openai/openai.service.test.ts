import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Env } from "../../config/env.js";
import type { GeminiWishResponse } from "@cursed-wishes/shared";

const mockCreate = vi.fn();

vi.mock("openai", () => {
  return {
    default: vi.fn().mockImplementation(() => ({
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    })),
  };
});

const validResponse: GeminiWishResponse = {
  isValidSuperpower: true,
  rejectionReason: "",
  originalPower: "Teleportation",
  cursedPower: "Teleportation, but your clothes stay behind",
  butClause: "but your clothes stay behind",
  explanation: "You arrive instantly. Naked.",
  uselessnessScore: 89,
  category: "Cosmically Unfair",
};

const logger = {
  info: vi.fn(),
  error: vi.fn(),
};

function makeEnv(): Env {
  return {
    PORT: 3001,
    NODE_ENV: "test",
    LOG_LEVEL: "info",
    DATABASE_URL: "file:./test.db",
    GEMINI_API_KEY: "",
    OPENAI_API_KEY: "test-openai-key",
    CORS_ORIGIN: "http://localhost:3000",
    RATE_LIMIT_MAX: 10,
    RATE_LIMIT_WINDOW_MS: 60000,
  } as Env;
}

describe("generateWithOpenAI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it("returns valid response on first attempt", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(validResponse) } }],
    });

    const { generateWithOpenAI } = await import("./openai.service.js");
    const result = await generateWithOpenAI("teleportation", makeEnv(), logger);

    expect(result).not.toBeNull();
    expect(result!.cursedPower).toBe(
      "Teleportation, but your clothes stay behind",
    );
  });

  it("retries on first failure", async () => {
    mockCreate
      .mockRejectedValueOnce(new Error("API error"))
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(validResponse) } }],
      });

    const { generateWithOpenAI } = await import("./openai.service.js");
    const result = await generateWithOpenAI("teleportation", makeEnv(), logger);

    expect(result).not.toBeNull();
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it("returns null when both attempts fail", async () => {
    mockCreate
      .mockRejectedValueOnce(new Error("fail 1"))
      .mockRejectedValueOnce(new Error("fail 2"));

    const { generateWithOpenAI } = await import("./openai.service.js");
    const result = await generateWithOpenAI("teleportation", makeEnv(), logger);

    expect(result).toBeNull();
  });

  it("returns null on invalid JSON", async () => {
    mockCreate
      .mockResolvedValueOnce({
        choices: [{ message: { content: "not json" } }],
      })
      .mockResolvedValueOnce({
        choices: [{ message: { content: "still not json" } }],
      });

    const { generateWithOpenAI } = await import("./openai.service.js");
    const result = await generateWithOpenAI("teleportation", makeEnv(), logger);

    expect(result).toBeNull();
  });

  it("returns null on invalid schema", async () => {
    mockCreate
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ bad: "data" }) } }],
      })
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify({ wrong: true }) } }],
      });

    const { generateWithOpenAI } = await import("./openai.service.js");
    const result = await generateWithOpenAI("teleportation", makeEnv(), logger);

    expect(result).toBeNull();
  });

  it("handles empty choices", async () => {
    mockCreate.mockResolvedValueOnce({ choices: [] }).mockResolvedValueOnce({
      choices: [{ message: { content: "" } }],
    });

    const { generateWithOpenAI } = await import("./openai.service.js");
    const result = await generateWithOpenAI("teleportation", makeEnv(), logger);

    expect(result).toBeNull();
  });

  it("handles null content", async () => {
    mockCreate
      .mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      })
      .mockResolvedValueOnce({
        choices: [{ message: { content: null } }],
      });

    const { generateWithOpenAI } = await import("./openai.service.js");
    const result = await generateWithOpenAI("teleportation", makeEnv(), logger);

    expect(result).toBeNull();
  });

  it("returns unparseable on first, valid on retry", async () => {
    mockCreate
      .mockResolvedValueOnce({
        choices: [
          { message: { content: JSON.stringify({ incomplete: true }) } },
        ],
      })
      .mockResolvedValueOnce({
        choices: [{ message: { content: JSON.stringify(validResponse) } }],
      });

    const { generateWithOpenAI } = await import("./openai.service.js");
    const result = await generateWithOpenAI("teleportation", makeEnv(), logger);

    expect(result).not.toBeNull();
  });
});
