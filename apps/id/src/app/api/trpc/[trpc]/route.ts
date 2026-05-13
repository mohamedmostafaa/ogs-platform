/**
 * tRPC catch-all route for the Identity app.
 *
 * Mounts every procedure in `idAppRouter` (composition of the shared
 * `appRouter` from `@ogs/api` + the id-specific `authRouter` from
 * `~/modules/auth/server/procedures`) at `/api/trpc/<path>`. The
 * request handler reads cookies + headers per-request via
 * `createTRPCContext`, so the same handler serves both the browser
 * (httpBatchLink) and server-side callers from sibling apps.
 *
 * Current namespaces:
 *   - `auth.*` — sign-in / sign-up / forgot-password / reset-password
 *     / sessions.list / sessions.revoke (Phase 02, OGS-123/124/126/127).
 *   - Future: identity/user/tenant procedures land here as new
 *     routers are composed into `idAppRouter`.
 *
 * Arcjet rate-limiting for the `auth.*` paths is handled in
 * `apps/id/src/proxy.ts` — the `isAuthTrpcPath` matcher routes them
 * through the same `authEndpoint` bucket as `/api/auth/**`.
 *
 * @see Blueprint §7 (tRPC).
 */
import { createTRPCContext } from "@ogs/api/context";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

import { idAppRouter } from "~/lib/app-router";

// Reads cookies on every request — never statically render.
export const dynamic = "force-dynamic";

async function handler(req: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: idAppRouter,
    createContext: () => createTRPCContext({ headers: req.headers }),
    onError({ error, path }) {
      // Surfaces in Vercel logs / Sentry (Phase 02). Keep terse here —
      // `error.message` already includes the procedure + reason.
      if (error.code === "INTERNAL_SERVER_ERROR") {
        console.error(`[tRPC] ${path ?? "<unknown>"} →`, error);
      }
    },
  });
}

export { handler as GET, handler as POST };
