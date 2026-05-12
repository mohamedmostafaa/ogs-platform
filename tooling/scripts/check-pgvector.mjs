#!/usr/bin/env node
/**
 * OGS — one-shot check that pgvector is enabled on the Neon dev branch.
 *
 * Reads DIRECT_URL (preferred for DDL) or DATABASE_URL from .env.local.
 * If pgvector is missing, runs `CREATE EXTENSION vector` and re-checks.
 *
 * Usage: node tooling/scripts/check-pgvector.mjs
 */
import { readFileSync } from "node:fs";
import pg from "pg";
const { Client } = pg;

const env = readFileSync(new URL("../../.env.local", import.meta.url), "utf8");
function readKey(key) {
  for (const line of env.split(/\r?\n/)) {
    const m = line.match(new RegExp(`^${key}\\s*=\\s*"?([^"]*)"?\\s*$`));
    if (m && m[1] && m[1].length > 0) return m[1];
  }
  return null;
}
const url = readKey("DIRECT_URL") ?? readKey("DATABASE_URL");
if (!url) {
  console.error("No DIRECT_URL or DATABASE_URL in .env.local");
  process.exit(1);
}

const client = new Client({ connectionString: url });
await client.connect();

const q = "SELECT extname, extversion FROM pg_extension WHERE extname='vector'";
let r = await client.query(q);
if (r.rows.length === 0) {
  console.log("[pgvector] not installed — running CREATE EXTENSION vector...");
  await client.query("CREATE EXTENSION IF NOT EXISTS vector");
  r = await client.query(q);
}
console.log("[pgvector]", r.rows[0] ?? "STILL MISSING");

const v = await client.query("SELECT version()");
console.log("[postgres]", v.rows[0].version.split(",")[0]);

await client.end();
