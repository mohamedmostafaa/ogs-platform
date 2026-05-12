import type { ArcjetDecision } from "@arcjet/next";
import { NextResponse } from "next/server";

/**
 * Maps an Arcjet `denied` decision to a typed HTTP response.
 *
 * Centralises status-code + headers + message handling so every call
 * site reacts consistently. Returns `null` for allowed decisions —
 * the caller continues the normal request flow.
 *
 * Status mapping:
 *   - Rate-limit family  → 429 with `Retry-After: 60`.
 *   - Bot / Shield       → 403.
 *   - Anything else      → 403 (generic deny).
 */
export function mapDecisionToResponse(decision: ArcjetDecision): NextResponse | null {
  if (!decision.isDenied()) {
    return null;
  }

  const reason = decision.reason;

  if (reason.isRateLimit()) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again." },
      {
        status: 429,
        headers: { "Retry-After": "60" },
      },
    );
  }

  if (reason.isBot() || reason.isShield()) {
    return NextResponse.json({ error: "Request blocked by security policy." }, { status: 403 });
  }

  return NextResponse.json({ error: "Request denied." }, { status: 403 });
}

/**
 * Convenience for `proxy.ts` files using a *no-props* rule set
 * (e.g. {@link publicShield}, {@link webhookVerify}).
 *
 * For rule sets that require properties at call time
 * (e.g. {@link apiProtect} needs `userId`, {@link mediaUpload} too),
 * call `aj.protect(req, { userId: "..." })` directly and pass the
 * decision into {@link mapDecisionToResponse}.
 */
export async function protectInProxy(
  aj: { protect: (req: Request) => Promise<ArcjetDecision> },
  req: Request,
): Promise<NextResponse> {
  const decision = await aj.protect(req);
  return mapDecisionToResponse(decision) ?? NextResponse.next();
}
