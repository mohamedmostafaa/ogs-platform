/**
 * `@ogs/security/arcjet` — five canonical Arcjet rule sets.
 *
 * Pick the right one for the surface you're guarding:
 *
 *   1. {@link publicShield}  → every public app's `proxy.ts`
 *   2. {@link authProtect}   → `/api/auth/**`, sign-in/up/OTP routes
 *   3. {@link apiProtect}    → `/api/trpc/**`, REST handlers
 *   4. {@link mediaUpload}   → file/avatar/CV upload endpoints
 *   5. {@link webhookVerify} → payment + media webhook receivers
 *
 * All rule sets share:
 *   - `getArcjetKey()` — fails fast in production, dev-friendly fallback.
 *   - `arcjetMode()`   — LIVE in production, DRY_RUN elsewhere.
 *   - `protect()`      — uniform deny → 403/429 response mapping.
 *
 * @see SECURITY.md §6 — the canonical reference for these rules.
 */
export { apiProtect } from "./api-protect";
export { authProtect } from "./auth-protect";
export { arcjetMode, getArcjetKey } from "./env";
export { mediaUpload } from "./media-upload";
export { mapDecisionToResponse, protectInProxy } from "./protect";
export { publicShield } from "./public-shield";
export { webhookVerify } from "./webhook-verify";
