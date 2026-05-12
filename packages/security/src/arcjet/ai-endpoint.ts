import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";

import { arcjetMode, getArcjetKey } from "./env";

/**
 * `aiEndpoint` — Arcjet rule set for routes that invoke a paid LLM.
 *
 * Threat T18 in `SECURITY.md`: AI cost spike via abusive prompts.
 * A single bad actor can burn hundreds of dollars in a minute by
 * looping calls to `generateText` / `streamText` endpoints.
 *
 * Layered defence:
 *   - Shield (exploit signatures + prompt-injection signature
 *     detection where available).
 *   - Strict bot detection (LLM endpoints are never crawled).
 *   - Token bucket per user — generous enough for a real
 *     conversation, tight enough to make grinding uneconomical:
 *     20-token capacity, refill 2/min (≈ 120 calls/hr at steady
 *     state). Tuned per-tenant via FeatureFlag in Phase 06.
 *
 * Designed to be called from the API route handler, NOT
 * `proxy.ts` — characteristic `userId` is only knowable after
 * authentication.
 *
 * @example  (inside a route handler)
 *   const decision = await aiEndpoint.protect(req, { userId });
 *   const denied = mapDecisionToResponse(decision);
 *   if (denied) return denied;
 *
 * @see SECURITY.md §6.2 (T18).
 */
export const aiEndpoint = arcjet({
  key: getArcjetKey(),
  characteristics: ["userId"],
  rules: [
    shield({ mode: arcjetMode() }),
    detectBot({
      mode: arcjetMode(),
      allow: [],
    }),
    tokenBucket({
      mode: arcjetMode(),
      refillRate: 2,
      interval: 60, // seconds
      capacity: 20,
    }),
  ],
});
