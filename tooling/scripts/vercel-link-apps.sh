#!/usr/bin/env bash
#
# OGS Platform — link the 8 apps to Vercel + set rootDirectory + connect git.
#
# Prereqs:
#   - `vercel login` already done.
#   - VERCEL_TOKEN env var set (read from
#     ~/Library/Application Support/com.vercel.cli/auth.json).
#   - Apps must have `apps/<name>/vercel.json` with monorepo build/install.
#
# What this does for each app (skips if already linked):
#   1. Writes apps/<name>/vercel.json (monorepo install + filtered turbo build).
#   2. `vercel link` non-interactively, naming the project `ogs-<name>`.
#   3. PATCH project via API to set rootDirectory=apps/<name> + framework=nextjs.
#   4. Connects the project to github.com/mohamedmostafaa/ogs-platform.
#
# Deploys are triggered automatically by the subsequent `git push origin main`.
#
# @see Blueprint §15 (Vercel) and TASKS OGS-015.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

VERCEL_TOKEN="$(python3 -c "import json,os;d=json.load(open(os.path.expanduser('~/Library/Application Support/com.vercel.cli/auth.json')));print(d['token'])")"
GITHUB_REPO="https://github.com/mohamedmostafaa/ogs-platform"

# All apps; `id` is already linked but the script is idempotent.
APPS=(id careers skillpass academy eco enterprise admin corporate)

for name in "${APPS[@]}"; do
  dir="apps/${name}"
  project="ogs-${name}"

  echo
  echo "═══════════════════════════════════════════════════════════════"
  echo "[vercel] ${project}  (root: ${dir})"
  echo "═══════════════════════════════════════════════════════════════"

  # ---- 1. Write per-app vercel.json ------------------------------------------
  if [ ! -f "${dir}/vercel.json" ]; then
    cat > "${dir}/vercel.json" <<EOF
{
  "\$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && pnpm turbo build --filter=@ogs/${name}...",
  "installCommand": "cd ../.. && pnpm install --frozen-lockfile",
  "framework": "nextjs",
  "outputDirectory": ".next"
}
EOF
    echo "[vercel] wrote ${dir}/vercel.json"
  fi

  # ---- 2. Link (idempotent) --------------------------------------------------
  if [ ! -f "${dir}/.vercel/project.json" ]; then
    ( cd "${dir}" && pnpm dlx vercel@latest link --yes --project "${project}" )
  else
    echo "[vercel] already linked."
  fi

  # ---- 3. Set rootDirectory via API ------------------------------------------
  PROJECT_ID="$(python3 -c "import json;print(json.load(open('${dir}/.vercel/project.json'))['projectId'])")"
  TEAM_ID="$(python3 -c "import json;print(json.load(open('${dir}/.vercel/project.json'))['orgId'])")"
  RESP="$(curl -s -X PATCH "https://api.vercel.com/v9/projects/${PROJECT_ID}?teamId=${TEAM_ID}" \
    -H "Authorization: Bearer ${VERCEL_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{\"rootDirectory\":\"${dir}\",\"framework\":\"nextjs\"}")"
  echo "[vercel] rootDirectory=${dir} → $(echo "$RESP" | python3 -c "import json,sys;d=json.load(sys.stdin);print(d.get('rootDirectory','ERR'),d.get('framework',''))" 2>/dev/null || echo "ERR")"

  # ---- 4. Connect Git --------------------------------------------------------
  ( cd "${dir}" && pnpm dlx vercel@latest git connect "${GITHUB_REPO}" --yes ) || true
done

echo
echo "[vercel] DONE. Push to main to trigger the production deploys."
