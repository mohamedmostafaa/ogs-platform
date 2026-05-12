/**
 * Root tRPC router for the OGS platform.
 *
 * Phase 01 ships this as an EMPTY router — the surface compiles, the
 * route handler mounts, the typed React hooks are inferable. The first
 * real procedure (`identity.me`) lands in Phase 02 once Better Auth's
 * Email/OTP UI is in place.
 *
 * Pattern for adding routers (Phase 02+):
 *
 *   import { identityRouter } from "./routers/identity";
 *   export const appRouter = router({
 *     identity: identityRouter,
 *     careers: careersRouter,
 *     ...
 *   });
 *
 * @see Blueprint §7.6.
 */
import { router } from "./trpc";

export const appRouter = router({});

/**
 * Exported type — consumed by the browser client (`client.tsx`) and the
 * server-side caller. The actual router object is not safe to import
 * from the browser (pulls in `@ogs/db`); use this type alone there.
 */
export type AppRouter = typeof appRouter;
