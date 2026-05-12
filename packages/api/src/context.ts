/**
 * tRPC request context factory.
 *
 * Builds the per-request context handed to every procedure:
 *   - `headers`       — raw request headers (for re-reading auth state).
 *   - `session`       — resolved Better Auth session OR null.
 *   - `ipAddress`     — best-effort caller IP (proxy.ts forwards via
 *                       `x-forwarded-for`).
 *   - `userAgent`     — caller's UA string.
 *   - `correlationId` — `x-ogs-correlation-id` header when present,
 *                       used to thread request ↔ audit log ↔ Inngest job.
 *
 * Pure read-only resolution — actor-context wrapping (runWithActor)
 * happens inside the `tenantProcedure` middleware in `trpc.ts` so the
 * write-side extensions only fire for procedures that opt in.
 *
 * @see Blueprint §7.1.
 */
import { auth, type AuthSession } from "@ogs/auth/server";

export interface CreateTRPCContextOptions {
  /** Request headers (Fetch API `Headers`). */
  headers: Headers;
}

export interface TRPCContext {
  headers: Headers;
  session: AuthSession | null;
  ipAddress: string | null;
  userAgent: string | null;
  correlationId: string | null;
}

export async function createTRPCContext({
  headers,
}: CreateTRPCContextOptions): Promise<TRPCContext> {
  // Better Auth returns `AuthSession | null` — no normalisation needed.
  const session = await auth.api.getSession({ headers });

  return {
    headers,
    session,
    ipAddress:
      headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headers.get("x-real-ip") ?? null,
    userAgent: headers.get("user-agent") ?? null,
    correlationId: headers.get("x-ogs-correlation-id") ?? null,
  };
}
