import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const wishes = sqliteTable("wishes", {
  id: text("id").primaryKey(),
  originalWish: text("original_wish").notNull(),
  normalizedPower: text("normalized_power").notNull().default(""),
  cursedPower: text("cursed_power").notNull(),
  butClause: text("but_clause").notNull(),
  explanation: text("explanation").notNull(),
  uselessnessScore: integer("uselessness_score").notNull(),
  category: text("category").notNull(),
  isValid: integer("is_valid", { mode: "boolean" }).notNull().default(true),
  rejectionReason: text("rejection_reason").default(""),
  ipHash: text("ip_hash"),
  modelVersion: text("model_version").default("gemini-2.0-flash"),
  generationTimeMs: integer("generation_time_ms"),
  isFeatured: integer("is_featured", { mode: "boolean" })
    .notNull()
    .default(false),
  isHidden: integer("is_hidden", { mode: "boolean" }).notNull().default(false),
  createdAt: text("created_at")
    .notNull()
    .$defaultFn(() => new Date().toISOString()),
});

export type Wish = typeof wishes.$inferSelect;
export type NewWish = typeof wishes.$inferInsert;
