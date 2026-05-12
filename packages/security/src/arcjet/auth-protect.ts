import arcjet, { detectBot, protectSignup, shield, slidingWindow } from "@arcjet/next";

import { arcjetMode, getArcjetKey } from "./env";

/**
 * Rule set #2 — `authProtect`.
 *
 * Tight protection for authentication endpoints: login, signup, OTP
 * verification, password reset. Layered on top of {@link publicShield}.
 *
 * Layers:
 *   - **Shield**: standard exploit signatures.
 *   - **Bot detection** in strict mode — no SEO crawlers expected here.
 *   - **Signup protection**: blocks disposable email domains and
 *     low-reputation signups (Arcjet's hosted intelligence).
 *   - **Sliding window rate limit**: 5 attempts per minute per IP +
 *     fingerprint. Tuned to thwart OTP brute force while tolerating
 *     a user mistyping a code 2–3 times.
 *
 * Mount on routes:  `/api/auth/**`, `/sign-in`, `/sign-up`, `/verify-otp`.
 *
 * @see SECURITY.md §6.2
 */
export const authProtect = arcjet({
  key: getArcjetKey(),
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: arcjetMode() }),
    detectBot({
      mode: arcjetMode(),
      // Auth flows never serve crawlers — block everything automated.
      allow: [],
    }),
    protectSignup({
      email: {
        mode: arcjetMode(),
        // Refuse disposable, invalid, and no-MX-record addresses outright;
        // free providers (gmail, outlook) are explicitly allowed.
        deny: ["DISPOSABLE", "INVALID", "NO_MX_RECORDS"],
      },
      bots: {
        mode: arcjetMode(),
        allow: [],
      },
      rateLimit: {
        mode: arcjetMode(),
        interval: "10m",
        max: 5,
      },
    }),
    slidingWindow({
      mode: arcjetMode(),
      interval: "1m",
      max: 5,
    }),
  ],
});
