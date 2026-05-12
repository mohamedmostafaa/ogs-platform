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

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "[@ogs/security] ARCJET_KEY is required in production. " +
        "Provision a site at https://app.arcjet.com and set the env var.",
    );
  }

  // Dev/test fallback: return a sentinel so Arcjet bootstraps in dry-run.
  return "ajkey_dev_placeholder";
}

/**
 * Arcjet enforcement mode resolver.
 *
 * - Production: `LIVE` — decisions actually block traffic.
 * - Preview / staging / dev: `DRY_RUN` — decisions are logged but not enforced,
 *   so contributors can iterate without locking themselves out.
 *
 * Override per call site when you genuinely want LIVE in preview
 * (e.g. when verifying a tightened rule before promoting to main).
 */
export function arcjetMode(): "LIVE" | "DRY_RUN" {
  return process.env.NODE_ENV === "production" ? "LIVE" : "DRY_RUN";
}
