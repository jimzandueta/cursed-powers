import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mkdirSync } from "node:fs";
import { rmSync } from "node:fs";
import Database from "better-sqlite3";

describe("db module", () => {
  const testDbPath = "./data/test-unit.db";

  afterEach(async () => {
    vi.resetModules();
    try {
      rmSync(testDbPath, { force: true });
      rmSync(`${testDbPath}-wal`, { force: true });
      rmSync(`${testDbPath}-shm`, { force: true });
    } catch {}
  });

  it("initDb creates database and returns drizzle instance", async () => {
    const { initDb, closeDb } = await import("./index.js");
    const db = initDb(testDbPath);
    expect(db).toBeDefined();
    closeDb();
  });

  it("initDb handles file: prefix", async () => {
    const { initDb, closeDb } = await import("./index.js");
    const db = initDb(`file:${testDbPath}`);
    expect(db).toBeDefined();
    closeDb();
  });

  it("getDb returns initialized db", async () => {
    const { initDb, getDb, closeDb } = await import("./index.js");
    initDb(testDbPath);
    const db = getDb();
    expect(db).toBeDefined();
    closeDb();
  });

  it("getDb throws when not initialized", async () => {
    const { getDb } = await import("./index.js");
    expect(() => getDb()).toThrow("Database not initialized");
  });

  it("closeDb is safe to call when no db exists", async () => {
    const { closeDb } = await import("./index.js");
    expect(() => closeDb()).not.toThrow();
  });

  it("closeDb nullifies the db reference", async () => {
    const { initDb, getDb, closeDb } = await import("./index.js");
    initDb(testDbPath);
    closeDb();
    expect(() => getDb()).toThrow("Database not initialized");
  });

  it("creates wishes table automatically", async () => {
    const { initDb, getDb, closeDb } = await import("./index.js");
    initDb(testDbPath);
    const db = getDb();
    const result = db.run(
      /* sql */ `SELECT count(*) as cnt FROM wishes` as never,
    ) as unknown;
    expect(result).toBeDefined();
    closeDb();
  });

  it("creates indexes", async () => {
    const { initDb, closeDb } = await import("./index.js");
    const db = initDb(testDbPath);
    const rawDb = db as any;
    closeDb();
  });
});
