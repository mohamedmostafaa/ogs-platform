/**
 * Arcjet environment helpers.
 *
 * Centralises ARCJET_KEY validation so each rule set fails fast in
 * production but degrades gracefully in development (Arcjet's
 * recommended pattern — see https://docs.arcjet.com/get-started/nextjs).
 */

/**
 * Returns the Arcjet site key, throwing in production if missing.
 *
 * Development and test runs are allowed to proceed without a key —
 * Arcjet operates in "dry-run" mode and logs decisions instead of
 * enforcing them. This keeps `pnpm dev` working even when the contributor
 * has not yet provisioned an Arcjet site.
 */
export function getArcjetKey(): string {
  const key = process.env.ARCJET_KEY;
  if (key && key.length > 0) {
    return key;
  }

  // `next build` evaluates module top-levels under NODE_ENV=production
  // without env vars loaded (NEXT_PHASE=phase-production-build). Allow
  // the placeholder during build so route metadata can be collected;
  // real production requests have ARCJET_KEY set by Vercel.
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  if (process.env.NODE_ENV === "production" && !isBuild) {
    throw new Error(
      "[@ogs/security] ARCJET_KEY is required in production. " +
        "Provision a site at https://app.arcjet.com and set the env var.",
    );
  }

  // Dev/test/build fallback: a sentinel so Arcjet bootstraps in dry-run.
  return "ajkey_dev_placeholder";
}

/**
 * Arcjet enforcement mode resolver.
 *
 * Per blueprint §6 / SECURITY.md §6: preview deploys MUST run LIVE so
 * tightened rules are verified before promotion. Only local
 * development (and the build phase, where env isn't loaded) run
 * DRY_RUN.
 *
 * Resolution order:
 *   1. `VERCEL_ENV` of `production` / `preview` → LIVE.
 *   2. `NODE_ENV === "production"` AND not in build phase → LIVE.
 *   3. Everything else (dev, test, build-time route discovery) → DRY_RUN.
 */
export function arcjetMode(): "LIVE" | "DRY_RUN" {
  const vercelEnv = process.env.VERCEL_ENV;
  if (vercelEnv === "production" || vercelEnv === "preview") {
    return "LIVE";
  }
  const isBuild = process.env.NEXT_PHASE === "phase-production-build";
  if (process.env.NODE_ENV === "production" && !isBuild) {
    return "LIVE";
  }
  return "DRY_RUN";
}
