# ADR-0006: `runWithActor` scope moves from request context to `tenantProcedure`

## Status

Accepted (2026-05-13)

## Context

Blueprint §7.1 sketches `createTRPCContext` as the place that "opens
`runWithActor` scope per request" — i.e. every tRPC call would run
inside an actor-scoped AsyncLocalStorage. The Phase-A audit and
ADR-0003 already established that platform-level mutations need
auditing too, and that the audit extension fails-loud when it can't
write a row.

If we open `runWithActor` for _every_ request — including pure reads
that don't need tenant scoping — we pay:

- Cost: ALS push/pop on every request.
- Footgun: a `publicProcedure` issuing a `prisma.user.findMany()` would
  fire the audit extension and crash because `tenantId` is undefined
  in the context.

## Decision

Move the `runWithActor` wrap from `createTRPCContext` (request-scoped)
to the `tenantProcedure` middleware (procedure-scoped). Only procedures
that explicitly opt-in to tenant scoping carry an actor context.

- `publicProcedure` — no session, no actor.
- `protectedProcedure` — session, no actor.
- `tenantProcedure` — session + actor scope, inside `runWithActor`.

The `tenantProcedure` middleware ALSO enforces (via Zod schema merge):

- `tenantSlug: string` in input — required, non-empty.
- `requireTenant(headers, tenantSlug)` membership check.
- Compose on `protectedProcedure`, not `t.procedure`, so the
  non-null session narrowing propagates without a separate check.

Mutations that absolutely need the actor scope must climb to
`tenantProcedure` (the contract: "every mutation is a tenant
procedure"). Cross-tenant or platform-level admin tooling that
intentionally bypasses tenant scoping uses `basePrismaClient()`
directly, which the audit + soft-delete extensions don't see — and
that explicit opt-out is auditable in code review.

## Consequences

- ✅ Public reads are cheap (no ALS overhead).
- ✅ The Prisma audit extension's "skip if no actor" branch in
  `audit.ts` now matches a well-defined semantic: "this is a
  pre-actor scope (CLI, migration, public read)". Not a footgun.
- ✅ `tenantProcedure` is the single, type-checked entry point for
  mutations; future code reviewers can grep for procedures that don't
  use it and flag them.
- ⚠️ Blueprint §7.1 needs an annotation pointing here (added in this PR
  via the plan-file expansion line referencing the ADR).
- ⚠️ A future "audit-on-read" requirement (e.g. for HIPAA-style
  read audit) would need to revisit this — the extension would have
  to wire into `protectedProcedure` too.

## Alternatives considered

1. **Keep `runWithActor` in `createTRPCContext`** as the blueprint
   sketched. Rejected — see Context for the cost/footgun rationale.
   The blueprint's framing assumed every request had a tenant, which
   isn't true for the OIDC sign-in flow itself.
2. **Add a no-op actor for public/protected reads** — set
   `tenantId: null, actorUserId: "anonymous"`. Rejected — pollutes
   the audit table with anonymous rows and removes the "no actor =
   skip audit" semantic from `audit.ts:111`.

## Implementation plan

1. Move `runWithActor()` call from `context.ts` into
   `enforceTenant` middleware in `trpc.ts`. (Done in OGS-080.04.)
2. Compose `tenantProcedure = protectedProcedure.use(enforceTenant).input(tenantInput)`.
3. Re-state the contract loudly in `trpc.ts` JSDoc.
4. (Phase 02) Document in `CODE_STANDARDS.md` §X: "all mutations are
   tenantProcedures unless an explicit ADR justifies otherwise".

## Rollback

Revert this commit. Move `runWithActor` back to `context.ts`. Update
`audit.ts` early-return to match (it already returns when no actor —
the move is purely about WHERE the actor gets pushed).
