/**
 * Runtime Prisma client — wraps the generated client with the
 * `@prisma/adapter-pg` driver adapter (mandatory in Prisma 7).
 *
 * Client construction is **deferred** until `getBasePrisma()` is
 * called (the function), NOT until a property is accessed via a Proxy.
 * This matters because:
 *   - `next build` evaluates module top-levels for route discovery
 *     without DATABASE_URL — using `getBasePrisma()` lazily avoids the
 *     crash without a Proxy.
 *   - A real `PrismaClient` (not a Proxy) preserves Prisma's internal
 *     class identity, `$transaction` callback identity, the `$extends`
 *     chain, and any `instanceof` checks.
 *
 * The instance is cached on `globalThis` to survive Next.js HMR.
 *
 * Consumers should NOT import this file directly — they should import
 * the composed `prisma` from `./index.ts`, which layers tenant-scope,
 * soft-delete, and audit extensions on top.
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
  // env vars loaded. createClient() refuses to actually return this
  // client at request time — see the guard below.
  return "postgresql://build-time-placeholder@localhost:5432/placeholder";
}

function createClient(): PrismaClient {
  const url = resolveConnectionString();
  // Defence in depth: never connect to the placeholder at request time.
  // If we somehow reach createClient() during a real request without
  // DATABASE_URL set, fail loud.
  if (
    url.includes("build-time-placeholder") &&
    process.env.NEXT_PHASE !== "phase-production-build" &&
    process.env.NODE_ENV !== "test"
  ) {
    throw new Error(
      "[@ogs/db] DATABASE_URL not set at request time. See docs/runbooks/local-dev.md.",
    );
  }
  const adapter = new PrismaPg({ connectionString: url });
  return new PrismaClient({ adapter });
}

/**
 * Lazily resolves the unextended Prisma client. Composed by
 * `./index.ts`. Application code imports the composed `prisma` from
 * `@ogs/db`, not this function.
 */
export function getBasePrisma(): PrismaClient {
  if (!globalThis.__ogsPrismaBase) {
    globalThis.__ogsPrismaBase = createClient();
  }
  return globalThis.__ogsPrismaBase;
}

export type { PrismaClient } from "./generated/prisma/client";
