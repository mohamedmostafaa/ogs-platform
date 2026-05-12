/**
 * `runWithActor` — establishes a request-scoped Prisma context.
 *
 * The composed Prisma client reads from this AsyncLocalStorage:
 *   - `tenantId`  → tenant-scope extension auto-filters/auto-tags writes.
 *   - `actorUserId` → audit extension stamps every mutation.
 *
 * Every server entry point (tRPC procedure, REST handler, Inngest
 * worker, page-server-action) MUST wrap its work in `runWithActor()`
 * BEFORE touching the database. Forgetting to do so will:
 *   - Block writes via the tenant-scope extension when `tenantId` is
 *     null (intentional fail-loud) — except for explicit "platform"
 *     calls that opt out.
 *   - Stamp audit rows with actorUserId="system" (less ideal — find
 *     the missing wrapper and fix it).
 *
 * @see Blueprint §16.5.
 */
import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Required context for any database mutation. Every field is mandatory
 * except `correlationId`.
 */
export interface ActorContext {
  /** Active tenant — null only for explicit platform-level operations. */
  tenantId: string | null;
  /** Who is acting — userId, or "system" for backend jobs. */
  actorUserId: string;
  /** Inngest event id / request id for cross-system tracing. */
  correlationId?: string;
  /** Client IP, when known (proxy.ts forwards via headers). */
  ipAddress?: string;
  /** User-Agent, when known. */
  userAgent?: string;
}

const storage = new AsyncLocalStorage<ActorContext>();

/**
 * Run `fn` within an actor context. All Prisma queries inside `fn`
 * (and any awaited descendants) inherit the context automatically.
 */
export async function runWithActor<T>(ctx: ActorContext, fn: () => Promise<T>): Promise<T> {
  return storage.run(ctx, fn);
}

/**
 * Read the current actor context.
 *
 * Returns `undefined` when called outside a `runWithActor` — extensions
 * use this to decide whether to enforce or skip their behaviour.
 */
export function getActor(): ActorContext | undefined {
  return storage.getStore();
}

/**
 * Like {@link getActor} but throws when there is no active context.
 * Use in code paths that absolutely require an actor (mutations).
 */
export function requireActor(): ActorContext {
  const ctx = getActor();
  if (!ctx) {
    throw new Error(
      "[@ogs/db] No actor context. Every database mutation must run inside runWithActor({ tenantId, actorUserId }, ...).",
    );
  }
  return ctx;
}
