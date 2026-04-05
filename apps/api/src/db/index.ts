import { mkdirSync } from "node:fs";
import Database from "better-sqlite3";
import {
  drizzle,
  type BetterSQLite3Database,
} from "drizzle-orm/better-sqlite3";
import * as schema from "./schema.js";

let db: BetterSQLite3Database<typeof schema> | null = null;

export function initDb(url: string): BetterSQLite3Database<typeof schema> {
  // Extract file path from "file:./path" format
  const filePath = url.startsWith("file:") ? url.slice(5) : url;

  // Ensure directory exists
  const dir = filePath.substring(0, filePath.lastIndexOf("/"));
  if (dir) {
    mkdirSync(dir, { recursive: true });
  }

  const sqlite = new Database(filePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");

  // Auto-create table
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS wishes (
      id TEXT PRIMARY KEY,
      original_wish TEXT NOT NULL,
      cursed_power TEXT NOT NULL,
      but_clause TEXT NOT NULL,
      explanation TEXT NOT NULL,
      uselessness_score INTEGER NOT NULL,
      category TEXT NOT NULL,
      is_valid INTEGER NOT NULL DEFAULT 1,
      rejection_reason TEXT DEFAULT '',
      ip_hash TEXT,
      model_version TEXT DEFAULT 'gemini-2.0-flash',
      generation_time_ms INTEGER,
      is_featured INTEGER NOT NULL DEFAULT 0,
      is_hidden INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_wishes_created_at ON wishes(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_wishes_is_featured ON wishes(is_featured);
    CREATE INDEX IF NOT EXISTS idx_wishes_category ON wishes(category);
  `);

  db = drizzle(sqlite, { schema });
  return db;
}

export function getDb(): BetterSQLite3Database<typeof schema> {
  if (!db) {
    throw new Error("Database not initialized. Call initDb() first.");
  }
  return db;
}
