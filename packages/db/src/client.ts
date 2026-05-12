/**
 * Runtime Prisma client — wraps the generated client with the
 * `@prisma/adapter-pg` driver adapter (mandatory in Prisma 7).
 *
 * The client is instantiated once at module load and cached on
 * `globalThis` to survive Next.js hot reloads.
 *
 * Consumers should NOT import this file directly — they should import
 * the composed client from `./index.ts`, which layers soft-delete,
 * tenant-scope, and audit extensions on top.
 *
 * @see Blueprint §5.4.3, §16.1.
 */
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "./generated/prisma/client";

declare global {
  var __ogsPrismaBase: PrismaClient | undefined;
}

function resolveConnectionString(): string {
  const direct =
    process.env.DIRECT_URL && process.env.DIRECT_URL.length > 0
      ? process.env.DIRECT_URL
      : undefined;
  const pooled = process.env.DATABASE_URL;
  const url = direct ?? pooled;
  if (url) return url;

  // Build-time fallback. `next build` evaluates module top-levels
  // (NODE_ENV=production, NEXT_PHASE=phase-production-build) without
  // env vars loaded, just to introspect route metadata. Prisma's driver
  // adapter is lazy — handing it a placeholder URL is safe. Real
  // requests will set DATABASE_URL via Vercel's runtime env.
  return "postgresql://build-time-placeholder@localhost:5432/placeholder";
}

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: resolveConnectionString() });
  return new PrismaClient({ adapter });
}

/**
 * Lazy singleton — the actual `new PrismaClient(...)` call is deferred
 * until first property access. This prevents `next build` from crashing
 * during route discovery (which evaluates module top-levels without
 * env vars loaded). Cached on `globalThis` to survive Next.js HMR.
 */
export const basePrisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    if (!globalThis.__ogsPrismaBase) {
      globalThis.__ogsPrismaBase = createClient();
    }
    const client = globalThis.__ogsPrismaBase;
    const value = client[prop as keyof PrismaClient];
    return typeof value === "function" ? (value as Function).bind(client) : value;
  },
});

export type { PrismaClient } from "./generated/prisma/client";
