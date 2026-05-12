# ADR-0004: Auth guard hardening — mandatory tenantSlug, prod URL guard, feature-flag DSL scope, post-signup hook

## Status

Accepted (2026-05-12)

## Context

The Phase-A audit of `@ogs/auth` (commit `3e79360`) found five
blockers in the guard layer + adjacent surfaces. Each fails a Gate
in `SECURITY.md`:

- **B1** — `requireRole(headers, role)` with an optional `tenantSlug`
  returned ANY membership matching that role. Caller then trusted
  the returned `tenantId`. **Cross-tenant IDOR.** Gate 3.
- **B2** — `getAuthBaseUrl()` silently fell back to
  `http://localhost:3000` when both `BETTER_AUTH_URL` and
  `NEXT_PUBLIC_BASE_URL` were unset. In production this mints OIDC
  ID tokens with `iss: localhost`. Gate 1.
- **B3** — `requireFeature` global-default lookup used
  `findUnique({ where: { key_tenantId: { key, tenantId: null as never } } })`.
  The `null as never` cast hid a real Postgres-NULL-distinct bug:
  the global row was unreachable, so every flag fell into
  `FEATURE_DISABLED`. Gate 3 (defence in depth).
- **B4** — `provisionUser` existed but no Better Auth hook called it.
  New signups created a User row with no Worker + no Membership;
  every subsequent `requireTenant` / `requireRole` failed for that
  user.
- **B5** — `requireFeature` value DSL was documented as
  `"true"/"false"/"percentage:N"/"users:[...]"` but only literal
  `"true"` was honoured; `"true "` with a trailing space silently
  disabled. Documentation drift.

## Decision

1. **`tenantSlug` is mandatory on `requireRole`.** Old optional
   form was the IDOR vector; new signature throws at the type level
   if the caller forgets to pass it. `requireRole` now composes
   `requireTenant` then checks the role string — so it can never
   return a `tenantId` the caller didn't already constrain to.

2. **`getAuthBaseUrl` throws in production** when neither
   `BETTER_AUTH_URL` nor `NEXT_PUBLIC_BASE_URL` is set. The
   `NEXT_PHASE === "phase-production-build"` exception preserves
   `next build` route discovery; real prod requests always have the
   env set.

3. **`requireFeature` uses `findFirst` for both branches** —
   tenant-specific and global. Removes the `null as never` cast.
   Behaviour is now: tenant override (if present) wins; otherwise
   global default. Either being absent means flag is OFF
   (fail-closed).

4. **`requireFeature` Phase-1 DSL is `"true"` only**, case-
   insensitive + trimmed. Doc + schema comment + JSDoc all aligned.
   Full DSL (`"percentage:N"`, `"users:[id1,id2]"`) tracked under a
   new Phase-2 task — note added to TASKS.md.

5. **`provisionUser` wired to `databaseHooks.user.create.after`**
   in `server.ts`. After Better Auth creates the User row, our hook
   runs (still inside the same request) and idempotently creates the
   default `Worker` + `ogs-internal` `Membership` rows. The hook
   uses `runWithActor` so the writes are audited (Gate 4).

## Consequences

- ✅ B1 eliminated — `requireRole` callsites that don't pass a tenant
  fail at compile time.
- ✅ B2 eliminated — production OIDC tokens cannot mint with
  `iss: localhost` accidentally.
- ✅ B3 eliminated — global feature-flag defaults are reachable.
  Schema's `null as never` cast removed entirely.
- ✅ B4 eliminated — new signups land with a Worker + Membership in
  the same request that creates the User.
- ✅ B5 eliminated — doc / schema / code agree on the Phase-1 DSL.
- ⚠️ Every existing `requireRole(headers, role)` callsite (none in
  repo yet) must add the tenantSlug arg. Compile-time error surfaces
  every such callsite.
- ⚠️ `databaseHooks.user.create.after` runs synchronously in the
  signup request critical path. If provisionUser fails the signup
  fails too — that's intentional Gate 1/3 behaviour.

## Alternatives considered

1. **Keep `tenantSlug` optional on `requireRole`** but throw if
   omitted at runtime. Rejected — compile-time discovery is strictly
   better.
2. **Implement the full feature-flag DSL now.** Rejected — the
   `percentage:N` evaluator needs a deterministic user-bucketing
   helper (`crypto.createHash` of userId) and `users:[...]` needs a
   JSON parser; both Phase-2 work. Phase-1 boolean is enough to
   gate features per tenant.
3. **Use `auth.api.signUp.after` callback** instead of
   `databaseHooks.user.create.after`. Rejected — the database hook
   fires for ANY user creation (signup, admin creates user, OAuth
   first-login), whereas `signUp.after` only covers email/password.
   The database hook is the broader, safer choice.

## Implementation plan

1. Rewrite `guards.ts`: mandatory `tenantSlug`; `requireTenant` ->
   `requireRole` composition; `requireFeature` uses `findFirst`.
2. Update `env.ts`: `getAuthBaseUrl` prod-throw.
3. Update `server.ts`: add `databaseHooks.user.create.after`
   calling `provisionUser`.
4. `provisionUser` already updated in ADR-0003 to use `runWithActor`.
5. `turbo typecheck build lint` — 34/34 green.
6. (Phase-A reviewer pass) — re-dispatch `superpowers:code-reviewer`
   against the new guards file once Batch 6 lands too.

## Rollback plan

`git revert` the commit. The schema change (none in this batch) is
unaffected. `databaseHooks` removal is a single property deletion.
