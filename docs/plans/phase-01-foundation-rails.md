# Phase 01 — Foundation Rails

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
> Every step invokes `superpowers:using-superpowers` first; security gates from `SECURITY.md` §1 apply on every PR; coding standards from `CODE_STANDARDS.md` apply.

**Goal.** Stand up `@ogs/config`, `@ogs/db` (with three Prisma extensions), `@ogs/auth` (shell), `@ogs/api` (shell), and `@ogs/ui` (full primitives + EntityX + Avatar + theme). `pnpm build` green; the stub `apps/web-id` renders the OGS logo and a sign-in button placeholder served from the @ogs/ui primitive set.

**Exit criterion.**
1. `pnpm --filter @ogs/db prisma:migrate dev` succeeds and produces the 15-file schema with a working dev branch.
2. The composed Prisma client exports `prisma` that, when used inside `runWithActor({ tenantId, actorUserId })`, automatically applies soft-delete, tenant-scope, and audit on writes — verified by three integration tests.
3. `@ogs/ui` exports the full shadcn primitive set; a Storybook-or-route smoke renders `UserAvatar`, `AgentAvatar`, `EntityHeader`, `EntityList`, `EntityPagination`, `EntityEmptyView`, `DataTable`.
4. `apps/web-id` mounts `OgsThemeProvider`, the dark/light toggle, and the placeholder sign-in CTA.

**Window.** Week 1.

**Owning agents.** @database-engineer, @api-engineer, @ui-engineer, @auth-engineer, @devops-engineer, @code-reviewer.

**Prerequisites.** Phase 00 complete.

**Security gates that apply.** Gate 2 (input validation — sets up the Zod / TRPC scaffolding), Gate 4–6 (audit, soft delete, multi-tenancy — Prisma extensions land here), Gate 8 (secrets — `.env.example` is canonical), Gate 10 (dependency hygiene — every new dep is on the locked stack).

---

## Macro task list (to be expanded to atomic steps before this phase opens)

See `TASKS.md` Phase 1 section for the macro task IDs OGS-030 through OGS-111. The Engineering Lead expands each to atomic steps following the Phase 0 pattern on the Friday before Week 1 starts. Each expansion adds:

- Exact file paths.
- The failing test code.
- The pnpm command and expected output.
- The implementation code, copy-pasted from the blueprint.
- The TASKS.md update step.
- The exact commit message.
- The PR opening step with the required reviewers.

### Expansion order (priority)

1. **OGS-040 → OGS-061** (`@ogs/db`) first. Nothing else can build without the generated client.
2. **OGS-030 → OGS-031** (`@ogs/config`) in parallel — trivial, ~30 minutes.
3. **OGS-070 → OGS-073** (`@ogs/auth` shell) and **OGS-080 → OGS-085** (`@ogs/api` shell) in parallel once db is generating.
4. **OGS-090 → OGS-104** (`@ogs/ui`) in parallel with auth/api shells. The full shadcn install is a single batch command (blueprint §29.8). EntityX, Avatar, theme follow.
5. **OGS-110 → OGS-111** (hello-world stubs upgraded to the @ogs/ui look) last.

### Required code listings (paste verbatim from blueprint)

Each atomic-step expansion uses these canonical sources without modification:

- `_datasource.prisma` and the 14 domain files → Blueprint §5.4 through §5.17.
- Soft-delete extension → Blueprint §16.2.
- Tenant-scope extension → Blueprint §16.3.
- Audit extension → Blueprint §16.4.
- Composed client → Blueprint §16.1.
- `runWithActor` envelope → Blueprint §16.5.
- `@ogs/api` `trpc.ts`, `query-client.ts`, `server-helpers.tsx`, `client.tsx`, `root.ts` → Blueprint §7.1 through §7.6.
- `@ogs/ui` theme tokens → Blueprint §3.5.1.
- `@ogs/ui` theme provider → Blueprint §3.5.2.
- EntityX toolkit → Blueprint §9.2 (full code).
- DataTable → Blueprint §9.3.
- UserAvatar + AgentAvatar (no DiceBear) → Blueprint §9.4.
- `useErrorModal` → Blueprint §9.5.
- `useEntitySearch` → Blueprint §9.6.
- `cn` helper → Blueprint §9.8.

### Atomic-step template per task

For each macro task `OGS-NNN`, the expansion produces steps OGS-NNN.01 through OGS-NNN.NN following this pattern (paraphrase, not literal):

1. Create the branch.
2. Create the file with empty exports.
3. Write the failing unit/integration test.
4. Run the test (expect FAIL with the exact reason).
5. Paste the canonical implementation from the blueprint.
6. Run the test (expect PASS).
7. Add a JSDoc comment on every exported symbol per CODE_STANDARDS.md §2.1.
8. Run lint + typecheck.
9. Update TASKS.md.
10. Commit (Conventional Commits with task id).
11. Push and open PR with the canonical body template.
12. Address review comments; loop until two approvals.
13. After merge: delete branch, pull main.

### Phase exit verification (run by QA Engineer)

- [ ] `pnpm typecheck` green across all workspaces.
- [ ] `pnpm test` green; database extension tests pass.
- [ ] `pnpm --filter @ogs/db prisma:validate` passes the multi-file schema.
- [ ] Cross-tenant integration test fails as expected (cannot read another tenant's row).
- [ ] Soft-delete integration test confirms `delete` writes `deletedAt`.
- [ ] Audit integration test confirms every sensitive write produces an `AuditLog` row.
- [ ] `apps/web-id` renders the themed home page with both dark and light modes working.
- [ ] No dependency outside blueprint §3 has been added.

---

## Done

(Move completed tasks here.)

## Retro

(Filled at phase end.)
