/**
 * Server-side auth guards.
 *
 * The four building blocks every protected surface composes from:
 *   - `requireAuth(req)`     → user must be signed in.
 *   - `requireRole(role)`    → user must hold a Membership in the
 *                              active tenant with the given role.
 *   - `requireTenant(slug)`  → user must belong to the named tenant.
 *   - `requireFeature(flag)` → tenant must have the FeatureFlag on.
 *
 * Plus a tRPC-flavoured shortcut:
 *   - `trpcRequireAuth(ctx)` → throws TRPCError "UNAUTHORIZED" rather
 *                              than a plain Error.
 *
 * Each guard reads the active session via Better Auth, then consults
 * `@ogs/db` (composed client) so the same tenant-scope rules apply.
 *
 * @see Blueprint §6.8.
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
 * Resolve the current session, or throw UNAUTHENTICATED. Wraps Better
 * Auth's `api.getSession` so callers don't need to know the underlying
 * call shape.
 */
export async function requireAuth(headers: Headers): Promise<AuthSession> {
  const session = await auth.api.getSession({ headers });
  if (!session) {
    throw new AuthGuardError("UNAUTHENTICATED", "Sign-in required.");
  }
  return session;
}

/**
 * Ensure the signed-in user holds the given Role in the named tenant.
 *
 * `tenantSlug` may be omitted; callers usually resolve the tenant
 * earlier in the request lifecycle (e.g. from a subdomain or path
 * param) and pass it explicitly.
 */
export async function requireRole(
  headers: Headers,
  role: Role,
  tenantSlug?: string,
): Promise<{ session: AuthSession; tenantId: string }> {
  const session = await requireAuth(headers);
  const userId = session.user.id;

  const membership = await prisma.membership.findFirst({
    where: {
      userId,
      role,
      ...(tenantSlug ? { tenant: { slug: tenantSlug } } : {}),
    },
  });
  if (!membership) {
    throw new AuthGuardError(
      "FORBIDDEN",
      `Role "${role}" required${tenantSlug ? ` in tenant "${tenantSlug}"` : ""}.`,
    );
  }
  return { session, tenantId: membership.tenantId };
}

/**
 * Ensure the signed-in user is a member of the named tenant (any role).
 * Returns the membership row so downstream code knows which role.
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
 * Gate behind a FeatureFlag. Falls back to the global default flag
 * when no tenant-specific override exists; treats the absence of any
 * flag row as "off".
 */
export async function requireFeature(flagKey: string, tenantId: string | null): Promise<void> {
  // Tenant-specific override first, fall back to global.
  const flag =
    (tenantId
      ? await prisma.featureFlag.findUnique({ where: { key_tenantId: { key: flagKey, tenantId } } })
      : null) ??
    (await prisma.featureFlag.findUnique({
      where: { key_tenantId: { key: flagKey, tenantId: null as never } },
    }));

  if (!flag) {
    throw new AuthGuardError("FEATURE_DISABLED", `Feature "${flagKey}" is disabled.`);
  }
  // Simple DSL: "true" / "false" / "percentage:25" / "users:[..]"
  // Phase 02 will land the full evaluator; for now we treat exact
  // "true" as on, everything else as off.
  if (flag.value !== "true") {
    throw new AuthGuardError("FEATURE_DISABLED", `Feature "${flagKey}" is disabled.`);
  }
}

/**
 * tRPC convenience wrapper. tRPC's TRPCError isn't a peer dep here, so
 * we shape the error to be caught by the tRPC error formatter in
 * @ogs/api — it sees `code: "UNAUTHENTICATED"` and re-throws as
 * `TRPCError({ code: "UNAUTHORIZED" })`.
 */
export async function trpcRequireAuth(headers: Headers): Promise<AuthSession> {
  try {
    return await requireAuth(headers);
  } catch (err) {
    if (err instanceof AuthGuardError) {
      const wrapped = new Error(err.message);
      (wrapped as { code?: string }).code = "UNAUTHENTICATED";
      throw wrapped;
    }
    throw err;
  }
}

/**
 * Build an `ActorContext` from a session + tenant, ready to hand to
 * `runWithActor()`. Centralises the "session → DB context" mapping so
 * route handlers don't reinvent it.
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
