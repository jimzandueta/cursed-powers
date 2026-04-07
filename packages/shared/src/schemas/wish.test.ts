import { describe, it, expect } from "vitest";
import {
  CreateWishSchema,
  GeminiWishResponseSchema,
  WishResultSchema,
  WishListResponseSchema,
  ApiErrorSchema,
  HealthResponseSchema,
  CATEGORIES,
  WISH_MIN_LENGTH,
  WISH_MAX_LENGTH,
} from "./wish.js";

describe("constants", () => {
  it("WISH_MIN_LENGTH is 2", () => {
    expect(WISH_MIN_LENGTH).toBe(2);
  });

  it("WISH_MAX_LENGTH is 60", () => {
    expect(WISH_MAX_LENGTH).toBe(60);
  });

  it("has 5 categories", () => {
    expect(CATEGORIES).toHaveLength(5);
    expect(CATEGORIES).toContain("Technically True");
    expect(CATEGORIES).toContain("Cosmically Unfair");
    expect(CATEGORIES).toContain("Painfully Specific");
    expect(CATEGORIES).toContain("Existentially Cruel");
    expect(CATEGORIES).toContain("Aggressively Useless");
  });
});

describe("CreateWishSchema", () => {
  it("validates a valid wish", () => {
    const result = CreateWishSchema.safeParse({ wish: "flight" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.wish).toBe("flight");
    }
  });

  it("trims whitespace", () => {
    const result = CreateWishSchema.safeParse({ wish: "  flight  " });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.wish).toBe("flight");
    }
  });

  it("rejects too-short wish", () => {
    const result = CreateWishSchema.safeParse({ wish: "a" });
    expect(result.success).toBe(false);
  });

  it("rejects too-long wish", () => {
    const result = CreateWishSchema.safeParse({ wish: "x".repeat(201) });
    expect(result.success).toBe(false);
  });

  it("rejects empty string", () => {
    const result = CreateWishSchema.safeParse({ wish: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing wish field", () => {
    const result = CreateWishSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts exactly min length", () => {
    const result = CreateWishSchema.safeParse({ wish: "ab" });
    expect(result.success).toBe(true);
  });

  it("accepts exactly max length", () => {
    const result = CreateWishSchema.safeParse({ wish: "x".repeat(60) });
    expect(result.success).toBe(true);
  });

  it("accepts optional turnstileToken", () => {
    const result = CreateWishSchema.safeParse({
      wish: "flight",
      turnstileToken: "abc123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.turnstileToken).toBe("abc123");
    }
  });

  it("allows missing turnstileToken", () => {
    const result = CreateWishSchema.safeParse({ wish: "flight" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.turnstileToken).toBeUndefined();
    }
  });

  it("defaults honeypot website field to empty string", () => {
    const result = CreateWishSchema.safeParse({ wish: "flight" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.website).toBe("");
    }
  });

  it("rejects non-empty honeypot website field", () => {
    const result = CreateWishSchema.safeParse({
      wish: "flight",
      website: "http://spam.com",
    });
    expect(result.success).toBe(false);
  });

  it("accepts empty honeypot website field", () => {
    const result = CreateWishSchema.safeParse({
      wish: "flight",
      website: "",
    });
    expect(result.success).toBe(true);
  });
});

describe("GeminiWishResponseSchema", () => {
  it("validates a complete valid response", () => {
    const result = GeminiWishResponseSchema.safeParse({
      isValidSuperpower: true,
      rejectionReason: "",
      originalPower: "Flight",
      cursedPower: "Flight, but only 2mm above ground",
      butClause: "but only 2mm above ground",
      explanation: "Technically flying.",
      uselessnessScore: 92,
      category: "Technically True",
    });
    expect(result.success).toBe(true);
  });

  it("provides defaults for optional fields", () => {
    const result = GeminiWishResponseSchema.safeParse({
      isValidSuperpower: true,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.rejectionReason).toBe("");
      expect(result.data.originalPower).toBe("");
      expect(result.data.cursedPower).toBe("");
      expect(result.data.butClause).toBe("");
      expect(result.data.explanation).toBe("");
      expect(result.data.uselessnessScore).toBe(85);
      expect(result.data.category).toBe("Technically True");
    }
  });

  it("catches invalid category to default", () => {
    const result = GeminiWishResponseSchema.safeParse({
      isValidSuperpower: true,
      category: "Not A Real Category",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.category).toBe("Technically True");
    }
  });

  it("clamps uselessnessScore to 0-100", () => {
    const tooHigh = GeminiWishResponseSchema.safeParse({
      isValidSuperpower: true,
      uselessnessScore: 150,
    });
    expect(tooHigh.success).toBe(false);

    const tooLow = GeminiWishResponseSchema.safeParse({
      isValidSuperpower: true,
      uselessnessScore: -5,
    });
    expect(tooLow.success).toBe(false);
  });

  it("requires integer for uselessnessScore", () => {
    const result = GeminiWishResponseSchema.safeParse({
      isValidSuperpower: true,
      uselessnessScore: 85.5,
    });
    expect(result.success).toBe(false);
  });

  it("requires isValidSuperpower", () => {
    const result = GeminiWishResponseSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe("WishResultSchema", () => {
  it("validates a complete wish result", () => {
    const result = WishResultSchema.safeParse({
      id: "w_abc12345",
      originalWish: "flight",
      cursedPower: "Flight, but only 2mm",
      butClause: "but only 2mm",
      explanation: "Technically flying.",
      uselessnessScore: 92,
      category: "Technically True",
      createdAt: "2026-04-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects incomplete wish result", () => {
    const result = WishResultSchema.safeParse({ id: "w_abc12345" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = WishResultSchema.safeParse({
      id: "w_abc12345",
      originalWish: "flight",
      cursedPower: "Flight, but 2mm",
      butClause: "but 2mm",
      explanation: "Flying.",
      uselessnessScore: 92,
      category: "InvalidCategory",
      createdAt: "2026-04-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});

describe("WishListResponseSchema", () => {
  it("validates a wish list response", () => {
    const result = WishListResponseSchema.safeParse({
      wishes: [
        {
          id: "w_abc12345",
          originalWish: "flight",
          cursedPower: "Flight, but 2mm",
          butClause: "but 2mm",
          explanation: "Flying.",
          uselessnessScore: 92,
          category: "Technically True",
          createdAt: "2026-04-01T00:00:00.000Z",
        },
      ],
      total: 1,
      page: 1,
    });
    expect(result.success).toBe(true);
  });

  it("validates empty wish list", () => {
    const result = WishListResponseSchema.safeParse({
      wishes: [],
      total: 0,
      page: 1,
    });
    expect(result.success).toBe(true);
  });
});

describe("ApiErrorSchema", () => {
  it("validates an API error", () => {
    const result = ApiErrorSchema.safeParse({
      error: {
        code: "NOT_FOUND",
        message: "Wish not found",
        requestId: "req_abc123",
      },
    });
    expect(result.success).toBe(true);
  });

  it("validates without optional requestId", () => {
    const result = ApiErrorSchema.safeParse({
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong",
      },
    });
    expect(result.success).toBe(true);
  });
});

describe("HealthResponseSchema", () => {
  it("validates a health response", () => {
    const result = HealthResponseSchema.safeParse({
      status: "ok",
      version: "0.1.0",
      timestamp: "2026-04-01T00:00:00.000Z",
    });
    expect(result.success).toBe(true);
  });

  it("rejects non-ok status", () => {
    const result = HealthResponseSchema.safeParse({
      status: "degraded",
      version: "0.1.0",
      timestamp: "2026-04-01T00:00:00.000Z",
    });
    expect(result.success).toBe(false);
  });
});
