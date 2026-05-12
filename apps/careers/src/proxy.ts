/**
 * Next.js 16 `proxy.ts` — runs before every matched request.
 *
 * Mounts the {@link publicShield} Arcjet rule set: every page in this
 * app gets baseline protection (Shield + bot detection) before the
 * route handler runs. Auth endpoints, API routes, and uploads layer
 * tighter rule sets on top via per-route guards.
 *
 * In Next.js 16 the file MUST be named `proxy.ts` (the historical
 * `middleware.ts` name was retired — see Next 16 migration notes).
 */
import { protectInProxy, publicShield } from "@ogs/security/arcjet";
import type { NextRequest } from "next/server";

export default async function proxy(req: NextRequest) {
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
