/**
 * Identity-app `proxy.ts` — runs before every matched request.
 *
 * Unlike the other 7 apps (which mount only `publicShield`), Identity
 * hosts `/api/auth/**` AND relays the credential-bearing flows
 * through tRPC at `/api/trpc/auth.*`. Both surfaces dispatch into the
 * tight `authEndpoint` bucket so brute-force on either path is
 * rate-limited identically (T7 mitigation per SECURITY.md §6.2).
 *
 * Path dispatch:
 *   - `/api/auth/**` (Better Auth catch-all) → {@link authEndpoint}.
 *     Exception: `get-session` is a high-frequency read; it falls
 *     through to {@link publicShield} so legitimate dashboards on
 *     shared NAT don't get starved.
 *   - `/api/trpc/*` whose procedure list includes any `auth.*`
 *     procedure → {@link authEndpoint}. Covers single-call links
 *     (`/api/trpc/auth.signIn`) AND batch links
 *     (`/api/trpc/auth.signIn,auth.signUp?batch=1`).
 *   - Everything else → {@link publicShield} baseline.
 *
 * In Next.js 16 the file MUST be named `proxy.ts` (the historical
 * `middleware.ts` name was retired).
 */
import { authEndpoint, protectInProxy, publicShield } from "@ogs/security/arcjet";
import type { NextRequest } from "next/server";

/**
 * Match `/api/trpc/<proc>[,<proc>]*` paths that include any auth
 * mutation. Used to fan tRPC auth traffic into the same Arcjet bucket
 * that gates `/api/auth/**`.
 *
 * Returns `true` when at least one path-segment procedure starts with
 * `auth.` (e.g. `auth.signIn`, `auth.signUp`, `auth.forgotPassword`,
 * `auth.resetPassword`, `auth.sessions.revoke`).
 */
function isAuthTrpcPath(pathname: string): boolean {
  const prefix = "/api/trpc/";
  if (!pathname.startsWith(prefix)) return false;
  const list = pathname.slice(prefix.length);
  if (list.length === 0) return false;
  return list.split(",").some((proc) => proc.startsWith("auth."));
}

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

  // tRPC auth procedures share the bucket with /api/auth/** so the
  // modules/auth tRPC flow can't bypass the rate-limit that used to
  // gate the legacy server-action path. Identified by the
  // security-engineer review on this PR — Gate 9 (T7 mitigation).
  if (isAuthTrpcPath(pathname)) {
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
