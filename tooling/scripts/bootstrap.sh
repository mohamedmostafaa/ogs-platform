#!/usr/bin/env bash
#
# OGS Platform — bootstrap script.
#
# Idempotent: re-running on an existing clone is safe.
# Brings a fresh clone to "pnpm dev should work" provided that .env.local exists
# with at minimum DATABASE_URL + DIRECT_URL (Neon dev branch) populated.
#
# Usage:
#   ./tooling/scripts/bootstrap.sh
#
# @see Blueprint §29.15

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

# ---- 1. Node + pnpm preflight ------------------------------------------------
NODE_REQUIRED=24
NODE_CURRENT_MAJOR="$(node --version 2>/dev/null | sed 's/v//' | cut -d. -f1)"
if [ -z "${NODE_CURRENT_MAJOR:-}" ] || [ "${NODE_CURRENT_MAJOR}" -lt "${NODE_REQUIRED}" ]; then
  echo "[bootstrap] Node ${NODE_REQUIRED}+ required (have v${NODE_CURRENT_MAJOR:-none})."
  echo "[bootstrap] Install via 'fnm install 24 && fnm use' or your preferred Node manager."
  exit 1
fi

PNPM_REQUIRED=11
PNPM_CURRENT_MAJOR="$(pnpm --version 2>/dev/null | cut -d. -f1)"
if [ -z "${PNPM_CURRENT_MAJOR:-}" ] || [ "${PNPM_CURRENT_MAJOR}" -lt "${PNPM_REQUIRED}" ]; then
  echo "[bootstrap] pnpm ${PNPM_REQUIRED}+ required (have ${PNPM_CURRENT_MAJOR:-none})."
  echo "[bootstrap] Run 'corepack enable && corepack prepare pnpm@11 --activate'."
  exit 1
fi

# ---- 2. .env.local check -----------------------------------------------------
if [ ! -f .env.local ]; then
  echo "[bootstrap] WARNING: .env.local not found."
  echo "[bootstrap]          Copy .env.example to .env.local and fill the values."
  echo "[bootstrap]          See docs/runbooks/local-dev.md."
fi

# ---- 3. Install --------------------------------------------------------------
echo "[bootstrap] pnpm install --frozen-lockfile (or initial install if no lockfile)..."
if [ -f pnpm-lock.yaml ]; then
  pnpm install --frozen-lockfile
else
  pnpm install
fi

# ---- 4. Stack currency check -------------------------------------------------
echo "[bootstrap] pnpm version-check..."
pnpm version-check || {
  echo "[bootstrap] Stack-currency check returned non-zero. STOP and open an ADR before continuing."
  exit 2
}

# ---- 5. Prisma generate ------------------------------------------------------
if [ -f packages/db/prisma/schema/_datasource.prisma ]; then
  echo "[bootstrap] pnpm db:generate..."
  pnpm db:generate
fi

# ---- 6. Husky hook install ---------------------------------------------------
if [ -d .husky ]; then
  echo "[bootstrap] Husky hooks ready."
fi

cat <<'NEXT'

[bootstrap] DONE.

Next steps:
  1. Verify .env.local has every variable from .env.example.
  2. Run database migration:        pnpm db:migrate
  3. Bring up the platform:         pnpm dev
  4. Open the local URLs in mprocs (id: 3000, careers: 3001, ... corporate: 3007).

NEXT
