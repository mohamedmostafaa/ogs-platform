#!/usr/bin/env node
/**
 * OGS — bulk-push .env.local entries into every Vercel project.
 *
 * For each `KEY=value` line in .env.local (skipping comments, blanks,
 * and empty values), this script PUTs the key into the `production`,
 * `preview`, and `development` targets of every Vercel project linked
 * in apps/<name>/.vercel/project.json.
 *
 * Idempotent: pre-existing keys are updated, not duplicated.
 *
 * Usage: node tooling/scripts/vercel-push-env.mjs
 *
 * @see TASKS OGS-016.
 */
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const root = new URL("../../", import.meta.url).pathname;

const auth = JSON.parse(
  readFileSync(join(homedir(), "Library/Application Support/com.vercel.cli/auth.json"), "utf8"),
);
const VERCEL_TOKEN = auth.token;

const APPS = ["id", "careers", "skillpass", "academy", "eco", "enterprise", "admin", "corporate"];

// ---- 1. Parse .env.local --------------------------------------------------
const envRaw = readFileSync(join(root, ".env.local"), "utf8");
const entries = [];
for (const line of envRaw.split(/\r?\n/)) {
  if (!line || line.trim().startsWith("#")) continue;
  const m = line.match(/^([A-Z0-9_]+)\s*=\s*"?([^"]*)"?\s*$/);
  if (!m) continue;
  const [, key, rawValue] = m;
  if (!rawValue) continue; // skip empty placeholders
  entries.push({ key, value: rawValue });
}
console.log(`[env] parsed ${entries.length} non-empty keys from .env.local`);

// ---- 2. For each app, upsert every key into 3 targets ---------------------
for (const app of APPS) {
  const projFile = join(root, `apps/${app}/.vercel/project.json`);
  if (!existsSync(projFile)) {
    console.warn(`[skip] ogs-${app}: not linked`);
    continue;
  }
  const { projectId, orgId: teamId } = JSON.parse(readFileSync(projFile, "utf8"));

  let created = 0;
  let updated = 0;
  let failed = 0;

  // List existing envs once to decide create vs update.
  const listRes = await fetch(
    `https://api.vercel.com/v9/projects/${projectId}/env?teamId=${teamId}&decrypt=false`,
    { headers: { Authorization: `Bearer ${VERCEL_TOKEN}` } },
  );
  const existing = await listRes.json();
  const byKey = new Map();
  for (const e of existing.envs ?? []) byKey.set(e.key, e);

  for (const { key, value } of entries) {
    const prior = byKey.get(key);
    if (prior) {
      // PATCH the existing env.
      const r = await fetch(
        `https://api.vercel.com/v9/projects/${projectId}/env/${prior.id}?teamId=${teamId}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ value, target: ["production", "preview", "development"] }),
        },
      );
      if (r.ok) updated++;
      else {
        failed++;
        console.warn(`  [warn] ogs-${app}: PATCH ${key} → ${r.status}`);
      }
    } else {
      // POST new env.
      const r = await fetch(
        `https://api.vercel.com/v10/projects/${projectId}/env?teamId=${teamId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${VERCEL_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key,
            value,
            type: "encrypted",
            target: ["production", "preview", "development"],
          }),
        },
      );
      if (r.ok) created++;
      else {
        failed++;
        const body = await r.text();
        console.warn(`  [warn] ogs-${app}: POST ${key} → ${r.status} ${body.slice(0, 80)}`);
      }
    }
  }

  console.log(`[ok]   ogs-${app}: created=${created} updated=${updated} failed=${failed}`);
}

console.log("\n[env] DONE. New deploys will pick up the values on next build.");
