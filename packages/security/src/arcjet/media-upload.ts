import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/next";

import { arcjetMode, getArcjetKey } from "./env";

/**
 * Rule set #4 — `mediaUpload`.
 *
 * Hardened protection for endpoints that accept user-uploaded files
 * (CV PDFs, profile photos, course materials, OGS Academy lessons that
 * deposit into Bunny.net Stream and Cloudflare R2).
 *
 * Layers:
 *   - **Shield**: exploit signatures (a malformed upload is a classic
 *     vector for content-type confusion attacks).
 *   - **Bot detection**: strict.
 *   - **Fixed window rate limit**: 20 uploads / hour per user.
 *     The point isn't to stop legitimate batch uploads — it's to make
 *     storage-exhaustion attacks economically unattractive.
 *
 * Mount on routes:  `/api/uploads/**`, `/api/cv-upload`, `/api/avatars`.
 *
 * @see SECURITY.md §6.4
 */
export const mediaUpload = arcjet({
  key: getArcjetKey(),
  characteristics: ["userId", "ip.src"],
  rules: [
    shield({ mode: arcjetMode() }),
    detectBot({
      mode: arcjetMode(),
      allow: [],
    }),
    // Sliding window avoids the fixed-window boundary-doubling issue
    // (40 uploads in 1 s across the minute-boundary).
    slidingWindow({
      mode: arcjetMode(),
      interval: "1h",
      max: 20,
    }),
  ],
});
