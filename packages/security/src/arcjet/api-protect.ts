import arcjet, { detectBot, shield, tokenBucket } from "@arcjet/next";

import { arcjetMode, getArcjetKey } from "./env";

/**
 * Rule set #3 — `apiProtect`.
 *
 * Standard protection for application API surfaces: tRPC procedures,
 * REST handlers, server actions. Designed for authenticated traffic
 * where the rate limit is per-user not per-IP — callers should set
 * the characteristic to the user id (see `protectApi(req, { userId })`).
 *
 * Layers:
 *   - **Shield**: exploit signatures.
 *   - **Bot detection**: strict — APIs are not crawled.
 *   - **Token bucket**: 60 tokens, refill 10/sec — generous enough for
 *     a chatty dashboard while throttling scrape attempts.
 *
 * Mount on routes:  `/api/trpc/**`, `/api/**` (non-webhook, non-auth).
 *
 * @see SECURITY.md §6.3
 */
export const apiProtect = arcjet({
  key: getArcjetKey(),
  // Key on the authenticated user when available; fall back to IP.
  characteristics: ["userId", "ip.src"],
  rules: [
    shield({ mode: arcjetMode() }),
    detectBot({
      mode: arcjetMode(),
      allow: ["CATEGORY:MONITOR"],
    }),
    tokenBucket({
      mode: arcjetMode(),
      refillRate: 10,
      interval: 1, // seconds
      capacity: 60,
    }),
  ],
});
