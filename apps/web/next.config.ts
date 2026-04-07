import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "frame-src https://challenges.cloudflare.com",
      process.env.NODE_ENV === "development"
        ? "connect-src 'self' http: https:"
        : "connect-src 'self' https://challenges.cloudflare.com " +
            (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"),
      "report-uri " +
        (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001") +
        "/api/v1/csp-report",
    ].join("; "),
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "X-Powered-By", value: "Cursed Genie v0.1.0 (HTCPCP-Compliant)" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@cursed-wishes/shared"],
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
