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

## Atomic steps — OGS-080..085 (`@ogs/api` — tRPC v11 shell)

**Owner:** @api-engineer · **Reviewer:** @code-reviewer + @auth-engineer
**Security gates touched:** Gate 1 (auth — wraps `@ogs/auth/guards`), Gate 2 (input validation — Zod), Gate 3 (authorization — protectedProcedure), Gate 4 (audit — every mutation flows through `runWithActor`).
**Blueprint sections:** §7.1 (`trpc.ts`), §7.2 (`query-client.ts`), §7.3 (`server-helpers.tsx`), §7.4 (`client.tsx` TRPCReactProvider), §7.6 (`root.ts` appRouter).

### Prerequisites verified

- `@ogs/auth` exports `requireAuth`, `requireTenant`, `requireRole`, `AuthGuardError`, `actorFromSession` (Phase-A B1..B5 closed).
- `@ogs/db` exports `prisma` (composed), `runWithActor`, `ActorContext`, `Prisma` types.
- `pnpm version-check` GREEN with `@trpc/server@^11.17`, `@trpc/client@^11.17`, `@trpc/react-query@^11.17`, `@tanstack/react-query@^5.100`, `superjson@^2`, `zod@^4` (verified locally before this expansion).

### File map

| Path                                       | Purpose                                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `packages/api/package.json`                | Workspace manifest + deps                                                                                           |
| `packages/api/tsconfig.json`               | Self-contained TS config (bundler resolution, JSX preserve)                                                         |
| `packages/api/eslint.config.mjs`           | Extends `@ogs/eslint-config/library.js`                                                                             |
| `packages/api/src/trpc.ts`                 | Context factory, `t = initTRPC`, base + protected procedure, error formatter                                        |
| `packages/api/src/query-client.ts`         | QueryClient factory (superjson + 60s stale; never instantiate at module load)                                       |
| `packages/api/src/server-helpers.tsx`      | `getQueryClient`, `createCaller`, `HydrateClient` server component                                                  |
| `packages/api/src/client.tsx`              | `TRPCReactProvider` (browser) + `trpc` typed React hooks                                                            |
| `packages/api/src/root.ts`                 | Empty `appRouter` + `export type AppRouter = typeof appRouter`                                                      |
| `packages/api/src/context.ts`              | `createTRPCContext({ headers, info })` — reads session, builds ActorContext, opens `runWithActor` scope per request |
| `packages/api/src/index.ts`                | Root barrel: `appRouter`, `AppRouter`, `createTRPCContext`                                                          |
| `apps/id/src/app/api/trpc/[trpc]/route.ts` | Next.js Route Handler wiring `fetchRequestHandler`                                                                  |
| `apps/id/src/lib/trpc.ts`                  | Per-app browser tRPC client instance                                                                                |

### OGS-080.01 — workspace scaffold

- [ ] Create `packages/api/{package.json, tsconfig.json, eslint.config.mjs}`.
- [ ] `package.json` deps: `@ogs/auth workspace:*`, `@ogs/config workspace:*`, `@ogs/db workspace:*`, `@trpc/server@^11.17`, `@trpc/client@^11.17`, `@trpc/react-query@^11.17`, `@tanstack/react-query@^5.100`, `superjson@^2.2.6`, `zod@^4.0.0`.
- [ ] `pnpm install` — postinstall regenerates Prisma client, no other side effects.
- [ ] Run `pnpm --filter @ogs/api typecheck` — expect PASS (empty package).

### OGS-081.01 — `trpc.ts` context + procedures

- [ ] Write `src/context.ts` exporting `createTRPCContext({ headers })`. It calls `auth.api.getSession({ headers })`, returns `{ headers, session, ipAddress, userAgent, correlationId }`.
- [ ] Write `src/trpc.ts`:
  - `import { initTRPC, TRPCError } from "@trpc/server"`.
  - `import superjson from "superjson"`.
  - `import { ZodError } from "zod"`.
  - `import { AuthGuardError } from "@ogs/auth/guards"`.
  - `const t = initTRPC.context<Awaited<ReturnType<typeof createTRPCContext>>>().create({ transformer: superjson, errorFormatter: ... })`.
  - `errorFormatter` maps `AuthGuardError` codes → TRPC codes (UNAUTHENTICATED→UNAUTHORIZED, FORBIDDEN→FORBIDDEN, TENANT_MISMATCH→FORBIDDEN, FEATURE_DISABLED→FORBIDDEN) and unwraps `ZodError` into `flattened` shape.
  - `export const router = t.router`.
  - `export const publicProcedure = t.procedure`.
  - `export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => { if (!ctx.session) throw new TRPCError({ code: "UNAUTHORIZED" }); return next({ ctx: { ...ctx, session: ctx.session } }); })`.
