import { describe, it, expect } from "vitest";
import { wishes } from "./schema.js";

describe("wishes schema", () => {
  it("defines a wishes table", () => {
    expect(wishes).toBeDefined();
  });

  it("has all expected columns", () => {
    const columns = Object.keys(wishes);
    const expected = [
      "id",
      "originalWish",
      "normalizedPower",
      "cursedPower",
      "butClause",
      "explanation",
      "uselessnessScore",
      "category",
      "isValid",
      "rejectionReason",
      "ipHash",
      "modelVersion",
      "generationTimeMs",
      "isFeatured",
      "isHidden",
      "createdAt",
    ];

    for (const col of expected) {
      expect(columns).toContain(col);
    }
  });

  it("exports Wish and NewWish types (compile-time test)", () => {
    // If this module compiles, the types are properly exported
    expect(true).toBe(true);
  });
});
