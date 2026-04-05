import { eq, desc, sql } from "drizzle-orm";
import { getDb } from "../../db/index.js";
import { wishes, type NewWish, type Wish } from "../../db/schema.js";

export function createWish(data: NewWish): Wish {
  const db = getDb();
  db.insert(wishes).values(data).run();
  return db.select().from(wishes).where(eq(wishes.id, data.id)).get()!;
}

export function getWishById(id: string): Wish | undefined {
  const db = getDb();
  return db.select().from(wishes).where(eq(wishes.id, id)).get();
}

export function getWishes(
  page: number,
  limit: number,
): { wishes: Wish[]; total: number } {
  const db = getDb();
  const offset = (page - 1) * limit;

  const rows = db
    .select()
    .from(wishes)
    .where(eq(wishes.isValid, true))
    .orderBy(desc(wishes.createdAt))
    .limit(limit)
    .offset(offset)
    .all();

  const countResult = db
    .select({ count: sql<number>`count(*)` })
    .from(wishes)
    .where(eq(wishes.isValid, true))
    .get();

  return { wishes: rows, total: countResult?.count ?? 0 };
}

export function getRandomWish(): Wish | undefined {
  const db = getDb();
  return db
    .select()
    .from(wishes)
    .where(eq(wishes.isValid, true))
    .orderBy(sql`RANDOM()`)
    .limit(1)
    .get();
}