- [ ] `pnpm typecheck` PASS.

### OGS-081.02 — wire `runWithActor` middleware

- [ ] Add `tenantProcedure` factory: `protectedProcedure.use(async ({ ctx, next, input }) => { ... runWithActor({ tenantId, actorUserId, ipAddress, userAgent }, () => next({ ctx: { ...ctx, tenantId } })); })`. tenantId source: explicit input arg OR `OGS_TENANT_HEADER` ("x-ogs-tenant-slug") — caller's responsibility.
- [ ] Document in JSDoc: every mutation should be a `tenantProcedure` so audit fires.

### OGS-082.01 — `query-client.ts`

- [ ] Export `makeQueryClient()` returning `new QueryClient({ defaultOptions: { queries: { staleTime: 60_000 }, dehydrate: { serializeData: superjson.serialize }, hydrate: { deserializeData: superjson.deserialize } } })`.
- [ ] Memoise per-process via a `globalThis.__ogsQC` cache so the server prefetch and the client share a serialised state shape.

### OGS-083.01 — `server-helpers.tsx`

- [ ] Export `getQueryClient()` (cached per request via `cache()` from `react`).
- [ ] Export `createCaller()` — server-side direct invocation: `appRouter.createCaller(await createTRPCContext({ headers: await headers() }))`.
- [ ] Export `HydrateClient` server component wrapping `<HydrationBoundary state={dehydrate(getQueryClient())}>`.

### OGS-084.01 — `client.tsx` TRPCReactProvider

- [ ] Export `trpc = createTRPCReact<AppRouter>()`.
- [ ] Export `TRPCReactProvider` client component: builds `trpcClient` with `httpBatchLink({ url, transformer: superjson })`, wraps children in `<QueryClientProvider>` + `<trpc.Provider>`.
- [ ] Reads `NEXT_PUBLIC_TRPC_URL` first, falls back to relative `/api/trpc` (works for same-origin SSR).

### OGS-085.01 — empty `root.ts`

- [ ] Export `appRouter = router({})` and `export type AppRouter = typeof appRouter`.
- [ ] First real procedure lands in Phase 02 (`identity.me` — read-only session inspector).

### OGS-085.02 — mount `/api/trpc/[trpc]` route in apps/id

- [ ] Create `apps/id/src/app/api/trpc/[trpc]/route.ts`:
  - `import { fetchRequestHandler } from "@trpc/server/adapters/fetch"`.
  - Export `GET`/`POST` calling `fetchRequestHandler({ endpoint: "/api/trpc", req, router: appRouter, createContext: ({ req }) => createTRPCContext({ headers: req.headers }) })`.
  - `export const dynamic = "force-dynamic"` (same as `/api/auth/[...all]`).
- [ ] Create `apps/id/src/lib/trpc.ts` re-exporting the browser client.

### Verification gates (must all PASS before commit)

- [ ] `pnpm version-check` → 66 green, 0 yellow.
- [ ] `pnpm turbo typecheck` → all packages green (now 14 + 8 apps).
- [ ] `pnpm turbo build` → 8/8 apps green, `apps/id` lists `/api/trpc/[trpc]` as `ƒ Dynamic`.
- [ ] `pnpm turbo lint` → 14/14 green.
- [ ] `pnpm format:check` → clean.
- [ ] Smoke: `curl -X POST http://localhost:3000/api/trpc/health.ping` returns either 404 (no procedures yet — expected) or 200. We only assert the route mount works, NOT a procedure response.
- [ ] `gitleaks detect --no-banner --exit-code 1` → 0 leaks.

### Commit body template

