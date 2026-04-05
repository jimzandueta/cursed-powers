import { createHash } from "node:crypto";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { CreateWishSchema, type WishResult } from "@cursed-wishes/shared";
import { generateWishId } from "../../lib/id.js";
import { NotASuperpowerError, ValidationError } from "../../lib/errors.js";
import { moderateInput } from "../../services/moderation/moderation.service.js";
import { generateCursedWish } from "../../services/gemini/gemini.service.js";
import {
  createWish,
  getWishById,
  getWishes,
  getRandomWish,
} from "./wishes.repository.js";

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function toWishResult(row: {
  id: string;
  originalWish: string;
  cursedPower: string;
  butClause: string;
  explanation: string;
  uselessnessScore: number;
  category: string;
  createdAt: string;
}): WishResult {
  return {
    id: row.id,
    originalWish: row.originalWish,
    cursedPower: row.cursedPower,
    butClause: row.butClause,
    explanation: row.explanation,
    uselessnessScore: row.uselessnessScore,
    category: row.category as WishResult["category"],
    createdAt: row.createdAt,
  };
}

export const wishRoutes: FastifyPluginAsync = async (app) => {
  // POST /api/v1/wishes — Generate a cursed wish
  app.post("/", async (request: FastifyRequest, reply) => {
    const env = (app as any).env;
    const body = CreateWishSchema.safeParse(request.body);

    if (!body.success) {
      throw new ValidationError(
        body.error.errors.map((e) => e.message).join(", "),
      );
    }

    const { wish } = body.data;

    // Moderation check
    moderateInput(wish);

    // Generate cursed wish via Gemini
    const startTime = Date.now();
    const geminiResult = await generateCursedWish(wish, env, request.log);
    const generationTimeMs = Date.now() - startTime;

    request.log.info(
      { wish, generationTimeMs, isValid: geminiResult.isValidSuperpower },
      "Wish generated",
    );

    // Handle "not a superpower" classification
    if (!geminiResult.isValidSuperpower) {
      throw new NotASuperpowerError(
        geminiResult.rejectionReason ||
          "That's not a superpower, mortal. Try again.",
      );
    }

    // Persist
    const id = generateWishId();
    const row = createWish({
      id,
      originalWish: wish,
      cursedPower: geminiResult.cursedPower,
      butClause: geminiResult.butClause,
      explanation: geminiResult.explanation,
      uselessnessScore: geminiResult.uselessnessScore,
      category: geminiResult.category,
      isValid: true,
      ipHash: hashIp(request.ip),
      generationTimeMs,
    });

    return reply.status(201).send(toWishResult(row));
  });

  // GET /api/v1/wishes/:id — Fetch a wish by ID
  app.get<{ Params: { id: string } }>("/:id", async (request, reply) => {
    const { id } = request.params;
    const row = getWishById(id);

    if (!row) {
      return reply.status(404).send({
        error: {
          code: "NOT_FOUND",
          message: "This wish has been lost to the sands of time.",
          requestId: request.id,
        },
      });
    }

    return toWishResult(row);
  });

  // GET /api/v1/wishes — Gallery listing
  app.get(
    "/",
    async (
      request: FastifyRequest<{
        Querystring: { page?: string; limit?: string };
      }>,
    ) => {
      const page = Math.max(1, parseInt(request.query.page || "1", 10) || 1);
      const limit = Math.min(
        50,
        Math.max(1, parseInt(request.query.limit || "20", 10) || 20),
      );

      const result = getWishes(page, limit);

      return {
        wishes: result.wishes.map(toWishResult),
        total: result.total,
        page,
      };
    },
  );

  // GET /api/v1/wishes/random — Random wish
  app.get("/random", async (_request, reply) => {
    const row = getRandomWish();
    if (!row) {
      return reply.status(404).send({
        error: {
          code: "NOT_FOUND",
          message: "No wishes have been granted yet.",
        },
      });
    }
    return toWishResult(row);
  });
};
