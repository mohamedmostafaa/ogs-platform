/**
 * `@ogs/db` — composed Prisma client + extensions.
 *
 * The exported `prisma` here is what application code imports — it has
 * tenant-scope, soft-delete, and audit pre-wired. The unextended
 * client is reachable via `basePrismaClient()` and is reserved for
 * migrations / seed / explicit platform-level admin tooling.
 *
 * Composition is **deferred to first use**: `prisma` is a getter
 * proxy that materialises the extended client on first method access
 * and caches it. This keeps `next build`'s route-discovery phase
 * crash-free (no DATABASE_URL needed at module-load) while preserving
 * real `PrismaClient` identity at request time.
 *
 * @see Blueprint §16.1.
 */
import { getBasePrisma, type PrismaClient } from "./client";
import { auditExtension, softDeleteExtension, tenantScopeExtension } from "./extensions/index";

declare global {
  var __ogsPrismaExtended: ReturnType<typeof composeExtensions> | undefined;
}

function composeExtensions(base: PrismaClient) {
  // Layer order is deliberate — see ./extensions/index.ts for the
  // rationale. tenant-scope → soft-delete → audit means audit sees the
  // post-tenant-scoped, post-soft-delete decision and can record it
  // truthfully.
  return base.$extends(tenantScopeExtension).$extends(softDeleteExtension).$extends(auditExtension);
}

function getExtendedPrisma() {
  if (!globalThis.__ogsPrismaExtended) {
    globalThis.__ogsPrismaExtended = composeExtensions(getBasePrisma());
  }
  return globalThis.__ogsPrismaExtended;
}

/**
 * Application-facing Prisma client. The first property access
 * materialises the composed client + caches it on `globalThis`. Every
 * subsequent access hits the cached real Prisma instance.
 *
 * This `Proxy` only forwards property access — `$extends` /
 * `$transaction` etc. all operate on the underlying real client, not
 * the proxy.
 */
export const prisma: ReturnType<typeof composeExtensions> = new Proxy(
  {} as ReturnType<typeof composeExtensions>,
  {
    get(_target, prop) {
      const client = getExtendedPrisma() as Record<string | symbol, unknown>;
      const value = client[prop];
      return typeof value === "function" ? (value as Function).bind(client) : value;
    },
  },
);

/**
 * Resolve the **un-extended** Prisma client. Use for migrations, seed,
 * and admin tooling that explicitly must bypass tenant-scope /
 * soft-delete / audit. Production application code should never call
 * this — the composed `prisma` enforces our security invariants.
 */
export function basePrismaClient(): PrismaClient {
  return getBasePrisma();
}

export type { PrismaClient } from "./client";
export { getActor, requireActor, runWithActor } from "./run-with-actor";
export type { ActorContext } from "./run-with-actor";

// Re-export Prisma's namespace + generated types so consumers don't
// have to dig into `src/generated/prisma`.
export { Prisma } from "./generated/prisma/client";