```
feat(api): @ogs/api — tRPC v11 shell with auth-aware procedures (OGS-080..085)

What lands:
- packages/api/* — context, trpc.ts, query-client.ts, server-helpers.tsx,
  client.tsx, root.ts. Empty appRouter; first procedure in Phase 02.
- apps/id mounts /api/trpc/[trpc] route handler.
- All mutations should use `tenantProcedure` so runWithActor fires and
  audit Gate 4 holds.

SECURITY.md gate walk:
- Gate 1 (auth): protectedProcedure throws UNAUTHORIZED via TRPCError on
  missing session.
- Gate 2 (input validation): every public procedure declares a Zod input;
  errorFormatter unwraps ZodError into typed field errors.
- Gate 3 (authorization): tenantProcedure composes requireTenant; role
  gates use requireRole(slug, role) from @ogs/auth/guards.
- Gate 4 (audit): tenantProcedure wraps next() in runWithActor so the
  audit extension fires on every mutation it routes.
- Gates 5–10: not touched by this shell.

Verified locally: turbo typecheck/build/lint/format:check + version-check
+ gitleaks all clean.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
```

## Atomic steps — UI follow-ups (OGS-091 progress, OGS-095, OGS-100..103, OGS-104 disposition)

**Owner:** @ui-engineer · **Reviewer:** @code-reviewer + @security-engineer (AgentAvatar contrast / "AI never mistakable")
**Security gates touched:** Gate 2 (Form + Zod scaffolding for Phase 02 sign-in), Gate 9 (AI-vs-human visual distinction on every AgentAvatar variant).
**Blueprint sections:** §3.5.3 (brand resolver), §9.1 (full primitive set), §9.4 (UserAvatar + AgentAvatar — no DiceBear), §9.5 (useErrorModal), §9.6 (useEntitySearch — 500 ms debounce), §10.3 (useConfirm — promise-based).

### Prerequisites verified

- `pnpm version-check` GREEN at start (66 green).
- Radix + RHF + Sonner versions cross-checked vs `npm view` before pinning.

### Scope decision (loud, in the plan)

OGS-091 says "install the full shadcn primitive set (~50)". We **do not** ship all 50 in this chunk. We ship the **15 highest-value primitives** Phase 02 needs (Identity sign-in/up + onboarding): dialog, alert-dialog, sheet, tabs, select, checkbox, radio-group, switch, tooltip, popover, accordion, progress, toggle, toggle-group, alert, form, sonner. OGS-091 stays `[~]` until the remaining primitives land — but **per-primitive, just-in-time** as Phase 02 imports them. No more "install all 50 at once" inflating bundle size for primitives we never use.

### File map

| Path                                                    | Purpose                                                           |
| ------------------------------------------------------- | ----------------------------------------------------------------- |
| `packages/ui/src/primitives/alert.tsx`                  | Alert variants (default + destructive)                            |
| `packages/ui/src/primitives/alert-dialog.tsx`           | Radix destructive-action confirmation                             |
| `packages/ui/src/primitives/dialog.tsx`                 | Radix modal                                                       |
| `packages/ui/src/primitives/sheet.tsx`                  | Radix slide-over                                                  |
| `packages/ui/src/primitives/tabs.tsx`                   | Radix tabs                                                        |
| `packages/ui/src/primitives/select.tsx`                 | Radix select with shadcn skin                                     |
| `packages/ui/src/primitives/checkbox.tsx`               | Radix checkbox                                                    |
| `packages/ui/src/primitives/radio-group.tsx`            | Radix radio-group                                                 |
| `packages/ui/src/primitives/switch.tsx`                 | Radix switch                                                      |
| `packages/ui/src/primitives/tooltip.tsx`                | Radix tooltip + provider                                          |
| `packages/ui/src/primitives/popover.tsx`                | Radix popover                                                     |
| `packages/ui/src/primitives/accordion.tsx`              | Radix accordion                                                   |
| `packages/ui/src/primitives/progress.tsx`               | Radix progress                                                    |
| `packages/ui/src/primitives/toggle.tsx`                 | Radix toggle button                                               |
| `packages/ui/src/primitives/toggle-group.tsx`           | Radix toggle-group                                                |
| `packages/ui/src/primitives/form.tsx`                   | RHF + Zod adapters (Field/Item/Label/Control/Description/Message) |
| `packages/ui/src/primitives/sonner.tsx`                 | Sonner Toaster + next-themes bridge                               |
| `packages/ui/src/theme/brand.ts`                        | `resolveBrand(tenantId?)` stub (Phase 02 reads FeatureFlag)       |
| `packages/ui/src/hooks/use-error-modal.tsx`             | Promise-based error display                                       |
| `packages/ui/src/hooks/use-entity-search.ts`            | 500 ms debounced search                                           |
| `packages/ui/src/hooks/use-confirm.tsx`                 | Promise-based confirm dialog                                      |
| `packages/ui/src/assets/agent-avatars/Avatar01..12.tsx` | 12 inline-SVG components, neutral geometric, no human imagery     |
| `packages/ui/src/assets/agent-avatars/index.ts`         | `pickAgentAvatar(slug)` stable hash → component                   |
| `packages/ui/src/avatar/agent-avatar.tsx`               | Add `glyphVariant?: "svg" \| "letter"` prop (default `"svg"`)     |

