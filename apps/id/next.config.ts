import type { NextConfig } from "next";

/**
 * Per-app Next.js 16 config.
 * Keep this minimal — shared behaviour lives in @ogs/* packages.
 */
const config: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true,
  },
};

export default config;
