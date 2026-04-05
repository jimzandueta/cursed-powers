import type { FastifyPluginAsync } from "fastify";
import { getDb } from "../../db/index.js";
import {
  geminiCircuitBreaker,
  openaiCircuitBreaker,
} from "../../lib/circuit-breaker.js";

const VERSION = "0.1.0";
const startTime = Date.now();

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get("/", async () => {
    let dbStatus: "healthy" | "unhealthy" = "unhealthy";
    let dbLatencyMs = -1;
    try {
      const dbStart = performance.now();
      const db = getDb();
      db.run(/* sql */ `SELECT 1` as never);
      dbLatencyMs = Math.round((performance.now() - dbStart) * 100) / 100;
      dbStatus = "healthy";
    } catch {
      dbStatus = "unhealthy";
    }

    const mem = process.memoryUsage();

    return {
      status: dbStatus === "healthy" ? ("ok" as const) : ("degraded" as const),
      version: VERSION,
      timestamp: new Date().toISOString(),
      uptime: {
        seconds: Math.floor((Date.now() - startTime) / 1000),
        human: formatUptime(Date.now() - startTime),
      },
      database: {
        status: dbStatus,
        latencyMs: dbLatencyMs,
      },
      circuitBreakers: {
        gemini: geminiCircuitBreaker.getMetrics(),
        openai: openaiCircuitBreaker.getMetrics(),
      },
      process: {
        pid: process.pid,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        memory: {
          rss: formatBytes(mem.rss),
          heapUsed: formatBytes(mem.heapUsed),
          heapTotal: formatBytes(mem.heapTotal),
          external: formatBytes(mem.external),
        },
      },
    };
  });
};

function formatUptime(ms: number): string {
  const s = Math.floor(ms / 1000);
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d}d ${h}h ${m}m ${s % 60}s`;
}

function formatBytes(bytes: number): string {
  const mb = bytes / 1024 / 1024;
  return `${mb.toFixed(2)} MB`;
}
