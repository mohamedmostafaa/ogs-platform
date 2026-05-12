/**
 * `@ogs/db` — composed Prisma client + extensions.
 *
 * The exported `prisma` here is what application code imports — it has
 * tenant-scope, soft-delete, and audit pre-wired. Importing the
 * un-extended client is intentionally awkward (`basePrisma` from
 * `./client.ts`) and reserved for migrations / Studio / explicit
 * platform-level admin tooling.
 *
 * @see Blueprint §16.1.
 */
import { basePrisma } from "./client";
import { auditExtension, softDeleteExtension, tenantScopeExtension } from "./extensions/index";

/**
 * Application-facing Prisma client. Layer order is deliberate — see
 * `./extensions/index.ts` for the rationale.
 */
export const prisma = basePrisma
  .$extends(tenantScopeExtension)
  .$extends(softDeleteExtension)
  .$extends(auditExtension);

export { basePrisma } from "./client";
export type { PrismaClient } from "./client";
export { getActor, requireActor, runWithActor } from "./run-with-actor";
export type { ActorContext } from "./run-with-actor";

// Re-export Prisma's namespace + generated types so consumers don't
// have to dig into `src/generated/prisma`.
export { Prisma } from "./generated/prisma/client";
