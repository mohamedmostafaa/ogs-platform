/**
 * Server-side auth guards.
 *
 * The four building blocks every protected surface composes from:
 *   - `requireAuth(headers)`               → user must be signed in.
 *   - `requireTenant(headers, slug)`       → user must belong to that tenant.
 *   - `requireRole(headers, role, slug)`   → user must hold that role IN that tenant.
 *   - `requireFeature(flagKey, tenantId)`  → tenant has the FeatureFlag on.
 *
 * Plus a tRPC-flavoured shortcut:
 *   - `trpcRequireAuth(headers)` → re-throws `AuthGuardError` so the tRPC
 *                                  formatter in `@ogs/api` can map to
 *                                  `TRPCError({ code: "UNAUTHORIZED" })`.
 *
 * Each guard reads the active session via Better Auth, then consults
 * `@ogs/db` (composed client) so the same tenant-scope rules apply.
 *
 * @see Blueprint §6.8, SECURITY.md Gate 3.
 */
import { prisma, type ActorContext } from "@ogs/db";
import type { Role } from "@ogs/config";

import { auth, type AuthSession } from "./server";

/** Error thrown by guards. Plain `Error` so the consumer maps to HTTP. */
export class AuthGuardError extends Error {
  constructor(
    public readonly code: "UNAUTHENTICATED" | "FORBIDDEN" | "TENANT_MISMATCH" | "FEATURE_DISABLED",
    message: string,
  ) {
    super(message);
    this.name = "AuthGuardError";
  }
}

/**
 * Resolve the current session, or throw UNAUTHENTICATED.
 */
export async function requireAuth(headers: Headers): Promise<AuthSession> {
  const session = await auth.api.getSession({ headers });
  if (!session) {
    throw new AuthGuardError("UNAUTHENTICATED", "Sign-in required.");
  }
  return session;
}

/**
 * Ensure the signed-in user is a member of the named tenant (any role).
 *
 * The caller resolves the tenant from request context (subdomain,
 * path param, ...) and passes the slug — guards never guess.
 */
export async function requireTenant(
  headers: Headers,
  tenantSlug: string,
): Promise<{ session: AuthSession; tenantId: string; role: string }> {
  const session = await requireAuth(headers);
  const userId = session.user.id;
  const membership = await prisma.membership.findFirst({
    where: { userId, tenant: { slug: tenantSlug } },
    include: { tenant: true },
  });
  if (!membership) {
    throw new AuthGuardError("TENANT_MISMATCH", `You don't have access to tenant "${tenantSlug}".`);
  }
  return { session, tenantId: membership.tenantId, role: membership.role };
}

/**
 * Ensure the signed-in user holds the given Role in the named tenant.
 *
 * `tenantSlug` is **mandatory**. An earlier draft allowed it to be
 * optional and resolved "any tenant where the user has this role" —
 * which is a horizontal-privilege-escalation bug (Phase-A B1). The
 * caller MUST establish tenant context first and pass it in.
 */
export async function requireRole(
  headers: Headers,
  role: Role,
  tenantSlug: string,
): Promise<{ session: AuthSession; tenantId: string }> {
  const { session, tenantId, role: membershipRole } = await requireTenant(headers, tenantSlug);
  if (membershipRole !== role) {
    throw new AuthGuardError("FORBIDDEN", `Role "${role}" required in tenant "${tenantSlug}".`);
  }
  return { session, tenantId };
}

/**
 * Gate behind a FeatureFlag.
 *
 * Lookup order:
 *   1. Tenant-specific override (`key`, `tenantId = <given>`).
 *   2. Global default (`key`, `tenantId IS NULL`).
 *
 * Both branches use `findFirst` (NOT `findUnique`) because Postgres
 * treats NULL as distinct in `@@unique([key, tenantId])`, so the
 * global-default lookup needs `IS NULL` semantics. (The audit caught
 * the earlier `null as never` cast as a footgun.)
 *
 * **Phase-1 value DSL: only `"true"` is treated as ON.** The schema
 * documents a richer DSL (`"percentage:25"`, `"users:[id1,id2]"`)
 * which lands in Phase 2 (tracked under a new OGS task). Any value
 * other than `"true"` (case-insensitive, trimmed) fails closed.
 *
 * @see Blueprint §5.17.
 */
export async function requireFeature(flagKey: string, tenantId: string | null): Promise<void> {
  const flag =
    (tenantId ? await prisma.featureFlag.findFirst({ where: { key: flagKey, tenantId } }) : null) ??
    (await prisma.featureFlag.findFirst({ where: { key: flagKey, tenantId: null } }));

  if (!flag) {
    throw new AuthGuardError("FEATURE_DISABLED", `Feature "${flagKey}" is disabled.`);
  }
  if (flag.value.trim().toLowerCase() !== "true") {
    throw new AuthGuardError("FEATURE_DISABLED", `Feature "${flagKey}" is disabled.`);
  }
}

/**
 * tRPC convenience wrapper. The tRPC error formatter in `@ogs/api`
 * inspects `err instanceof AuthGuardError` and maps to a typed
 * TRPCError. Re-throwing the same instance keeps the contract typed.
 */
export async function trpcRequireAuth(headers: Headers): Promise<AuthSession> {
  return requireAuth(headers);
}

/**
 * Build an `ActorContext` from a session + tenant, ready to hand to
 * `runWithActor()`. Centralises the "session → DB context" mapping.
 */
export function actorFromSession(
  session: AuthSession,
  options: {
    tenantId: string | null;
    correlationId?: string;
    ipAddress?: string;
    userAgent?: string;
  },
): ActorContext {
  return {
    tenantId: options.tenantId,
    actorUserId: session.user.id,
    correlationId: options.correlationId,
    ipAddress: options.ipAddress,
    userAgent: options.userAgent,
  };
}
