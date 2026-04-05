import Fastify from "fastify";
import { createHash } from "node:crypto";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import type { Env } from "./config/env.js";
import { AppError } from "./lib/errors.js";
import { AbuseDetector } from "./lib/abuse-detector.js";
import { generateRequestId } from "./lib/id.js";
import { healthRoutes } from "./modules/health/health.routes.js";
import { wishRoutes } from "./modules/wishes/wishes.routes.js";
import { cspReportRoutes } from "./modules/security/csp-report.routes.js";

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

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
      },
    },
    crossOriginEmbedderPolicy: { policy: "require-corp" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginResourcePolicy: { policy: "same-origin" },
  });

  await app.register(cors, {
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  });

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    keyGenerator: (req) => req.ip,
  });

  const abuseDetector = new AbuseDetector();
  app.decorate("abuseDetector", abuseDetector);

  app.addHook("onRequest", async (request) => {
    if (request.method === "POST" && request.url.includes("/wishes")) {
      const result = abuseDetector.recordRequest(request.ip, undefined, {
        userAgent: request.headers["user-agent"],
        accept: request.headers.accept,
      });
      if (result.blocked) {
        request.log.warn(
          { ip: request.ip, abuseScore: result.score },
          "Abuse detector triggered",
        );
        throw new AppError(
          429,
          "ABUSE_DETECTED",
          "The genie senses dark magic. Slow down, mortal.",
        );
      }
    }
  });

  app.addHook("onRequest", async (request) => {
    (request as unknown as Record<string, unknown>).__startTime =
      process.hrtime.bigint();
    request.log.info(
      { method: request.method, url: request.url, requestId: request.id },
      "Incoming request",
    );
  });

  app.addHook("onResponse", async (request, reply) => {
    const start = (request as unknown as Record<string, unknown>)
      .__startTime as bigint | undefined;
    const durationMs = start
      ? Number(process.hrtime.bigint() - start) / 1_000_000
      : 0;
    void reply.header("X-Response-Time", `${durationMs.toFixed(2)}ms`);
    request.log.info(
      {
        method: request.method,
        url: request.url,
        statusCode: reply.statusCode,
        durationMs: durationMs.toFixed(2),
        requestId: request.id,
      },
      "Request completed",
    );
  });

  app.addHook("onSend", async (_request, reply, payload) => {
    void reply.header("X-Powered-By", "Cursed Genie v0.1.0 (HTCPCP-Compliant)");

    if (typeof payload === "string" && payload.length > 0) {
      const hash = createHash("sha256").update(payload).digest("hex");
      void reply.header("X-Content-Hash", hash);
    }

    return payload;
  });

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

  app.decorate("env", env);

  await app.register(healthRoutes, { prefix: "/api/v1/health" });
  await app.register(wishRoutes, { prefix: "/api/v1/wishes" });
  await app.register(cspReportRoutes, { prefix: "/api/v1/csp-report" });

  app.get("/api/v1/teapot", async (_request, reply) => {
    return reply.status(418).send({
      error: {
        code: "IM_A_TEAPOT",
        message:
          "I'm a teapot. Per RFC 2324, I cannot brew coffee. I can only brew regret.",
        protocol: "HTCPCP/1.0",
        rfc: "https://datatracker.ietf.org/doc/html/rfc2324",
        note: "This genie is fully HTCPCP-compliant. You're welcome.",
      },
    });
  });

  return app;
}
