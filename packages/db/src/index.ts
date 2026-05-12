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
import { basePrisma } from "./client.js";
import { auditExtension, softDeleteExtension, tenantScopeExtension } from "./extensions/index.js";

/**
 * Application-facing Prisma client. Layer order is deliberate — see
 * `./extensions/index.ts` for the rationale.
 */
export const prisma = basePrisma
  .$extends(tenantScopeExtension)
  .$extends(softDeleteExtension)
  .$extends(auditExtension);

export { basePrisma } from "./client.js";
export type { PrismaClient } from "./client.js";
export { getActor, requireActor, runWithActor } from "./run-with-actor.js";
export type { ActorContext } from "./run-with-actor.js";

// Re-export Prisma's namespace + generated types so consumers don't
// have to dig into `src/generated/prisma`.
export { Prisma } from "./generated/prisma/client.js";
