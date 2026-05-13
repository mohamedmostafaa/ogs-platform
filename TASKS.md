# OGS Platform — Living Tasks

The single index of every macro task on OGS Wave 1 and the backlog beyond. Atomic steps live in `docs/plans/phase-NN-<slug>.md`. Update on every PR. CI rejects PRs that don't.

---

## 0. Mandatory protocols — read every session

Every agent confirms these before touching code. The Code Reviewer enforces. CI enforces.

| #   | Protocol                                                                                                                                          | Where it lives                         |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| -1  | Run `pnpm version-check` first; STOP on RED/UNKNOWN.                                                                                              | AGENTS.md §0 rule -1, blueprint §3.2.1 |
| 0   | Security is the top priority. Ten gates apply on every PR.                                                                                        | SECURITY.md §1                         |
| 0a  | Clean code, JSDoc on every export, files ≤ 600 lines.                                                                                             | CODE_STANDARDS.md                      |
| 1   | Invoke `superpowers:using-superpowers` then the most-specific skill.                                                                              | AGENTS.md §6 matrix                    |
| 2   | Every PR updates this file. CI gate `verify-tasks-update`.                                                                                        | .github/workflows/pr-discipline.yml    |
| 3   | Atomic steps live in phase plans; macro `[x]` only after every atomic step merges.                                                                | docs/plans/                            |
| 4   | Never forge a `[x]`. Weekly Task Curator sweep reverts drift.                                                                                     | AGENTS.md §8                           |
| 5   | Ownership per `AGENTS.md` §1. Hand-off per `AGENTS.md` §4.                                                                                        | AGENTS.md                              |
| 6   | No self-merge. Two reviewers minimum; Code Reviewer required.                                                                                     | .github/CODEOWNERS                     |
| 7   | Done tasks move to phase Done sub-section. Abandoned tasks move to Archive.                                                                       | (this file)                            |
| 8   | Blueprint deviation → ADR in `docs/adr/` before code.                                                                                             | blueprint §28.3                        |
| 9   | No dead-name patterns in diffs (Next 15 middleware.ts, Prisma `prisma-client-js`, AI SDK `generateObject`, etc.). CI gate `verify-no-dead-names`. | blueprint §3.1.1                       |

## 1. Status legend

