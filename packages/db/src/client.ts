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

import { PrismaClient } from "./generated/prisma/client.js";

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
  if (!url) {
    throw new Error("[@ogs/db] DATABASE_URL must be set. See docs/runbooks/local-dev.md.");
  }
  return url;
}

function createClient(): PrismaClient {
  const adapter = new PrismaPg({ connectionString: resolveConnectionString() });
  return new PrismaClient({ adapter });
}

/**
 * Singleton, *un-extended* PrismaClient. Use only inside `./index.ts`
 * to compose extensions; application code imports the composed client.
 */
export const basePrisma: PrismaClient = globalThis.__ogsPrismaBase ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__ogsPrismaBase = basePrisma;
}

export type { PrismaClient } from "./generated/prisma/client.js";
