/**
 * Auth env-var resolution + validation.
 *
 * Centralises the BETTER_AUTH_* + OGS_OIDC_* keys consumed by both the
 * server (`server.ts`) and the per-app client factory
 * (`client-config.ts`). Falling back to a deterministic dev secret
 * keeps local-dev running without setup; production must override.
 */

/**
 * Read a required env var, throwing in production if missing. In
 * development the caller provides a fallback used only when the var
 * is absent.
 */
export function requiredEnv(key: string, devFallback?: string): string {
  const value = process.env[key];
  if (value && value.length > 0) {
    return value;
  }
  // `next build` evaluates module top-levels without env vars loaded
  // (NODE_ENV=production, NEXT_PHASE=phase-production-build). Allow the
  // dev fallback during build so route metadata can be collected; real
  // requests in production always have env vars set by Vercel before
  // the handler fires.
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  if (process.env.NODE_ENV === "production" && !isBuild) {
    throw new Error(`[@ogs/auth] ${key} is required in production but was not set.`);
  }
  if (devFallback === undefined) {
    throw new Error(`[@ogs/auth] ${key} is required and no devFallback was provided.`);
  }
  return devFallback;
}

/**
 * Resolve the Better Auth signing secret. Dev fallback is a deterministic
 * 64-char string so cookies survive a process restart in dev — NEVER use
 * this in production (the `requiredEnv` guard above enforces it).
 */
export function getAuthSecret(): string {
  return requiredEnv(
    "BETTER_AUTH_SECRET",
    "dev-secret-do-not-use-in-prod-dev-secret-do-not-use-in-prod-x",
  );
}

/**
 * Base URL the auth handler is reachable at. Each app passes its own
 * value via the `BETTER_AUTH_URL` env var (or it falls back to the
 * NEXT_PUBLIC_BASE_URL).
 */
export function getAuthBaseUrl(): string {
  return process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
}
