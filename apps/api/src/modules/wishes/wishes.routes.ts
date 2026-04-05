import { createHash } from "node:crypto";
import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import { CreateWishSchema, type WishResult } from "@cursed-wishes/shared";
import { generateWishId } from "../../lib/id.js";
import {
  NotASuperpowerError,
  ValidationError,
  TeapotError,
  AppError,
} from "../../lib/errors.js";
import { moderateInput } from "../../services/moderation/moderation.service.js";
import { generateCursedWish } from "../../services/gemini/gemini.service.js";
import { verifyTurnstileToken } from "../../lib/turnstile.js";
import { verifyRequestSignature } from "../../lib/hmac.js";
import {
  createWish,
  getWishById,
  getWishes,
  getRandomWish,
  findCachedWish,
  getWishIdsByIpAndPower,
} from "./wishes.repository.js";

function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 16);
}

function normalizePower(wish: string): string {
  return wish.trim().toLowerCase().replace(/\s+/g, " ");
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
  app.post("/", { bodyLimit: 1_024 }, async (request: FastifyRequest, reply) => {
    const env = (app as any).env;
    const body = CreateWishSchema.safeParse(request.body);

    if (!body.success) {
      throw new ValidationError(
        body.error.errors.map((e) => e.message).join(", "),
      );
    }

    const { wish, turnstileToken } = body.data;

    if (body.data.website) {
      request.log.warn({ ip: request.ip }, "Honeypot triggered — bot detected");
      throw new AppError(
        403,
        "BOT_DETECTED",
        "The genie only grants wishes to humans.",
      );
    }

    if (env.REQUEST_SIGNING_KEY && env.REQUEST_SIGNING_KEY !== "cursed-genie-default-key") {
      const result = verifyRequestSignature(
        request.method,
        request.url.split("?")[0],
        JSON.stringify(request.body),
        request.headers["x-request-timestamp"] as string | undefined,
        request.headers["x-request-signature"] as string | undefined,
        env.REQUEST_SIGNING_KEY,
      );
      if (!result.valid) {
        request.log.warn(
          { ip: request.ip, reason: result.reason },
          "HMAC signature verification failed",
        );
        throw new AppError(
          403,
          "INVALID_SIGNATURE",
          "The genie detects forgery. Your request has been rejected.",
        );
      }
    }

    if (env.TURNSTILE_SECRET_KEY) {
      if (!turnstileToken) {
        throw new AppError(
          403,
          "CAPTCHA_REQUIRED",
          "The genie requires proof you're human. Nice try, bot.",
        );
      }
      const isHuman = await verifyTurnstileToken(
        turnstileToken,
        env.TURNSTILE_SECRET_KEY,
        request.ip,
      );
      if (!isHuman) {
        throw new AppError(
          403,
          "CAPTCHA_FAILED",
          "CAPTCHA verification failed. The genie doesn't serve machines.",
        );
      }
    }

    moderateInput(wish);

    const teapotPattern =
      /\b(tea|coffee|brew|teapot|espresso|latte|cappuccino|matcha|chai|kettle)\b/i;
    if (teapotPattern.test(wish) || wish.trim() === "418") {
      throw new TeapotError();
    }

    const ipHash = hashIp(request.ip);
    const normalized = normalizePower(wish);

    const seenIds = getWishIdsByIpAndPower(ipHash, normalized);
    const sameSession = seenIds.length > 0;

    if (!sameSession) {
      const cached = findCachedWish(normalized, []);
      if (cached) {
        request.log.info(
          { wish, cached: true, cachedId: cached.id },
          "Serving cached wish (new session)",
        );
        const id = generateWishId();
        const row = createWish({
          id,
          originalWish: wish,
          normalizedPower: normalized,
          cursedPower: cached.cursedPower,
          butClause: cached.butClause,
          explanation: cached.explanation,
          uselessnessScore: cached.uselessnessScore,
          category: cached.category,
          isValid: true,
          ipHash,
          generationTimeMs: 0,
        });
        return reply.status(201).send(toWishResult(row));
      }
    }

    const startTime = Date.now();
    const geminiResult = await generateCursedWish(wish, env, request.log);
    const generationTimeMs = Date.now() - startTime;

    request.log.info(
      {
        wish,
        generationTimeMs,
        isValid: geminiResult.isValidSuperpower,
        cached: false,
      },
      "Wish generated via AI",
    );

    if (!geminiResult.isValidSuperpower) {
      throw new NotASuperpowerError(
        geminiResult.rejectionReason ||
          "That's not a superpower, mortal. Try again.",
      );
    }

    const id = generateWishId();
    const row = createWish({
      id,
      originalWish: wish,
      normalizedPower: normalized,
      cursedPower: geminiResult.cursedPower,
      butClause: geminiResult.butClause,
      explanation: geminiResult.explanation,
      uselessnessScore: geminiResult.uselessnessScore,
      category: geminiResult.category,
      isValid: true,
      ipHash,
      generationTimeMs,
    });

    return reply.status(201).send(toWishResult(row));
  });

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
