/**
 * Arcjet decision → HTTP response mapping + proxy helper.
 *
 * Every rule set funnels denies through `mapDecisionToResponse` so we
 * get one place to map Arcjet's reason taxonomy to status codes. The
 * `protectInProxy` helper is the convenience used by `proxy.ts` files
 * for rule sets that need no per-request properties.
 */
import type { ArcjetDecision, ArcjetNext } from "@arcjet/next";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * No-props ArcjetNext client — has no custom characteristics, so it can
 * be called with `aj.protect(req)` alone. {@link publicShield},
 * {@link authEndpoint}, {@link webhookVerify}, and {@link aiEndpoint}
 * are typed as this. {@link apiProtect} and {@link mediaUpload} are
 * NOT — they require `{ userId }` at protect time and must be called
 * from a route handler, never from `proxy.ts`.
 */
// `ArcjetNext<{}>` is the canonical "no required props" shape — using
// `Record<string, never>` would make MaybeProperties require an empty
// `{}` arg explicitly. Disable the ESLint rule for the same reason.

export type NoPropsArcjet = ArcjetNext<{}>;

/**
 * Maps an Arcjet `denied` decision to a typed HTTP response.
 *
 * Status mapping:
 *   - Rate-limit family  → 429 with `Retry-After: 60`.
 *   - Email reason       → 400 (signup form field error).
 *   - Sensitive info     → 400 (PII redaction failure surfaces to user).
 *   - Bot / Shield       → 403.
 *   - Anything else      → 403 (generic deny).
 *
 * Returns `null` for allowed decisions — caller continues normally.
 */
export function mapDecisionToResponse(decision: ArcjetDecision): NextResponse | null {
  if (!decision.isDenied()) {
    return null;
  }

  const reason = decision.reason;

  if (reason.isRateLimit()) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down and try again." },
      { status: 429, headers: { "Retry-After": "60" } },
    );
  }

  if (reason.isEmail()) {
    return NextResponse.json(
      { error: "Email address rejected. Use a non-disposable, valid email." },
      { status: 400 },
    );
  }

  if (reason.isSensitiveInfo()) {
    return NextResponse.json(
      { error: "Request contains disallowed sensitive information." },
      { status: 400 },
    );
  }

  if (reason.isBot() || reason.isShield()) {
    return NextResponse.json({ error: "Request blocked by security policy." }, { status: 403 });
  }

  return NextResponse.json({ error: "Request denied." }, { status: 403 });
}

/**
 * Run a no-props rule set inside `proxy.ts`.
 *
 * Type-restricted to {@link NoPropsArcjet}: trying to mount
 * {@link apiProtect} or {@link mediaUpload} here is a compile error,
 * which prevents the silent "rate-limit keys by undefined" footgun.
 */
export async function protectInProxy(aj: NoPropsArcjet, req: NextRequest): Promise<NextResponse> {
  const decision = await aj.protect(req);
  return mapDecisionToResponse(decision) ?? NextResponse.next();
}
