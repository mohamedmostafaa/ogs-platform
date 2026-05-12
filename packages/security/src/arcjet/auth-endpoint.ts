import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/next";

import { arcjetMode, getArcjetKey } from "./env";

/**
 * `authEndpoint` — Arcjet rule set for `/api/auth/**` (sign-in,
 * sign-up, OTP verification, password reset).
 *
 * This is what gets mounted on `apps/id/src/proxy.ts` for the auth
 * surface — distinct from {@link publicShield} which covers
 * everything else. Per SECURITY.md §6.2 (mitigation for threat T7
 * — OTP brute force), auth routes need:
 *
 *   - Shield (exploit signatures).
 *   - Strict bot detection — no SEO crawlers belong here.
 *   - Sliding-window rate limit, tight enough to thwart OTP brute
 *     force while tolerating a user mistyping their code 2–3 times.
 *     Blueprint §6.2 baseline: 10/min/IP + 30/10min/IP for OTP-class
 *     endpoints. We use 10/min as the inner window; the route handler
 *     should layer an additional per-account 5/10min limit on top.
 *
 * The signup-specific protection (disposable-email blocking,
 * signup-rate-limit) lives in {@link authProtect} and is called by
 * the signup *route handler* — `protectSignup` requires the candidate
 * email value at protect time, which isn't reachable from `proxy.ts`.
 *
 * @see SECURITY.md §6.2.
 */
export const authEndpoint = arcjet({
  key: getArcjetKey(),
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: arcjetMode() }),
    detectBot({
      mode: arcjetMode(),
      // Auth flows never serve crawlers — block everything automated.
      allow: [],
    }),
    slidingWindow({
      mode: arcjetMode(),
      interval: "1m",
      max: 10,
    }),
  ],
});
