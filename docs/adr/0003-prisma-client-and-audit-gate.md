# ADR-0003: Lazy Prisma client + Gate-4 fail-loud audit

## Status

Accepted (2026-05-12)

## Context

The Phase-A audit identified four critical issues with the
`@ogs/db` layer:

- **B6** — `tenant-scope` extension's `NO_TENANT_MODELS` set was
  desynced from the schemas: `Worker`, `Experience`, `Education`,
  `Credential`, `Lesson`, `LessonProgress` had no `tenantId` column
  yet the extension tried to inject one → runtime crash on every
  write.
- **B7** — `basePrisma` was a `Proxy` of `{}` that materialised the
  client on first property access. Symbol props, `instanceof`, and
  `$transaction(callback)` identity all flow through a Proxy
  unreliably and could break Prisma's internal extension chain.
- **B8** — Audit writes that failed were swallowed with
  `console.error`. SECURITY.md Gate 4 says "no code path bypasses
  audit"; swallowing means a DB outage on the AuditLog table
  silently loses the trail.
- **B9** — Platform-level writes (`tenantId: null` actor context,
  e.g. `AppSettings`, global `FeatureFlag`, `Skill` taxonomy)
  skipped audit entirely because `AuditLog.tenantId` was non-null.

Plus a couple of supporting findings from the auditor:

- `pgcrypto` Prisma extension was declared but unused.
- `Endorsement` / `LessonProgress` / `Lesson` lacked tenantId despite
  blueprint §5.10 implying they're tenant-scoped.

## Decision

1. **Add `tenantId String` to every tenant-scoped child model** —
   `Worker`, `Experience`, `Education`, `Credential`, `Lesson`,
   `LessonProgress`. Indexes added to the canonical "list by tenant"
   query shape. `Document` already had it.

2. **Add `EmbeddingChunk` and `NotificationPreference`** to
   `NO_TENANT_MODELS` (they scope via their parent's tenantId).

3. **Replace the `Proxy` lazy client with an explicit
   `getBasePrisma()` accessor** that returns a real `PrismaClient`.
   Composition in `index.ts` still defers — but via a one-level
   getter Proxy that only forwards top-level method/property access
   to the underlying composed client, so `$extends` / `$transaction`
   / `instanceof` all see the real client.

4. **`AuditLog.tenantId` becomes nullable.** A null value means
   "platform-level mutation" (AppSettings, Skill, global FeatureFlag).
   Indexes updated: `[tenantId, createdAt desc]` for the tenant feed,
   `[tenantId, entity, entityId, createdAt]` for the per-entity
   trail, `[actorUserId, createdAt desc]` for forensics.

5. **Audit failures now fail-loud by default.** The originating
   request errors with a clear message naming the model + operation.
   Escape hatch `OGS_AUDIT_BEST_EFFORT=true` falls back to
   `console.error` — intended only for known-incident triage, never
   the steady state. Phase 02 will add an outbox table + Inngest
   retry path so we don't have to choose between "fail loud" and
   "best effort."

6. **`pgcrypto` removed** from `extensions = [...]`. We use cuids and
   AES-GCM at the application layer; pgcrypto was bloat.

7. **`extractEntityId` returns the sentinel `"<batch>"`** for batch
   operations (`updateMany`, `deleteMany`) instead of an empty string,
   so audit-feed queries can filter them out cleanly.

## Consequences

- ✅ Writes to `Worker`/`Experience`/etc. no longer crash.
- ✅ `$extends` / `$transaction` operate on a real PrismaClient.
- ✅ Gate 4 holds: a failed audit row halts the originating request
  loudly rather than silently losing the trail.
- ✅ Platform writes now audited — every mutation of `AppSettings`,
  `Skill`, global `FeatureFlag` leaves a row.
- ⚠️ Tests / scripts that mutate audited tables outside `runWithActor`
  will fail loudly. Migrations + seed are already covered (no actor
  context = skip audit).
- ⚠️ One Neon dev branch reset was avoided by adding columns as
  optional in the migration and backfilling — see migration SQL.
- ⚠️ The `prisma` export is still a getter Proxy at the outermost
  level. The Proxy only forwards property access; it doesn't pretend
  to BE a PrismaClient. Acceptable but documented.

## Alternatives considered

1. **Add `tenantId` to `Lesson`/`LessonProgress`** vs. add them to
   `NO_TENANT_MODELS`. Chose to add `tenantId` — defence in depth;
   matches Worker's scoping consistently.
2. **Outbox-based audit instead of fail-loud.** Better design but
   meaningful Phase 02 work; not blocking now. The env-var escape
   hatch lets us defer without making the steady state worse.
3. **Keep `AuditLog.tenantId` non-null with a sentinel value
   `"__platform__"`** vs. nullable. Chose nullable — Postgres NULL
   semantics match "no tenant" cleanly; sentinels invite typos.

## Implementation plan

1. Add `tenantId String` to the 6 missing models + matching indexes.
2. Update `NO_TENANT_MODELS` (add `EmbeddingChunk`,
   `NotificationPreference`; tidy comments).
3. Replace `basePrisma` Proxy with `getBasePrisma()` function; export
   `basePrismaClient()` from `index.ts`; compose extensions lazily.
4. Update `seed.ts` and `@ogs/auth/provisioning.ts` to use
   `basePrismaClient()` / `getBasePrisma()`.
5. Change `AuditLog.tenantId` to nullable; add three indexes; remove
   the old `[tenantId, entity, entityId, createdAt]` plain index in
   favour of the descending-sort version.
6. `pnpm prisma:generate` → `pnpm prisma:migrate dev` (one migration
   carries all the schema deltas).
7. `pnpm --filter @ogs/db seed` smoke test.
8. `turbo typecheck build lint` — 34/34 green required.

## Rollback plan

`git revert` the commit; the migration is reversible with a manual
"drop columns + restore non-null" SQL (Neon dev branch can be reset
without data loss). The new `getBasePrisma()` is purely additive in
the runtime path — old callers that imported `basePrisma` will
fail to compile, surfacing every call site.
