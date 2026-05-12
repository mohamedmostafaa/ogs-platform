/**
 * Per-tenant brand-token resolver.
 *
 * **Phase 01 stub.** Returns a hardcoded default. Phase 02 swaps the
 * body for a `FeatureFlag.findFirst` lookup keyed on `tenantId`, with
 * defaults coming from `AppSettings`.
 *
 * Each tenant can override:
 *   - `logoUrl`     — public URL of their logomark (rendered in the
 *                     global header).
 *   - `accentHue`   — 0–360 HSL hue rotation applied to the brand
 *                     accent color. Tenant brand stays subordinate to
 *                     OGS's neutral grey palette — only the accent
 *                     spot color shifts.
 *
 * Callers should NOT cache the result indefinitely — Phase 02 will
 * route this through React's `cache()` per request when it hits the
 * database.
 *
 * @see Blueprint §3.5.3.
 */

export interface BrandTokens {
  /** Public URL of the tenant's logo, or null to fall back to the OGS mark. */
  logoUrl: string | null;
  /** Hue rotation 0–360 for the accent color, or null for the default. */
  accentHue: number | null;
  /** Human display name (header alt-text, page title prefix). */
  displayName: string;
}

const PLATFORM_DEFAULT: BrandTokens = {
  logoUrl: null,
  accentHue: null,
  displayName: "OGS",
};

/**
 * Resolve the brand tokens for a given tenant.
 *
 * Phase 01: always returns the platform default.
 * Phase 02: reads `FeatureFlag.value` (JSON-encoded BrandTokens) for the
 * key `brand.tokens` scoped to the tenantId; falls back to platform
 * default when no row exists.
 */
export function resolveBrand(_tenantId?: string | null): BrandTokens {
  return PLATFORM_DEFAULT;
}
