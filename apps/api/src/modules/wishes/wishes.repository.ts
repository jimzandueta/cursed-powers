import { eq, desc, sql, and, ne, notInArray } from "drizzle-orm";
import { getDb } from "../../db/index.js";
import { wishes, type NewWish, type Wish } from "../../db/schema.js";

export function createWish(data: NewWish): Wish {
  const db = getDb();
  db.insert(wishes).values(data).run();
  return db.select().from(wishes).where(eq(wishes.id, data.id)).get()!;
}

/**
 * Find a cached wish for a normalized power name, excluding wishes
 * this IP has already seen (by their IDs).
 * Returns a random match from the pool so consecutive calls vary.
 */
export function findCachedWish(
  normalizedPower: string,
  excludeIds: string[],
): Wish | undefined {
  const db = getDb();

  if (excludeIds.length > 0) {
    return db
      .select()
      .from(wishes)
      .where(
        and(
          eq(wishes.normalizedPower, normalizedPower),
          eq(wishes.isValid, true),
          notInArray(wishes.id, excludeIds),
        ),
      )
      .orderBy(sql`RANDOM()`)
      .limit(1)
      .get();
  }

  return db
    .select()
    .from(wishes)
    .where(
      and(
        eq(wishes.normalizedPower, normalizedPower),
        eq(wishes.isValid, true),
      ),
    )
    .orderBy(sql`RANDOM()`)
    .limit(1)
    .get();
}

export function getWishIdsByIpAndPower(
  ipHash: string,
  normalizedPower: string,
): string[] {
  const db = getDb();
  const rows = db
    .select({ id: wishes.id })
    .from(wishes)
    .where(
      and(
        eq(wishes.normalizedPower, normalizedPower),
        eq(wishes.ipHash, ipHash),
      ),
    )
    .all();
  return rows.map((r) => r.id);
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

  return { wishes: rows, total: countResult?.count ?? /* v8 ignore next */ 0 };
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
