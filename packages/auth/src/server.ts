/**
 * Better Auth server instance — single source of truth for OGS auth.
 *
 * Wires Better Auth 1.6 to:
 *   - `@ogs/db` via the Prisma adapter (uses our composed client, so
 *     tenant-scope / soft-delete / audit extensions all participate).
 *   - Email-and-password (with Nodemailer flow added in Phase 02).
 *   - Social providers (Google / GitHub / LinkedIn) — wired here,
 *     credentials read from env; provider not enabled unless both
 *     client-id + client-secret are present.
 *   - `@better-auth/oauth-provider` so id.ogs-tc.com can act as an
 *     OIDC provider for the other 7 apps (cross-domain SSO).
 *
 * Mounted by the host app at `/api/auth/[...all]`.
 *
 * @see Blueprint §6.
 */
import { oauthProvider } from "@better-auth/oauth-provider";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { jwt } from "better-auth/plugins";

import { prisma } from "@ogs/db";

import { getAuthBaseUrl, getAuthSecret } from "./env";
import { provisionUser } from "./provisioning";

/**
 * Optionally include a social provider only when both credentials are
 * configured. Keeps `pnpm dev` working without filling every OAuth slot.
 */
function maybeSocialProvider<T extends Record<string, unknown>>(
  clientIdKey: string,
  clientSecretKey: string,
  builder: (id: string, secret: string) => T,
): T | undefined {
  const id = process.env[clientIdKey];
  const secret = process.env[clientSecretKey];
  if (id && secret) return builder(id, secret);
  return undefined;
}

const socialProviders = {
  google: maybeSocialProvider(
    "BETTER_AUTH_GOOGLE_CLIENT_ID",
    "BETTER_AUTH_GOOGLE_CLIENT_SECRET",
    (clientId, clientSecret) => ({ clientId, clientSecret }),
  ),
  github: maybeSocialProvider(
    "BETTER_AUTH_GITHUB_CLIENT_ID",
    "BETTER_AUTH_GITHUB_CLIENT_SECRET",
    (clientId, clientSecret) => ({ clientId, clientSecret }),
  ),
  linkedin: maybeSocialProvider(
    "BETTER_AUTH_LINKEDIN_CLIENT_ID",
    "BETTER_AUTH_LINKEDIN_CLIENT_SECRET",
    (clientId, clientSecret) => ({ clientId, clientSecret }),
  ),
};

/**
 * The Better Auth instance. Exports:
 *   - `auth.handler`    — request handler for `/api/auth/[...all]`.
 *   - `auth.api.*`      — server-side calls (getSession, signInEmail, ...).
 *   - inferred `Session` and `User` types via `typeof auth.$Infer.*`.
 */
export const auth = betterAuth({
  secret: getAuthSecret(),
  baseURL: getAuthBaseUrl(),
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    // Email verification + password reset flows wire to @ogs/email in
    // Phase 02 — at that point we set sendVerificationEmail + similar.
    autoSignIn: true,
    requireEmailVerification: false,
  },
  socialProviders: Object.fromEntries(
    Object.entries(socialProviders).filter(([, v]) => v !== undefined),
  ) as Record<string, { clientId: string; clientSecret: string }>,
  databaseHooks: {
    /**
     * Post-signup provisioning. Better Auth fires this AFTER it creates
     * the User row, but BEFORE the response returns — so the Worker
     * + Membership exist by the time the client receives a session.
     * Idempotent (re-running on an already-provisioned user is a no-op).
     *
     * Wraps the work in runWithActor so the writes are audited (Gate 4).
     */
    user: {
      create: {
        after: async (user: { id: string }) => {
          await provisionUser({ userId: user.id });
        },
      },
    },
  },
  plugins: [
    /**
     * JWT plugin — REQUIRED by oauthProvider so it can mint ID tokens.
     * Defaults are fine (Ed25519 keys auto-rotated; signing secret
     * derived from BETTER_AUTH_SECRET).
     */
    jwt(),
    /**
     * OIDC provider — id.ogs-tc.com issues tokens that the 7 sibling
     * apps consume. Per-tenant clients are seeded via `OAuthApplication`
     * rows (created from the admin UI or the provisioning helper).
     */
    oauthProvider({
      loginPage: "/sign-in",
      consentPage: "/oauth/consent",
      metadata: {
        issuer: getAuthBaseUrl(),
      },
    }),
    /**
     * Next.js helpers — auto-injects Set-Cookie when returning from
     * server actions so the session cookie sticks without manual
     * plumbing in every action.
     */
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
export type AuthUser = typeof auth.$Infer.Session.user;
