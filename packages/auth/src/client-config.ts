/**
 * Per-app browser auth client factory.
 *
 * Each app (Identity, Careers, Academy, …) mounts its own
 * `createAuthClient` so React components can call
 * `authClient.signIn`, `authClient.useSession()`, etc.
 *
 * Cross-app SSO: every sibling app's baseURL points at
 * `id.ogs-tc.com`; only Identity hosts the server-side handler. The
 * other apps are pure OIDC clients consuming sessions issued by
 * Identity.
 *
 * Client plugins mirror the server-side plugin set:
 *   - `emailOTPClient`       — `signIn.emailOtp`, `sendVerificationOtp`.
 *   - `twoFactorClient`      — `twoFactor.enable`, `twoFactor.verify`,
 *                              `twoFactor.getBackupCodes`.
 *   - `genericOAuthClient`   — `signIn.oauth2` for the OIDC clients in
 *                              the 7 sibling apps (Careers, Academy, …).
 *
 * @see Blueprint §6.4, §6.5.
 */
import { createAuthClient as createBetterAuthClient } from "better-auth/react";
import { emailOTPClient, genericOAuthClient, twoFactorClient } from "better-auth/client/plugins";

export interface OgsAuthClientOptions {
  /**
   * Absolute base URL of the Identity app (the OIDC provider).
   * In production: `https://id.ogs-tc.com`.
   * In dev:        `http://localhost:3000`.
   */
  baseURL?: string;
}

/**
 * Create a browser auth client. Call once per app at module scope and
 * re-export the result; React components import `authClient` from your
 * app's `lib/auth-client.ts`.
 */
export function createOgsAuthClient(opts: OgsAuthClientOptions = {}) {
  return createBetterAuthClient({
    baseURL:
      opts.baseURL ??
      // Per-app override — set in the host app's env.
      process.env.NEXT_PUBLIC_AUTH_URL ??
      // SSR default for the Identity host itself.
      process.env.BETTER_AUTH_URL ??
      // Local-dev default.
      "http://localhost:3000",
    plugins: [emailOTPClient(), twoFactorClient(), genericOAuthClient()],
  });
}

export type OgsAuthClient = ReturnType<typeof createOgsAuthClient>;