`[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked · `[?]` needs decision · `[-]` abandoned

## 2. ID convention

Each phase pre-allocates a 100-block. New IDs use the next free integer in their phase's block. Letter-suffixed IDs are deprecated; existing ones are grandfathered and listed verbatim.

| Phase                                   | ID block                                                                                 | Plan file                                                                                  |
| --------------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 00 — Repository bootstrap               | OGS-001 … OGS-099                                                                        | [`docs/plans/phase-00-bootstrap.md`](docs/plans/phase-00-bootstrap.md)                     |
| 01 — Foundation rails                   | OGS-100 … OGS-199 (grandfathered: 030, 031, 040–061, 070–073, 080–085, 090–104, 110–111) | [`docs/plans/phase-01-foundation-rails.md`](docs/plans/phase-01-foundation-rails.md)       |
| 02 — Identity hub                       | OGS-200 … OGS-299 (grandfathered: 120–164)                                               | [`docs/plans/phase-02-identity-hub.md`](docs/plans/phase-02-identity-hub.md)               |
| 03 — Live-video shell                   | OGS-300 … OGS-399 (grandfathered: 170–191)                                               | [`docs/plans/phase-03-live-video-shell.md`](docs/plans/phase-03-live-video-shell.md)       |
| 04 — Careers vertical slice             | OGS-400 … OGS-499 (grandfathered: 200–282)                                               | [`docs/plans/phase-04-careers-vertical.md`](docs/plans/phase-04-careers-vertical.md)       |
| 05 — Academy + SkillPass                | OGS-500 … OGS-599 (grandfathered: 300–382)                                               | [`docs/plans/phase-05-academy-skillpass.md`](docs/plans/phase-05-academy-skillpass.md)     |
| 06 — AI summarizer + tutor              | OGS-600 … OGS-699 (grandfathered: 400–426)                                               | [`docs/plans/phase-06-ai-summarizer-tutor.md`](docs/plans/phase-06-ai-summarizer-tutor.md) |
| 07 — AI proctoring + oral viva          | OGS-700 … OGS-799 (grandfathered: 440–462)                                               | [`docs/plans/phase-07-ai-proctoring-viva.md`](docs/plans/phase-07-ai-proctoring-viva.md)   |
| 08 — AI eval framework + cost dashboard | OGS-800 … OGS-899 (grandfathered: 470–492)                                               | [`docs/plans/phase-08-ai-evals-cost.md`](docs/plans/phase-08-ai-evals-cost.md)             |
| 09 — Admin + payments hardening         | OGS-900 … OGS-999 (grandfathered: 500–553)                                               | [`docs/plans/phase-09-admin-payments.md`](docs/plans/phase-09-admin-payments.md)           |
| 10 — Hardening and pilot launch         | OGS-1000 … OGS-1099 (grandfathered: 600–651)                                             | [`docs/plans/phase-10-launch.md`](docs/plans/phase-10-launch.md)                           |
| XC — Cross-cutting tracks               | OGS-1100 … OGS-1199 (grandfathered: 700–751)                                             | [`docs/plans/phase-XC-cross-cutting.md`](docs/plans/phase-XC-cross-cutting.md)             |
| W2 — Wave 2 backlog                     | OGS-2000 +                                                                               | (per-feature plan opens when W2 starts)                                                    |
| W3 — Wave 3 backlog                     | OGS-3000 +                                                                               | (per-feature plan opens when W3 starts)                                                    |
| Future                                  | OGS-9000 +                                                                               | (Year 2+)                                                                                  |

## 3. Status dashboard

Updated by the Task Curator's weekly sweep (Mondays). Generated by `pnpm --filter @ogs/tooling status-sweep` once that script exists; until then maintained by hand.

| Phase                      | `[ ]`     | `[~]` | `[x]` | `[!]` | `[?]` |
| -------------------------- | --------- | ----- | ----- | ----- | ----- |
| 00 — Bootstrap             | 2         | 1     | 31    | 0     | 0     |
| 01 — Foundation            | 2         | 1     | 50    | 0     | 0     |
| 02 — Identity hub          | 23        | 0     | 3     | 0     | 0     |
| 03 — Live-video shell      | 18        | 0     | 0     | 0     | 0     |
| 04 — Careers vertical      | TBD (JIT) | 0     | 0     | 0     | 0     |
| 05 — Academy + SkillPass   | TBD (JIT) | 0     | 0     | 0     | 0     |
| 06 — AI summarizer + tutor | TBD (JIT) | 0     | 0     | 0     | 0     |
| 07 — AI proctoring + viva  | TBD (JIT) | 0     | 0     | 0     | 0     |
| 08 — AI evals + cost       | TBD (JIT) | 0     | 0     | 0     | 0     |
| 09 — Admin + payments      | TBD (JIT) | 0     | 0     | 0     | 0     |
| 10 — Launch                | TBD (JIT) | 0     | 0     | 0     | 0     |
| XC — Cross-cutting         | 16        | 0     | 0     | 0     | 0     |

> Phases 04 – 10 macro counts populate when the Engineering Lead expands the phase plan to atomic steps on the Friday before that phase opens (see `docs/plans/_template.md`).

---

## Phase 00 — Repository bootstrap

> Plan file: [`docs/plans/phase-00-bootstrap.md`](docs/plans/phase-00-bootstrap.md) — fully expanded with atomic steps. Mark macro `[x]` only after every sub-step merges.

**Owners.** @engineering-lead (lead), @devops-engineer, @database-engineer, @security-engineer, @docs-writer, @code-reviewer.

### Repository, CI, branch protection

- [x] `OGS-001` Create the GitHub repo and push the initial commit — @engineering-lead — §29.2
- [ ] `OGS-002` Branch protection on `main` — @engineering-lead — §23.10
- [x] `OGS-003` CODEOWNERS in repo — @engineering-lead — §23.10
- [x] `OGS-021` CI workflow `ci.yml` (lint, typecheck, test, build) — @devops-engineer — §23.10
- [x] `OGS-022` CI workflow `pr-discipline.yml` (TASKS update + skills section + linked task + blueprint ref) — @devops-engineer — AGENTS.md §9
- [x] `OGS-023` gitleaks pre-commit + CI — @security-engineer — SECURITY.md §0 rule 5
- [x] `OGS-032` CI workflow `stack-currency.yml` (`pnpm version-check` nightly + on PR) — @devops-engineer + @security-engineer — blueprint §3.2.1
- [x] `OGS-033` CI workflow `verify-no-dead-names.yml` (block legacy major patterns) — @devops-engineer + @architecture-reviewer — blueprint §3.1.1

### Node, pnpm, workspace, tooling

- [x] `OGS-004` `.nvmrc` (Node 24) — @devops-engineer — §29.1
- [x] `OGS-005` Root `package.json` with `"type": "module"`, engines node ≥ 24, pnpm ≥ 11 — @devops-engineer — §4.8
- [x] `OGS-006` `pnpm-workspace.yaml` — @devops-engineer — §4.7
- [x] `OGS-007` `turbo.json` (Turborepo 2.9) — @devops-engineer — §4.6
- [x] `OGS-008` `tsconfig.base.json` (TypeScript 6) — @devops-engineer — §4.12
- [x] `OGS-009` ESLint 10 flat config + Prettier 3.8 — @devops-engineer — §4.10–§4.11
- [x] `OGS-010` `mprocs.yaml` — @devops-engineer — §4.9
- [x] `OGS-011` `tooling/{tsconfig,eslint-config,tailwind-config}` shared workspaces — @devops-engineer — §29.4
- [x] `OGS-012` `tooling/scripts/bootstrap.sh` (idempotent) — @devops-engineer — §29.15

### Database, infra, accounts

- [x] `OGS-013` Neon project + dev branch; `.env.example` placeholders — @devops-engineer — §3.3
- [x] `OGS-014` Enable `pgvector` 0.8 on Neon — @database-engineer — §5.4
- [x] `OGS-015` Vercel team + 8 projects — @devops-engineer — §3.3
- [x] `OGS-016` Vercel env vars from `.env.example` (every key in blueprint §28.1) — @devops-engineer + @security-engineer — §28.1
- [ ] `OGS-017` Sentry org + 8 projects — @devops-engineer — §22.7
- [x] `OGS-018` Cloudflare DNS for every domain in §2.1 — @devops-engineer + @engineering-lead — §1.2

### Arcjet security primitives (top priority)

- [x] `OGS-026` Provision Arcjet site; per-env `ARCJET_KEY`; add to `.env.example` + `turbo.json` + Vercel — @security-engineer + @devops-engineer — SECURITY.md §6
- [x] `OGS-027` Scaffold `packages/security/src/arcjet/index.ts` with 5 canonical rule sets — @security-engineer — SECURITY.md §6.2
- [x] `OGS-028` Add `apps/web-*/src/proxy.ts` mounting Arcjet on every app (publicShield baseline) — @security-engineer + @devops-engineer — SECURITY.md §6.3
- [ ] `OGS-029` Verify Arcjet denies bot + rate-limits OTP brute-force on preview — @qa-engineer — SECURITY.md §6.3

### Stack-currency tooling

- [x] `OGS-030` Author `tooling/scripts/version-check.ts`; wire `pnpm version-check` script — @devops-engineer + @security-engineer — blueprint §3.2.1
- [x] `OGS-031` Configure renovate.json for weekly minor + patch upgrades within locked floors — @devops-engineer — blueprint §3.2.3

### Hello-world apps + scaffold + runbooks

- [x] `OGS-019` Hello-world `apps/web-id` (renders OGS logo) — @auth-engineer — §29.10
- [x] `OGS-020` Hello-world remaining 7 apps + workers — @devops-engineer — §29.10
- [x] `OGS-024` ADR scaffolding (`0000-template.md`, `INDEX.md`) — @docs-writer — §28.3
- [x] `OGS-025` Local dev runbook — @docs-writer — §29

### Phase 00 exit gate (run by @qa-engineer)

Phase 00 is **closed** when every item below is true. The original draft of this gate included items that belong to Phase 01 (Inngest dev, Prisma Studio, per-app Sentry test errors) — those have been moved to the Phase 01 entry gate where they actually live.

- [x] CI green on `main` for the latest commit (lint, typecheck, test, build).
- [x] `pnpm version-check` exits 0 with **all green** on a fresh clone.
- [x] All 8 hello-world apps build and deploy to Vercel (HTTP 200 on production URL).
- [x] `proxy.ts` mounting Arcjet is wired on every app and packaged in `@ogs/security`.
- [x] `.env.example` covers every secret consumed by the platform (one-to-one with blueprint §28.1).
- [x] `.env.local` values mirrored into all 8 Vercel projects (production + preview + development scopes).
- [x] Neon dev branch reachable, `pgvector` 0.8 enabled.
- [x] `docs/runbooks/local-dev.md` brings a new contributor from clone → `pnpm dev`.
- [x] `OGS-029` — empirical proof Arcjet blocks bots + throttles repeated requests on the live deploys.

### Phase 00 — Deferred (not blocking exit gate)

| ID              | Task                                                                                               | Reason for defer                                                                                                                       |
| --------------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `OGS-002`       | Branch protection on `main`                                                                        | Blocked by GitHub plan tier — private repos on Hobby cannot enforce branch protection. Revisit when org upgrades to Team / Enterprise. |
| `OGS-017`       | Sentry org + 8 projects                                                                            | Owner deferred — to be re-opened in Phase 02 once we have something worth instrumenting. Until then, errors surface via Vercel logs.   |
| `OGS-022`-prove | Negative-test `pr-discipline.yml`, `verify-no-dead-names.yml`, gitleaks against a synthetic bad PR | Workflows are in place; live negative test deferred to Phase 01 first PR cycle.                                                        |

---

## Phase 01 — Foundation rails (Week 1)

> Plan file: [`docs/plans/phase-01-foundation-rails.md`](docs/plans/phase-01-foundation-rails.md). Atomic steps are expanded by @engineering-lead the Friday before Week 1 opens.

**Owners.** @database-engineer (lead), @auth-engineer, @api-engineer, @ui-engineer, @devops-engineer, @code-reviewer.

### @ogs/config

- [x] `OGS-030` `PAGINATION` constants — @devops-engineer — §11.1
- [x] `OGS-031` Shared enums (Locale, AppName) — @devops-engineer — §4

### @ogs/db — Prisma 7 (multi-file schema + driver adapter + ESM)

- [x] `OGS-040` Workspace setup; install `prisma@^7`, `@prisma/client@^7`, `@prisma/adapter-pg@^7`, `dotenv@^17` — @database-engineer — §29.5
- [x] `OGS-041` `prisma/schema/_datasource.prisma` (provider `prisma-client`, no `url`) — @database-engineer — §5.4
- [x] `OGS-042` `prisma/schema/auth.prisma` (Better Auth tables) — @database-engineer — §5.5
- [x] `OGS-043` `prisma/schema/tenancy.prisma` (Tenant, Membership) — @database-engineer — §5.6
- [x] `OGS-044` `prisma/schema/worker.prisma` — @database-engineer — §5.7
- [x] `OGS-045` `prisma/schema/company.prisma` (Company, Enterprise) — @database-engineer — §5.8
- [x] `OGS-046` `prisma/schema/careers.prisma` — @database-engineer — §5.9
- [x] `OGS-047` `prisma/schema/academy.prisma` — @database-engineer — §5.10
- [x] `OGS-048` `prisma/schema/skillpass.prisma` — @database-engineer — §5.11
- [x] `OGS-049` `prisma/schema/payments.prisma` — @database-engineer — §5.12
- [x] `OGS-050` `prisma/schema/secrets.prisma` (SecretCredential, includes ARCJET_KEY-class types) — @database-engineer — §5.13
- [x] `OGS-051` `prisma/schema/ai.prisma` (AIInteraction, PromptVersion, EvalRun, KnowledgeDocument, EmbeddingChunk) — @database-engineer — §5.14
- [x] `OGS-052` `prisma/schema/notifications.prisma` (Document, Notification, NotificationPreference) — @database-engineer — §5.15
- [x] `OGS-053` `prisma/schema/audit.prisma` (AuditLog, WebhookEvent) — @database-engineer — §5.16
- [x] `OGS-054` `prisma/schema/platform.prisma` (FeatureFlag, AppSettings) — @database-engineer — §5.17
- [x] `OGS-055` First `prisma migrate dev` against Neon dev — @database-engineer — §5.18
- [x] `OGS-056` `packages/db/src/extensions/soft-delete.ts` — @database-engineer — §16.2
- [x] `OGS-057` `packages/db/src/extensions/tenant-scope.ts` (AsyncLocalStorage) — @database-engineer — §16.3
- [x] `OGS-058` `packages/db/src/extensions/audit.ts` — @database-engineer — §16.4
- [x] `OGS-059` Composed Prisma client `packages/db/src/index.ts` — @database-engineer — §16.1
- [x] `OGS-060` `packages/db/src/run-with-actor.ts` envelope — @database-engineer — §16.5
- [x] `OGS-061` `prisma/seed.ts` minimal seed — @database-engineer — §5
- [x] `OGS-062` `packages/db/prisma.config.ts` with `@prisma/adapter-pg` + `import "dotenv/config"` (Prisma 7) — @database-engineer — §5.4.1
- [x] `OGS-063` `packages/db/src/client.ts` instantiates `new PrismaClient({ adapter: new PrismaPg(...) })` — @database-engineer — §5.4.3
- [x] `OGS-064` `packages/db/package.json` set `"type": "module"` (ESM mandatory in Prisma 7) — @database-engineer — §5.4.4

### @ogs/auth — Better Auth 1.6 + @better-auth/oauth-provider

- [x] `OGS-070` Workspace setup; install `better-auth@^1.6`, `@better-auth/oauth-provider@^0.1`, `nanoid@^5` — @auth-engineer — §29.6
- [x] `OGS-071` `client-config.ts` per-app OIDC client factory — @auth-engineer — §6.4
- [x] `OGS-072` `guards.ts` (`requireAuth`, `requireRole`, `requireTenant`, `requireFeature`, `trpcRequireAuth`) — @auth-engineer — §6.8
- [x] `OGS-073` Stub `server/provisioning.ts` — @auth-engineer — §6.6

### @ogs/api — tRPC v11 + superjson

- [x] `OGS-080` Workspace setup; install `@trpc/server@^11.17`, `@trpc/client@^11.17`, `@tanstack/react-query@^5.100`, `superjson@^2` — @api-engineer — §29.7
- [x] `OGS-081` `trpc.ts` (context + procedure hierarchy) — @api-engineer — §7.1
- [x] `OGS-082` `query-client.ts` — @api-engineer — §7.2
- [x] `OGS-083` `server-helpers.tsx` (prefetch + HydrateClient) — @api-engineer — §7.3
- [x] `OGS-084` `client.tsx` TRPCReactProvider — @api-engineer — §7.4
- [x] `OGS-085` Empty `root.ts` with `appRouter` + `AppRouter` type — @api-engineer — §7.6

### @ogs/ui — full shadcn primitive set + EntityX + theme + Avatar

- [x] `OGS-090` Workspace setup; shadcn init — @ui-engineer — §29.8
- [~] `OGS-091` Install full shadcn primitive set (~50) in one batch — @ui-engineer — §9.1
- [x] `OGS-092` `lib/cn.ts` — @ui-engineer — §9.8
- [x] `OGS-093` `theme/tokens.css` (light + dark) — @ui-engineer — §3.5.1
- [x] `OGS-094` `theme/provider.tsx` (OgsThemeProvider) — @ui-engineer — §3.5.2
- [x] `OGS-095` `theme/brand.ts` per-tenant resolver — @ui-engineer — §3.5.3
- [x] `OGS-096` `components/theme-toggle.tsx` — @ui-engineer — §3.5.4
- [x] `OGS-097` `data-display/entity.tsx` (EntityHeader/Container/Search/Pagination/Loading/Error/Empty/List/Item) — @ui-engineer — §9.2
- [x] `OGS-098` `data-display/data-table.tsx` (TanStack Table) — @ui-engineer — §9.3
- [x] `OGS-099` `components/avatar.tsx` (UserAvatar + AgentAvatar; no DiceBear) — @ui-engineer — §9.4
- [x] `OGS-100` Bundle 12 neutral geometric SVGs in `src/assets/agent-avatars/` — @ui-engineer — §9.4
- [x] `OGS-101` `use-error-modal.tsx` — @ui-engineer — §9.5
- [x] `OGS-102` `forms/use-entity-search.ts` (500 ms debounce) — @ui-engineer — §9.6
- [x] `OGS-103` `use-confirm.tsx` (promise-based) — @ui-engineer — §10.3
- [-] `OGS-104` Turbo task to copy `assets/agent-avatars/` to every app's `public/` — @ui-engineer — §9.4 (abandoned — see [ADR-0007](docs/adr/0007-agent-avatars-inline-svg.md))

### App shells consuming @ogs/ui

- [x] `OGS-110` Bootstrap `apps/web-id` shell with OGS logo home page using @ogs/ui + theme toggle — @auth-engineer — §29.10
- [x] `OGS-111` Bootstrap remaining 7 apps with shared `<AppShell>` primitive — @devops-engineer + @ui-engineer — §29.10 (workers are not Next.js apps — deferred to Phase 03)

### Phase 01 exit gate

`pnpm typecheck` green. `prisma migrate dev` succeeds. Soft-delete + tenant-scope + audit integration tests pass. `apps/web-id` renders the themed home page with dark/light mode working. No `prisma-client-js` / `middleware.ts` / `oidcProvider` patterns introduced (CI: `verify-no-dead-names` green).

---

## Phase 02 — Identity hub (Week 2)

> Plan file: [`docs/plans/phase-02-identity-hub.md`](docs/plans/phase-02-identity-hub.md). Atomic steps expanded Friday before Week 2.

**Owners.** @auth-engineer (lead), @security-engineer, @notifications-engineer, @qa-engineer.

### Identity hub Better Auth (oauthProvider, NOT oidcProvider)

- [x] `OGS-120` `packages/auth/src/server.ts` with `oauthProvider` + `jwt` + `emailOTP` + `twoFactor` (per blueprint §6.2) — @auth-engineer — §6.2
- [ ] `OGS-121` Catch-all auth route `apps/web-id/src/app/api/auth/[...all]/route.ts` — @auth-engineer — §6.3
- [x] `OGS-122` `packages/auth/src/client-config.ts` extended with `genericOAuthClient` + `emailOTPClient` + `twoFactorClient` — @auth-engineer — §6.5
- [x] `OGS-123` `/login` (modules/auth + tRPC + RHF/zod, ratelimited via Arcjet) — @auth-engineer — §6.1
- [x] `OGS-124` `/signup` (modules/auth + tRPC + RHF/zod) — @auth-engineer — §6.1
- [ ] `OGS-125` `/2fa` page in web-id — @auth-engineer — §6.5 (DEFERRED — twoFactor plugin landed; UI pending)
- [x] `OGS-125a` `InputOTP` primitive added to `@ogs/ui` (consumer of OGS-125) — @ui-engineer — §9
- [x] `OGS-126` `/account/sessions` (Suspense + tRPC, masked IP) — @auth-engineer — §6.11
- [x] `OGS-127` `/forbidden` page used by guards — @auth-engineer — §6.8
- [ ] `OGS-128` Unit tests for `safeCallbackURL` + `maskIp` (open-redirect + PII boundary) — @qa-engineer — follow-up

### Worker provisioning on signup

- [ ] `OGS-130` `provisionWorkerOnSignup` — @auth-engineer — §6.6
- [ ] `OGS-131` Wire `afterSignUp` callback into Better Auth — @auth-engineer — §6.2
- [ ] `OGS-132` Idempotency integration test (same email twice → one Worker) — @qa-engineer — §6.6
- [ ] `OGS-133` OGS-W-{YYYY}-{NANOID8} collision-retry test — @qa-engineer — §6.6

### OIDC clients in product apps

- [ ] `OGS-140` `apps/web-careers/src/lib/auth.ts` OIDC client — @auth-engineer — §6.4
- [ ] `OGS-141` OIDC clients in remaining 6 apps — @auth-engineer — §6.4
- [ ] `OGS-142` Cross-domain SSO end-to-end Playwright (Flow J) — @qa-engineer — §6.9
- [ ] `OGS-143` Sign-out flow tested across all 7 apps — @qa-engineer — §6.10

### Nodemailer SMTP + OTP delivery (Nodemailer 8)

- [x] `OGS-150` `packages/email/src/transport.ts` (Nodemailer 8 + SMTP, pooled) — @notifications-engineer — §18.3
- [x] `OGS-151` `magic-otp.tsx` React Email template — @notifications-engineer — §18.4
- [x] `OGS-152` `render.ts` dispatcher — @notifications-engineer — §18.4
- [x] `OGS-153` Wire `sendOTPEmail` into Better Auth `emailOTP.sendVerificationOTP` — @auth-engineer + @notifications-engineer — §6.2
- [ ] `OGS-154` Mailtrap dev SMTP creds — @devops-engineer — §28.1

### Admin role gate + seed

- [ ] `OGS-160` `apps/web-admin/src/proxy.ts` OGS\_\* role gate (Next.js 16 proxy) — @auth-engineer — §6.12
- [ ] `OGS-161` Seed one `OGS_SUPER_ADMIN` membership — @database-engineer — §5

### Arcjet on auth routes (Phase-2 composition)

- [ ] `OGS-162` Compose Arcjet `authEndpoint` over `/api/auth/**` in `apps/web-id/src/proxy.ts` — @auth-engineer + @security-engineer — SECURITY.md §6.3
- [ ] `OGS-163` Compose Arcjet `publicForm` on `/login`, `/signup`, `/forgot-password` — @auth-engineer + @security-engineer — SECURITY.md §6.2
- [ ] `OGS-164` Sentry breadcrumb tagging for Arcjet denied decisions (`arcjet.denied`) — @security-engineer + @devops-engineer — SECURITY.md §6.9

### Phase 02 exit gate

Signing in at id.ogs-tc.com produces a session at a stub web-careers page that displays the user's Worker public id. OTP brute-force is rate-limited (Arcjet test). 2FA is enforced for staff. No `oidcProvider` reference anywhere in the diff (CI: `verify-no-dead-names`).

---

## Phase 03 — Live-video shell (Week 3)

> Plan file: [`docs/plans/phase-03-live-video-shell.md`](docs/plans/phase-03-live-video-shell.md).

**Owners.** @live-video-engineer (lead), @security-engineer, @api-engineer, @qa-engineer.

- [ ] `OGS-170` Workspace `packages/live-video` (Stream Video v1.36, Stream Chat React v14) — @live-video-engineer — §29.9
- [ ] `OGS-171` `providers/stream-video.ts` (StreamClient init) — @live-video-engineer — §12.1
- [ ] `OGS-172` `providers/stream-chat.ts` (StreamChat init) — @live-video-engineer — §12.1
- [ ] `OGS-173` Live token tRPC router (`videoToken`, `chatToken`, `ensureCall`) — @live-video-engineer + @api-engineer — §12.2
- [ ] `OGS-174` `components/call-lobby.tsx` — @live-video-engineer — §12.5
- [ ] `OGS-175` `components/call-active.tsx` (mode-aware layouts) — @live-video-engineer — §12.5
- [ ] `OGS-176` `components/call-ended.tsx` — @live-video-engineer — §12.5
- [ ] `OGS-177` `components/call-shell.tsx` (single shell, mode prop) — @live-video-engineer — §12.4
- [ ] `OGS-178` `webhooks.ts` (verify Stream signature + idempotency + dispatch) — @live-video-engineer + @security-engineer — §12.6
- [ ] `OGS-179` Per-event handlers (started, participant_left, ended, transcription_ready, recording_ready) — @live-video-engineer — §12.6
- [ ] `OGS-180` Wire `apps/web-academy/src/app/api/webhooks/stream/route.ts` — @live-video-engineer — §12.6
- [ ] `OGS-181` Wire `apps/web-skillpass/src/app/api/webhooks/stream/route.ts` — @live-video-engineer — §12.6
- [ ] `OGS-182` Wire `apps/web-careers/src/app/api/webhooks/stream/route.ts` — @live-video-engineer — §12.6
- [ ] `OGS-185` Wire `(class)/sessions/[liveSessionId]/page.tsx` — @live-video-engineer — §12.3
- [ ] `OGS-186` Wire `(assessment)/attempts/[attemptId]/live/page.tsx` — @live-video-engineer — §12.3
- [ ] `OGS-187` Wire `(interview)/interviews/[id]/page.tsx` — @live-video-engineer — §12.3
- [ ] `OGS-190` Provision Stream sandbox — @devops-engineer — §12.9
- [ ] `OGS-191` Verify Stream webhook round-trip on preview — @qa-engineer — §12.6

### Phase 03 exit gate

A hardcoded LiveSession id opens a Stream room with lobby → active → ended. Webhook receives `call.session_started` and persists `LiveSession.status = LIVE`. Recording + transcription metadata flow back.

---

## Phase 04 — Careers vertical slice (Weeks 4–5)

> Plan file: [`docs/plans/phase-04-careers-vertical.md`](docs/plans/phase-04-careers-vertical.md). Macro IDs `OGS-200 … OGS-282` (grandfathered range). Expanded JIT.

**Owners.** @frontend-feature-engineer (lead), @api-engineer, @ai-engineer, @inngest-engineer, @payments-engineer, @notifications-engineer, @ui-engineer, @qa-engineer.

Notable Arcjet entries:

- `OGS-247` Apply Arcjet `publicForm` on `/apply/[slug]` Flow K
- `OGS-248` Apply Arcjet `mutation` token-bucket inside `application.create` tRPC procedure
- `OGS-249` Apply Arcjet `mutation` on CV-upload presign

Stack-currency entries baked into the macro list:

- Stripe 22 with `apiVersion: "2026-03-25.dahlia"` (OGS-272)
- Vercel AI SDK v6 patterns in CV_PARSE_V1 / JOB_MATCH_V1 (OGS-214, OGS-253)
- Inngest v4 trigger-in-options shape (every fn task)

---

## Phase 05 — Academy + SkillPass (Weeks 6–7)

> Plan file: [`docs/plans/phase-05-academy-skillpass.md`](docs/plans/phase-05-academy-skillpass.md). Macro IDs `OGS-300 … OGS-382`.

**Owners.** @frontend-feature-engineer (lead), @files-vod-engineer, @api-engineer, @inngest-engineer, @ai-engineer, @ui-engineer, @i18n-engineer.

Notable stack-currency entries:

- Bunny.net Stream (NOT Mux) for VOD; hls.js for the player (OGS-310 through OGS-314)
- Bilingual cert PDFs via @react-pdf/renderer 4 + the v4 next-intl `await requestLocale` pattern (OGS-380, OGS-381, OGS-382)

---

## Phase 06 — AI summarizer + tutor (Week 8)

> Plan file: [`docs/plans/phase-06-ai-summarizer-tutor.md`](docs/plans/phase-06-ai-summarizer-tutor.md). Macro IDs `OGS-400 … OGS-426`.

**Owners.** @ai-engineer (lead), @inngest-engineer, @live-video-engineer, @security-engineer.

Notable stack-currency entries:

- Vercel AI SDK v6 `generateText({ output: { type: "object", schema } })` — every task in `packages/ai/src/tasks/*`
- Inngest v4 trigger-in-options in `summarize-live-session`
- stream-chat-react 14: `MessageComposer` (not `MessageInput`), `WithComponents` for Channel overrides, hooks (not HOCs)
- Arcjet `aiEndpoint` token-bucket on every `runAITask`-consuming procedure (OGS-425, OGS-426)

---

## Phase 07 — AI proctoring + oral viva (Week 9)

> Plan file: [`docs/plans/phase-07-ai-proctoring-viva.md`](docs/plans/phase-07-ai-proctoring-viva.md). Macro IDs `OGS-440 … OGS-462`.

**Owners.** @live-video-engineer (lead), @ai-engineer, @api-engineer, @security-engineer.

---

## Phase 08 — AI eval framework + cost dashboard (Week 10)

> Plan file: [`docs/plans/phase-08-ai-evals-cost.md`](docs/plans/phase-08-ai-evals-cost.md). Macro IDs `OGS-470 … OGS-492`.

**Owners.** @ai-engineer (lead), @inngest-engineer, @frontend-feature-engineer, @database-engineer.

---

## Phase 09 — Admin + payments hardening (Week 11)

> Plan file: [`docs/plans/phase-09-admin-payments.md`](docs/plans/phase-09-admin-payments.md). Macro IDs `OGS-500 … OGS-553`.

**Owners.** @payments-engineer (lead), @security-engineer, @frontend-feature-engineer, @inngest-engineer, @ui-engineer, @auth-engineer.

Notable stack-currency entries:

- Stripe 22 (`2026-03-25.dahlia`), Lemon Squeezy 4, Polar 0.47, PayMob v1 — admin switcher
- 2FA step-up on switcher writes
- AES-256-GCM encryption envelope with key rotation
- React Flow workflow editor (@xyflow/react 12.10), Jotai 2.20

---

## Phase 10 — Hardening + pilot launch (Week 12)

> Plan file: [`docs/plans/phase-10-launch.md`](docs/plans/phase-10-launch.md). Macro IDs `OGS-600 … OGS-651`.

**Owners.** @engineering-lead (lead), @qa-engineer, @security-engineer, @devops-engineer, @docs-writer.

---

## Phase XC — Cross-cutting tracks (runs in parallel across Wave 1)

> Plan file: [`docs/plans/phase-XC-cross-cutting.md`](docs/plans/phase-XC-cross-cutting.md). Macro IDs `OGS-700 … OGS-751` (grandfathered) + `OGS-1100 … OGS-1199` for future additions.

### i18n + RTL

- [ ] `OGS-700` Wire next-intl v4 in every app (`i18n/request.ts` + `NextIntlClientProvider`) with `en.json` / `ar.json` — @i18n-engineer — §21.1
- [ ] `OGS-701` RTL layout audit per app — @i18n-engineer — §21.2
- [ ] `OGS-702` Bilingual cert PDF templates — @docs-writer + @i18n-engineer — §21.6
- [ ] `OGS-703` Bilingual transactional emails — @notifications-engineer + @i18n-engineer — §21.6

### Audit + soft-delete + tenant-scope drills

- [ ] `OGS-710` Integration tests confirming AuditLog emitted on every sensitive write — @qa-engineer — §16.4
- [ ] `OGS-711` Soft-delete filter tests on every soft-deletable model — @qa-engineer — §16.2
- [ ] `OGS-712` Tenant-scope tests (cross-tenant read → 404) — @qa-engineer — §16.3

### Webhooks discipline

- [ ] `OGS-720` Canonical webhook receiver in `packages/webhooks` — @security-engineer — §20.2
- [ ] `OGS-721` Webhook replay tool in admin — @security-engineer + @frontend-feature-engineer — §20.6

### Continuous

- [ ] `OGS-730` PR template prompts the six security checks — @docs-writer — §23.9
- [ ] `OGS-731` Configure renovate.json (already part of OGS-033 — keep this as a tracking placeholder if it diverges) — @devops-engineer — §3.2
- [ ] `OGS-740` Maintain blueprint markdown source — @task-curator — §1.5
- [ ] `OGS-741` Author ADRs as decisions arise — @docs-writer + @architecture-reviewer — §28.3
- [ ] `OGS-742` Maintain `docs/runbooks/` per blueprint §26.8 (TR-10) — @docs-writer + @security-engineer
- [ ] `OGS-750` Confirm `@ogs/db` and `@ogs/api` types are mobile-consumable — @ui-engineer + @api-engineer — §3
- [ ] `OGS-751` Confirm OIDC client config supports a public client (PKCE) — @auth-engineer — §6.4

---

## Wave 2, Wave 3, Future backlogs

Backlogs open into per-feature plan files when their wave opens. ID blocks reserved: W2 `OGS-2000+`, W3 `OGS-3000+`, Future `OGS-9000+`. See blueprint §26 for the full user-story catalog.

---

## Decision log

ADRs accepted. Each ADR lives in `docs/adr/<NNNN>-<slug>.md`.

| #   | Date | Topic         | ADR | Status |
| --- | ---- | ------------- | --- | ------ |
| —   | —    | (no ADRs yet) | —   | —      |

---

## Blockers register

Tasks marked `[!]`. Each blocker has a path to resolution.

| Task ID | Title | Owner | Since | Blocks | Resolution path |
| ------- | ----- | ----- | ----- | ------ | --------------- |
| —       | —     | —     | —     | —      | —               |

---

## Risk register

Reviewed every Monday in the engineering sync.

| ID   | Risk                                                 | Likelihood | Impact | Mitigation                                                              | Owner                  |
| ---- | ---------------------------------------------------- | ---------- | ------ | ----------------------------------------------------------------------- | ---------------------- |
| R-01 | Iraqi payment gateway not selected by Week 12        | Medium     | Medium | Stripe + manual invoice until partner chosen                            | @engineering-lead      |
| R-02 | Bunny.net Stream MENA CDN below expectations         | Low        | Medium | Benchmark in Phase 5; ADR-gated fallback                                | @files-vod-engineer    |
| R-03 | AI cost overruns past USD 2 / MAU                    | Medium     | High   | Cost dashboard + per-tenant alerts + Haiku fallback                     | @ai-engineer           |
| R-04 | Stream.io recording quotas                           | Low        | Medium | Track usage in admin / observability                                    | @live-video-engineer   |
| R-05 | OIDC SSO cookie edge cases across 7 subdomains       | Medium     | High   | Cross-domain test matrix in CI                                          | @auth-engineer         |
| R-06 | ISO 17024 readiness drift                            | High       | High   | Soft-delete + audit-log invariants; security gates per PR               | @security-engineer     |
| R-07 | Super-admin role concentration                       | Medium     | High   | Two-person rule + 2FA step-up + audit log                               | @security-engineer     |
| R-08 | New majors land mid-wave (Next.js / Prisma / AI SDK) | Medium     | Medium | `pnpm version-check` nightly + `verify-no-dead-names` CI + per-bump ADR | @architecture-reviewer |

---

## Archive

Abandoned tasks. Never deleted. Reason and timestamp required.

| Task ID    | Title                     | Reason                               | Date       |
| ---------- | ------------------------- | ------------------------------------ | ---------- |
| `OGS-029a` | (renumbered to `OGS-032`) | Cleanup — letter suffixes deprecated | 2026-05-11 |
| `OGS-029b` | (renumbered to `OGS-033`) | Cleanup — letter suffixes deprecated | 2026-05-11 |

---

**Index version:** v3 — restructured for clarity, ID-block convention adopted, stack-currency tasks first-class, dead-name CI gate in Phase 0, cross-cutting moved to dedicated plan file. Aligned with blueprint v01 (Next 16, Prisma 7, AI SDK v6, Inngest v4, Stripe 22, Better Auth 1.6, ESLint 10, pnpm 11).