### OGS-104 disposition

**Not shipped.** Replaced by inline-SVG React components (OGS-100). No `public/` copy needed; each app `import { pickAgentAvatar } from "@ogs/ui/assets/agent-avatars"`. **ADR-0007** records the deviation. OGS-104 marked `[-]` (abandoned) in TASKS.md with forward-reference to the ADR.

### Verification gates (must all PASS before commit)

- [ ] `pnpm version-check` → 66+ green, 0 yellow.
- [ ] `pnpm turbo typecheck` → all packages green.
- [ ] `pnpm turbo build` → 8/8 apps green.
- [ ] `pnpm turbo lint` → all green.
- [ ] `pnpm format:check` → clean.
- [ ] `gitleaks detect --exit-code 1` → 0 leaks.
- [ ] Live `/ui-smoke` still renders; AgentAvatar shows SVG variant by default with visible AI pill at every size.

---

## Atomic steps — OGS-110..111 (app shells consuming `@ogs/ui`)

**Owner:** @ui-engineer (lead — shared `<AppShell>` primitive), @devops-engineer (sibling-app bootstrap)
**Reviewer:** @code-reviewer + @security-engineer (each app's stub must NOT leak server-only env into the client bundle)
**Security gates touched:**

- Gate 3 (output minimisation): pages are server components; no server env vars leak through stray `process.env.X` references in the rendered markup.
- Gate 8 (secrets): each app's bundle must not import @ogs/db, @ogs/auth/server, or any package that loads secrets at module level.

**Blueprint sections:** §29.10 (app shells), §3.5 (theme + brand resolver), §9 (UI surface).

### Prerequisites verified

- `@ogs/ui` exports stabilised (Primitives, Theme, EntityX, Avatar, Hooks).
- `apps/id` already runs the shell pattern (layout.tsx imports `@ogs/ui/styles/globals.css` + wraps in `OgsThemeProvider`; page.tsx uses `Button` + `ThemeToggle`). The 7 sibling apps copy that pattern but factor the page body through a shared `<AppShell>` primitive so we don't have 7 near-identical files.
- 7 sibling apps each have a `layout.tsx` + `page.tsx` stub from Phase 0 with no `@ogs/ui` dep yet (verified via `grep "@ogs/ui" apps/*/package.json`).

### Scope decision (loud, in the plan)

OGS-110 is "bootstrap `apps/web-id` shell" — **already done** in the UI follow-ups chunk (OGS-091/095/100..103). This expansion delivers OGS-111 (the remaining 7 apps) **plus** factors the shared shell body into `@ogs/ui` so future copy-edits land in one place. Worker apps (referenced loosely in the macro) are **not** Next.js apps — they're background processes shipped under `apps/workers/*` in Phase 03 — so they are explicitly out of scope here.

### File map

| Path                                                                           | Purpose                                                                      |
| ------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `packages/ui/src/app-shell/app-shell.tsx`                                      | New `<AppShell>` server component — header + main slot + footer + theme tog. |
| `packages/ui/src/app-shell/index.ts`                                           | Public barrel.                                                               |
| `packages/ui/package.json`                                                     | Add `./app-shell` export.                                                    |
| `packages/ui/src/index.ts`                                                     | Re-export from `./app-shell`.                                                |
| `apps/{careers,academy,admin,corporate,skillpass,enterprise,eco}/package.json` | Add `@ogs/ui` workspace dep + `tailwindcss` + `@tailwindcss/postcss`.        |
| `apps/{...}/postcss.config.mjs`                                                | Same as `apps/id/postcss.config.mjs`.                                        |
| `apps/{...}/src/app/layout.tsx`                                                | Import globals.css + wrap in `OgsThemeProvider`.                             |
| `apps/{...}/src/app/page.tsx`                                                  | One-liner `<AppShell title="..." tagline="..." />`.                          |

### OGS-110.01 — DONE (was delivered with UI follow-ups)

Reference only: `apps/id` already renders the themed home page.

### OGS-111.01 — shared `<AppShell>` primitive

- [ ] Create `packages/ui/src/app-shell/app-shell.tsx`. Server component. Props: `{ title: string; tagline: string; signInHref?: string; children?: ReactNode }`. Renders: brand title link, theme toggle (client subcomponent), tagline, optional "Sign in" button linking to `signInHref` (defaults to `https://id.ogs-tc.com/login`), optional children slot below the tagline, plus a small footer (`<phase-stamp>OGS workforce-trust platform — Phase 01 shell.</phase-stamp>` text only — no secrets/env).
- [ ] Tailwind classes mirror `apps/id/src/app/page.tsx` so the visual identity stays consistent.
- [ ] Add `packages/ui/src/app-shell/index.ts` re-exporting `AppShell`.
- [ ] Wire the new export in `packages/ui/package.json` (`./app-shell` → `./src/app-shell/index.ts`).
- [ ] Re-export from `packages/ui/src/index.ts` for the root barrel.

### OGS-111.02 — Bootstrap 7 sibling apps

For each of `careers, academy, admin, corporate, skillpass, enterprise, eco`:

- [ ] `package.json`: add deps `"@ogs/ui": "workspace:*"`, devDeps `"tailwindcss": "^4.3.0"`, `"@tailwindcss/postcss": "^4.3.0"`.
- [ ] `postcss.config.mjs`: copy of `apps/id/postcss.config.mjs`.
- [ ] `src/app/layout.tsx`: replace body with the same pattern as `apps/id/src/app/layout.tsx` minus the `TRPCReactProvider` (no tRPC client wired yet for these apps).
- [ ] `src/app/page.tsx`: single `<AppShell title="OGS X" tagline="..." />`. One JSX line, no inline styles.

Per-app brand text:

| App        | Port | Title          | Tagline                                                                |
| ---------- | ---- | -------------- | ---------------------------------------------------------------------- |
| careers    | 3001 | OGS Careers    | Where verified workers meet hiring companies across the energy sector. |
| skillpass  | 3002 | OGS SkillPass  | Portable, verifiable credentials for oil-and-gas workers.              |
| academy    | 3003 | OGS Academy    | Training and certification for the energy workforce.                   |
| eco        | 3004 | OGS Eco        | Ecosystem hub for partners and developers building on OGS.             |
| enterprise | 3005 | OGS Enterprise | Enterprise tooling for workforce trust at scale.                       |
| admin      | 3006 | OGS Admin      | Internal operations console for the OGS platform team.                 |
| corporate  | 3007 | OGS Corporate  | About OGS — workforce-trust for oil-and-gas.                           |

### Verification gates (must all PASS before commit)

- [ ] `pnpm turbo typecheck` → 30/30 green (8 apps + packages).
- [ ] `pnpm turbo build` → 8/8 apps green.
- [ ] `pnpm turbo lint` → all green.
- [ ] `pnpm format:check` → clean.
- [ ] `gitleaks detect --exit-code 1` → 0 leaks.
- [ ] Manual visual sniff: `pnpm --filter=@ogs/careers dev` boots, `localhost:3001` renders the AppShell with working theme toggle.

### Commit body template

```
feat(apps): app shells consuming @ogs/ui in 7 sibling apps + shared <AppShell> primitive (OGS-111)
```

(walk 10 SECURITY gates inline; note that all 7 shells are server components with no env imports.)

## Done

(Move completed tasks here.)

## Retro

(Filled at phase end.)
