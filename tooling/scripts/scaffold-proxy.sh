#!/usr/bin/env bash
#
# OGS Platform — generate apps/<name>/proxy.ts mounting Arcjet on all 8 apps.
#
# Idempotent: re-runs overwrite the file with the canonical template.
#
# @see SECURITY.md §6.3 and TASKS OGS-028.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

APPS=(id careers skillpass academy eco enterprise admin corporate)

for name in "${APPS[@]}"; do
  dir="apps/${name}"

  echo "[proxy] writing ${dir}/proxy.ts"
  cat > "${dir}/proxy.ts" <<'EOF'
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
EOF
done

echo "[proxy] DONE for ${#APPS[@]} apps."
