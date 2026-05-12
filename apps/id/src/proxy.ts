/**
 * Identity-app `proxy.ts` — runs before every matched request.
 *
 * Unlike the other 7 apps (which mount only `publicShield`), Identity
 * hosts `/api/auth/**` so it dispatches by path:
 *
 *   - `/api/auth/**` → {@link authEndpoint} (Shield + strict bot
 *     detection + 10/min/IP sliding window — T7 OTP brute-force
 *     mitigation per SECURITY.md §6.2).
 *   - Everything else → {@link publicShield} baseline.
 *
 * In Next.js 16 the file MUST be named `proxy.ts` (the historical
 * `middleware.ts` name was retired).
 */
import { authEndpoint, protectInProxy, publicShield } from "@ogs/security/arcjet";
import type { NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
  // Path-based dispatch — `pathname` is parsed from `req.url` directly
  // because edge-runtime `req.nextUrl` requires a NextRequest with
  // populated URL state and would change behaviour under tests.
  const pathname = new URL(req.url).pathname;

  if (pathname.startsWith("/api/auth")) {
    // `get-session` is a high-frequency read (clients poll on tab
    // focus, SWR-revalidate) that doesn't accept credentials.
    // Routing it through the strict 10/min/IP bucket would starve
    // legitimate dashboards under shared NAT. Credential-bearing
    // sub-paths (sign-in, sign-up, callback/*, verify-otp) keep the
    // tight bucket.
    if (pathname === "/api/auth/get-session") {
      return protectInProxy(publicShield, req);
    }
    return protectInProxy(authEndpoint, req);
  }

  return protectInProxy(publicShield, req);
}

/**
 * Matcher excludes Next.js internals, the favicon, and the public
 * `_next/static` asset paths so we don't burn an Arcjet check on
 * every chunk request.
 */
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
