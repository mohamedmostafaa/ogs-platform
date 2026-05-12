/**
 * `@ogs/security` — shared security primitives for the OGS platform.
 *
 * Surfaces:
 *   - Arcjet rule sets + helpers — `@ogs/security/arcjet`
 *
 * Future additions (Phase 1+):
 *   - AES-256-GCM envelope encryption with key rotation
 *   - HMAC signature verification helpers for webhook receivers
 *   - IP allow-list checker
 */
export * from "./arcjet/index";
