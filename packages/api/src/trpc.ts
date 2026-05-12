/**
 * tRPC v11 initialisation — context, transformer, error formatter,
 * and the three procedure tiers OGS code uses:
 *
 *   - `publicProcedure`    → no session required. Use sparingly.
 *   - `protectedProcedure` → session required (throws UNAUTHORIZED).
 *   - `tenantProcedure`    → session + tenant membership. Enforces a
 *                            Zod-validated `tenantSlug` at the base
 *                            input level (no caller can omit it),
 *                            wraps the resolver in `runWithActor` so
 *                            the audit + tenant-scope Prisma extensions
 *                            fire on every write.
 *
 * Role-restricted procedures (Phase 02+) compose
 * `tenantProcedure.use(requireRoleMiddleware(role))`.
 *
 * Error mapping (`errorFormatter`):
 *   - `ZodError` → typed `flattenError()` so clients can render
 *     per-field errors.
 *   - `AuthGuardError` codes → matching tRPC error codes
 *     (UNAUTHENTICATED→UNAUTHORIZED, FORBIDDEN/TENANT_MISMATCH/
 *     FEATURE_DISABLED→FORBIDDEN).
 *
 * @see Blueprint §7.1, SECURITY.md Gates 1–3.
 */
import { AuthGuardError, requireTenant } from "@ogs/auth/guards";
import { runWithActor, type ActorContext } from "@ogs/db";
import { TRPCError, initTRPC } from "@trpc/server";
import superjson from "superjson";
import { ZodError, z } from "zod";

import type { TRPCContext } from "./context";

/**
 * Map an `AuthGuardError.code` to the corresponding tRPC error code.
 * Exhaustive over the union — TypeScript flags any new code added
 * upstream that lacks a branch here.
 */
function mapAuthCodeToTRPC(code: AuthGuardError["code"]): "UNAUTHORIZED" | "FORBIDDEN" {
  switch (code) {
    case "UNAUTHENTICATED":
      return "UNAUTHORIZED";
    case "FORBIDDEN":
    case "TENANT_MISMATCH":
    case "FEATURE_DISABLED":
      return "FORBIDDEN";
  }
}

const t = initTRPC.context<TRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        /** Flattened Zod field errors when the cause is a ZodError. */
        zodError: error.cause instanceof ZodError ? z.flattenError(error.cause) : null,
      },
    };
  },
});

/**
 * Re-export tRPC primitives so callers don't depend on `@trpc/server`
 * directly — swapping versions stays a one-package change.
 */
export const router = t.router;
export const createCallerFactory = t.createCallerFactory;
export const middleware = t.middleware;
export const mergeRouters = t.mergeRouters;

// ---------------------------------------------------------------------------
// publicProcedure — no auth, no actor context. Use only for routes that
// genuinely don't need them (health checks, public reads). Every other
// procedure must climb the ladder.
// ---------------------------------------------------------------------------

export const publicProcedure = t.procedure;

// ---------------------------------------------------------------------------
// protectedProcedure — session required. Maps absent session → 401.
// ---------------------------------------------------------------------------

const enforceAuth = t.middleware(({ ctx, next }) => {
  if (!ctx.session) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign-in required." });
  }
  return next({
    ctx: {
      ...ctx,
      // Narrow the type — downstream procedures get a non-null session.
      session: ctx.session,
    },
  });
});

export const protectedProcedure = t.procedure.use(enforceAuth);

// ---------------------------------------------------------------------------
// tenantProcedure — session + tenant membership.
//
// Architecture invariants this enforces (SECURITY.md Gates 1–4):
//   1. Session required (composes protectedProcedure, no duplicated check).
//   2. `tenantSlug: string` MUST be present in the input — enforced by
//      the base `.input()` schema below, so per-procedure inputs that
//      extend it inherit the requirement (Zod merges).
//   3. The user MUST be a member of that tenant (requireTenant from
//      @ogs/auth/guards — IDOR-safe per Phase-A B1 fix).
//   4. The resolver runs inside `runWithActor`, so the audit Prisma
//      extension fires on every mutation it issues.
//
// Per-procedure usage:
//   const jobsRouter = router({
//     create: tenantProcedure
//       .input(z.object({ title: z.string() }))     // merges with base
//       .mutation(async ({ ctx, input }) => {
//         // ctx.tenantId + ctx.tenantRole populated; prisma writes
//         // are auto-stamped with tenantId and audited.
//       }),
//   });
// ---------------------------------------------------------------------------

/** Minimal input every tenantProcedure inherits — guarantees a slug. */
const tenantInput = z.object({
  tenantSlug: z.string().min(1, "tenantSlug is required"),
});

const enforceTenant = t.middleware(async ({ ctx, next, getRawInput }) => {
  if (!ctx.session) {
    // Defence in depth — composing on protectedProcedure (below)
    // already guarantees this, but the extra check keeps the
    // middleware's contract self-contained.
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Sign-in required." });
  }

  // Re-parse the raw input through the base schema. This is a
  // strict-shape check that runs BEFORE the per-procedure parser
  // (which extends `tenantInput`). It guarantees a non-empty
  // `tenantSlug` regardless of what the caller's procedure declares.
  const rawInput = await getRawInput();
  const parsed = tenantInput.safeParse(rawInput);
  if (!parsed.success) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "tenantProcedure requires a valid `tenantSlug` in the input.",
      cause: parsed.error,
    });
  }
  const slug = parsed.data.tenantSlug;

  try {
    const { tenantId, role } = await requireTenant(ctx.headers, slug);

    // `exactOptionalPropertyTypes` rejects `correlationId: undefined`;
    // build the actor context with conditional spreads so absent
    // values are OMITTED, never assigned as `undefined`.
    const actor: ActorContext = {
      tenantId,
      actorUserId: ctx.session.user.id,
      ...(ctx.correlationId !== null ? { correlationId: ctx.correlationId } : {}),
      ...(ctx.ipAddress !== null ? { ipAddress: ctx.ipAddress } : {}),
      ...(ctx.userAgent !== null ? { userAgent: ctx.userAgent } : {}),
    };

    return runWithActor(actor, () =>
      next({
        ctx: {
          ...ctx,
          session: ctx.session,
          tenantId,
          tenantRole: role,
        },
      }),
    );
  } catch (err) {
    if (err instanceof AuthGuardError) {
      throw new TRPCError({ code: mapAuthCodeToTRPC(err.code), message: err.message });
    }
    throw err;
  }
});

/**
 * tenantProcedure composes onto `protectedProcedure` (so the session
 * narrowing flows through automatically) and `.input(tenantInput)` to
 * make the `tenantSlug` field mandatory at the type level. Per-procedure
 * inputs that extend with `.input(z.object({ ... }))` merge with the
 * base schema rather than replace it.
 */
export const tenantProcedure = protectedProcedure.use(enforceTenant).input(tenantInput);
