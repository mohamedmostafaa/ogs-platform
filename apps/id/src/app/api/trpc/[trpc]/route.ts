/**
 * tRPC catch-all route for the Identity app.
 *
 * Mounts every procedure in `appRouter` at `/api/trpc/<path>`. The
 * request handler reads cookies + headers per-request via
 * `createTRPCContext`, so the same handler serves both the browser
 * (httpBatchLink) and server-side callers from sibling apps.
 *
 * The empty `appRouter` (Phase 01 shell) means any call right now
 * returns a "Procedure not found" error — that's the expected smoke
 * shape until Phase 02 adds the first real procedure.
 */
import { createTRPCContext } from "@ogs/api/context";
import { appRouter } from "@ogs/api/root";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

// Reads cookies on every request — never statically render.
export const dynamic = "force-dynamic";

async function handler(req: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
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
