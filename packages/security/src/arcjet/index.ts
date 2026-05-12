/**
 * `@ogs/security/arcjet` — canonical Arcjet rule sets.
 *
 * Pick the right one for the surface you're guarding:
 *
 *   1. {@link publicShield}  → every public app's `proxy.ts` baseline.
 *   2. {@link authEndpoint}  → `/api/auth/**` (mounted by Identity's proxy).
 *   3. {@link authProtect}   → signup *route handler* (needs email at call time).
 *   4. {@link apiProtect}    → `/api/trpc/**`, REST handlers (needs `userId`).
 *   5. {@link mediaUpload}   → file/avatar/CV upload endpoints (needs `userId`).
 *   6. {@link webhookVerify} → payment + media webhook receivers.
 *   7. {@link aiEndpoint}    → routes that invoke a paid LLM (T18 mitigation).
 *
 * Type discipline:
 *   - {@link NoPropsArcjet} clients (`publicShield`, `authEndpoint`,
 *     `webhookVerify`) can be mounted via {@link protectInProxy} from
 *     `proxy.ts`.
 *   - Rule sets with custom characteristics (`apiProtect`, `mediaUpload`,
 *     `aiEndpoint`, `authProtect`) MUST be invoked from a route handler
 *     with `aj.protect(req, { userId|email })`. Passing them to
 *     `protectInProxy` is a compile error.
 *
 * @see SECURITY.md §6 — the canonical reference for these rules.
 */
export { aiEndpoint } from "./ai-endpoint";
export { apiProtect } from "./api-protect";
export { authEndpoint } from "./auth-endpoint";
export { authProtect } from "./auth-protect";
export { arcjetMode, getArcjetKey } from "./env";
export { mediaUpload } from "./media-upload";
export { mapDecisionToResponse, type NoPropsArcjet, protectInProxy } from "./protect";
export { publicShield } from "./public-shield";
export { webhookVerify } from "./webhook-verify";
