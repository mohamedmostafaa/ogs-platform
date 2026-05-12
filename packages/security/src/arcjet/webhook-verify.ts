import arcjet, { shield, slidingWindow } from "@arcjet/next";

import { arcjetMode, getArcjetKey } from "./env";

/**
 * Rule set #5 — `webhookVerify`.
 *
 * Strictest rule set in the platform. Mounted on webhook receivers
 * (Stripe, Lemon Squeezy, Polar, PayMob, Bunny.net, Inngest, GitHub).
 *
 * The actual signature verification stays in the route handler (HMAC
 * comparison against the provider's signing secret) — Arcjet's job
 * here is to (a) refuse abusive callers before signature verification
 * burns CPU, and (b) shield against malformed payload exploits.
 *
 * Bot detection is intentionally **disabled** — every legitimate
 * webhook call is, by definition, a bot. Instead we lean on:
 *   - **Shield** for exploit signatures.
 *   - A loose **rate limit** (300/min/IP) so a flapping provider
 *     doesn't get banned but a malicious caller hammering the endpoint
 *     does.
 *
 * Callers should additionally enforce the provider's IP allow-list
 * (e.g. `WEBHOOK_IP_ALLOWLIST_STRIPE`) before invoking Arcjet.
 *
 * Mount on routes:  `/api/webhooks/**`.
 *
 * @see SECURITY.md §6.5
 */
export const webhookVerify = arcjet({
  key: getArcjetKey(),
  characteristics: ["ip.src"],
  rules: [
    shield({ mode: arcjetMode() }),
    slidingWindow({
      mode: arcjetMode(),
      interval: "1m",
      max: 300,
    }),
  ],
});
