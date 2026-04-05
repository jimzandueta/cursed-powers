import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  transpilePackages: ["@cursed-wishes/shared"],
};

export default nextConfig;
