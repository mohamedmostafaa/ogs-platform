/**
 * `@ogs/auth` — root barrel.
 *
 * Sub-paths:
 *   - `@ogs/auth/server`   — Better Auth instance (server-only).
 *   - `@ogs/auth/client`   — Browser auth client factory.
 *   - `@ogs/auth/guards`   — requireAuth / requireRole / requireTenant / requireFeature.
 *   - `@ogs/auth/provisioning` — post-signup provisioning helper.
 *
 * **Do NOT import this root file from client components** — it pulls
 * in `server.ts`, which depends on `@ogs/db`. Use the sub-path that
 * matches your environment.
 */
export { auth, type AuthSession, type AuthUser } from "./server";
export {
  createOgsAuthClient,
  type OgsAuthClient,
  type OgsAuthClientOptions,
} from "./client-config";
export {
  AuthGuardError,
  actorFromSession,
  requireAuth,
  requireFeature,
  requireRole,
  requireTenant,
  trpcRequireAuth,
} from "./guards";
export { provisionUser, type ProvisionUserInput, type ProvisionUserResult } from "./provisioning";
