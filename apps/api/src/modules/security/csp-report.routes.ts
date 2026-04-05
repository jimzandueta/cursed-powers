import type { FastifyPluginAsync, FastifyRequest } from "fastify";

export const cspReportRoutes: FastifyPluginAsync = async (app) => {
  app.post(
    "/",
    {
      config: {
        rateLimit: { max: 10, timeWindow: 60_000 },
      },
      bodyLimit: 10_240,
    },
    async (request: FastifyRequest, reply) => {
      const report = request.body as Record<string, unknown>;

      request.log.warn(
        {
          cspReport: report?.["csp-report"] ?? report,
          ip: request.ip,
          userAgent: request.headers["user-agent"],
        },
        "CSP violation reported",
      );

      return reply.status(204).send();
    },
  );
};
