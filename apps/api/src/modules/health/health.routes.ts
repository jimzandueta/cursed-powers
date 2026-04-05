import type { FastifyPluginAsync } from "fastify";

const VERSION = "0.1.0";

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => {
    return {
      status: "ok" as const,
      version: VERSION,
      timestamp: new Date().toISOString(),
    };
  });
};
