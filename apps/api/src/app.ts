import Fastify from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import type { Env } from "./config/env.js";
import { AppError } from "./lib/errors.js";
import { generateRequestId } from "./lib/id.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { wishRoutes } from "./modules/wishes/wishes.routes.js";

export async function buildApp(env: Env) {
  const app = Fastify({
    logger: {
      level: env.LOG_LEVEL,
      transport:
        env.NODE_ENV === "development"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
    genReqId: () => generateRequestId(),
  });

  // ── Plugins ────────────────────────────────────────────
  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  });

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    keyGenerator: (req) => req.ip,
  });

  // ── Global error handler ───────────────────────────────
  app.setErrorHandler((error, request, reply) => {
    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        error: {
          code: error.code,
          message: error.message,
          requestId: request.id,
        },
      });
    }

    // Rate limit errors from @fastify/rate-limit
    const err = error as Record<string, unknown>;
    if (err.statusCode === 429) {
      return reply.status(429).send({
        error: {
          code: "RATE_LIMITED",
          message: "The genie needs rest. Try again in a moment.",
          requestId: request.id,
        },
      });
    }

    request.log.error(error, "Unhandled error");

    return reply.status(500).send({
      error: {
        code: "INTERNAL_ERROR",
        message: "Something went wrong with the genie's magic.",
        requestId: request.id,
      },
    });
  });

  // ── Decorate with env ──────────────────────────────────
  app.decorate("env", env);

  // ── Routes ─────────────────────────────────────────────
  await app.register(healthRoutes, { prefix: "/api/v1/health" });
  await app.register(wishRoutes, { prefix: "/api/v1/wishes" });

  return app;
}
