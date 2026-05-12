import arcjet, { detectBot, shield } from "@arcjet/next";

import { arcjetMode, getArcjetKey } from "./env";

/**
 * Rule set #1 — `publicShield`.
 *
 * Baseline protection mounted on every app's `proxy.ts`. Covers:
 *   - Arcjet **Shield**: SQL injection, XSS, common exploit signatures.
 *   - **Bot detection**: blocks automated scrapers and headless tooling,
 *     while explicitly allowing legitimate crawlers (Google, Bing,
 *     LinkedIn — important for Careers SEO) and monitoring tooling.
 *
 * Use this for pages users browse normally. For login / OTP, layer
 * {@link authProtect} on top.
 *
 * @see SECURITY.md §6.1
 */
export const publicShield = arcjet({
  key: getArcjetKey(),
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: arcjetMode() }),
    detectBot({
      mode: arcjetMode(),
      allow: [
        // SEO-relevant crawlers — Careers + Corporate sites depend on these.
        "CATEGORY:SEARCH_ENGINE",
        // Uptime + observability probes (Vercel monitoring, Sentry, etc.).
        "CATEGORY:MONITOR",
        // Social link unfurlers (LinkedIn job shares, WhatsApp previews).
        "CATEGORY:PREVIEW",
      ],
    }),
  ],
});
