import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { rmSync } from "node:fs";

describe("wishes repository", () => {
  const testDbPath = "./data/test-repo.db";

  beforeEach(async () => {
    vi.resetModules();
    const { initDb } = await import("../../db/index.js");
    initDb(testDbPath);
  });

  afterEach(async () => {
    const { closeDb } = await import("../../db/index.js");
    closeDb();
    try {
      rmSync(testDbPath, { force: true });
      rmSync(`${testDbPath}-wal`, { force: true });
      rmSync(`${testDbPath}-shm`, { force: true });
    } catch {}
  });

  it("createWish inserts and returns a wish", async () => {
    const { createWish } = await import("./wishes.repository.js");
    const wish = createWish({
      id: "w_test0001",
      originalWish: "invisibility",
      normalizedPower: "invisibility",
      cursedPower: "Invisibility, but only your body",
      butClause: "but only your body",
      explanation: "Congrats, you're a floating outfit.",
      uselessnessScore: 88,
      category: "Technically True",
      isValid: true,
      ipHash: "abc123",
      generationTimeMs: 500,
    });

    expect(wish.id).toBe("w_test0001");
    expect(wish.originalWish).toBe("invisibility");
    expect(wish.cursedPower).toContain("Invisibility");
  });

  it("getWishById returns a wish", async () => {
    const { createWish, getWishById } = await import("./wishes.repository.js");
    createWish({
      id: "w_test0002",
      originalWish: "flight",
      normalizedPower: "flight",
      cursedPower: "Flight, but only 2mm",
      butClause: "but only 2mm",
      explanation: "Hovering.",
      uselessnessScore: 92,
      category: "Aggressively Useless",
      isValid: true,
      ipHash: "def456",
      generationTimeMs: 300,
    });

    const found = getWishById("w_test0002");
    expect(found).toBeDefined();
    expect(found!.id).toBe("w_test0002");
  });

  it("getWishById returns undefined for non-existent id", async () => {
    const { getWishById } = await import("./wishes.repository.js");
    expect(getWishById("w_nonexist")).toBeUndefined();
  });

  it("getWishes paginates correctly", async () => {
    const { createWish, getWishes } = await import("./wishes.repository.js");

    for (let i = 0; i < 5; i++) {
      createWish({
        id: `w_page${i.toString().padStart(4, "0")}`,
        originalWish: `power ${i}`,
        normalizedPower: `power ${i}`,
        cursedPower: `Power ${i}, but cursed`,
        butClause: "but cursed",
        explanation: "Explanation.",
        uselessnessScore: 80,
        category: "Technically True",
        isValid: true,
        ipHash: "hash",
        generationTimeMs: 100,
      });
    }

    const page1 = getWishes(1, 2);
    expect(page1.wishes).toHaveLength(2);
    expect(page1.total).toBe(5);

    const page3 = getWishes(3, 2);
    expect(page3.wishes).toHaveLength(1);
  });

  it("getRandomWish returns a wish when data exists", async () => {
    const { createWish, getRandomWish } =
      await import("./wishes.repository.js");

    createWish({
      id: "w_rand0001",
      originalWish: "speed",
      normalizedPower: "speed",
      cursedPower: "Speed, but only backwards",
      butClause: "but only backwards",
      explanation: "Vroooom.",
      uselessnessScore: 85,
      category: "Cosmically Unfair",
      isValid: true,
      ipHash: "gh",
      generationTimeMs: 200,
    });

    const random = getRandomWish();
    expect(random).toBeDefined();
  });

  it("getRandomWish returns undefined when no data", async () => {
    const { getRandomWish } = await import("./wishes.repository.js");
    expect(getRandomWish()).toBeUndefined();
  });

  it("findCachedWish finds by normalized power", async () => {
    const { createWish, findCachedWish } =
      await import("./wishes.repository.js");

    createWish({
      id: "w_cache001",
      originalWish: "Flying",
      normalizedPower: "flying",
      cursedPower: "Flying, but only while asleep",
      butClause: "but only while asleep",
      explanation: "Sleepflying.",
      uselessnessScore: 90,
      category: "Existentially Cruel",
      isValid: true,
      ipHash: "ip1",
      generationTimeMs: 400,
    });

    const cached = findCachedWish("flying", []);
    expect(cached).toBeDefined();
    expect(cached!.normalizedPower).toBe("flying");
  });

  it("findCachedWish excludes specified ids", async () => {
    const { createWish, findCachedWish } =
      await import("./wishes.repository.js");

    createWish({
      id: "w_excl0001",
      originalWish: "telepathy",
      normalizedPower: "telepathy",
      cursedPower: "Telepathy, but v1",
      butClause: "but v1",
      explanation: "V1.",
      uselessnessScore: 85,
      category: "Technically True",
      isValid: true,
      ipHash: "ip1",
      generationTimeMs: 100,
    });

    const excluded = findCachedWish("telepathy", ["w_excl0001"]);
    expect(excluded).toBeUndefined();
  });

  it("findCachedWish returns undefined for unknown power", async () => {
    const { findCachedWish } = await import("./wishes.repository.js");
    expect(findCachedWish("nonexistent", [])).toBeUndefined();
  });

  it("getWishIdsByIpAndPower returns matching ids", async () => {
    const { createWish, getWishIdsByIpAndPower } =
      await import("./wishes.repository.js");

    createWish({
      id: "w_ipow0001",
      originalWish: "strength",
      normalizedPower: "strength",
      cursedPower: "Strength, but cursed",
      butClause: "but cursed",
      explanation: "Oops.",
      uselessnessScore: 82,
      category: "Painfully Specific",
      isValid: true,
      ipHash: "myip",
      generationTimeMs: 250,
    });

    const ids = getWishIdsByIpAndPower("myip", "strength");
    expect(ids).toContain("w_ipow0001");
  });

  it("getWishIdsByIpAndPower returns empty for non-matching", async () => {
    const { getWishIdsByIpAndPower } = await import("./wishes.repository.js");
    const ids = getWishIdsByIpAndPower("unknown", "nope");
    expect(ids).toEqual([]);
  });
});
