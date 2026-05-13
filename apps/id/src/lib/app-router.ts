/**
 * Id-app local AppRouter — composes the shared `appRouter` (empty
 * shell for Phase 01) with id-app-specific module routers.
 *
 * Per-app composition (instead of registering modules into
 * `packages/api/src/root.ts`) preserves the architectural rule that
 * `packages/*` never depends on `apps/*`. Each app builds its own
 * router by merging the shared base with whatever modules live under
 * `apps/<x>/src/modules/<domain>/server/procedures.ts`.
 *
 * The router is consumed by:
 *   - `app/api/trpc/[trpc]/route.ts` (the fetch handler).
 *   - `lib/trpc.ts`                  (the browser hooks — typed via
 *                                     {@link IdAppRouter}).
 *
 * @see Blueprint §7.4, CODE_STANDARDS §5.
 */
import { router } from "@ogs/api/trpc";

import { authRouter } from "~/modules/auth/server/procedures";

/** Id-app router — extend this when a new module ships. */
export const idAppRouter = router({
  auth: authRouter,
});

/** Type the browser-side `trpc` proxy binds against. */
export type IdAppRouter = typeof idAppRouter;
