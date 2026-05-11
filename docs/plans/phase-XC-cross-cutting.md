# Phase XC — Cross-cutting tracks

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
> Every step invokes `superpowers:using-superpowers` first; `SECURITY.md` and `CODE_STANDARDS.md` apply.

**Goal.** Tracks that run continuously across Wave 1, in parallel with the per-week phases. Each track has a single owning agent who picks up its tasks as time allows or in dedicated days.

**Exit criterion.** Every `[ ]` task in this file is `[x]` by end of Week 12. Failing that, any remaining task escalates to the W2 backlog with explicit rationale.

**Window.** Weeks 1–12 (entire Wave 1).

**Owners.** Distributed — see per-task `Owner` field.

**Prerequisites.** Phase 00 complete (CI gates live so the cross-cutting work has a place to be reviewed).

**Security gates that apply (SECURITY.md §1).** All ten. Cross-cutting is where most of the audit + soft-delete + tenant-scope discipline actually lands.

---

## Track 1 — Internationalization + RTL

### `OGS-700` — Wire next-intl v4 in every app

**Owner:** @i18n-engineer
**Blueprint:** §21.1
**Files:** `apps/web-*/src/i18n/request.ts`, `apps/web-*/src/app/layout.tsx`, `apps/web-*/messages/en.json`, `apps/web-*/messages/ar.json`

Mount `NextIntlClientProvider` at the root layout of every app. Use `await requestLocale` inside `getRequestConfig`. Seed `en.json` / `ar.json` with the canonical strings every app needs.

### `OGS-701` — RTL layout audit per app

**Owner:** @i18n-engineer
**Blueprint:** §21.2
**Files:** Each app's `app/layout.tsx`, every `modules/*/ui/`

Verify that every component renders correctly with `dir="rtl"`. Icons that have direction (chevrons, arrows) flip. Logos and currency symbols do not.

### `OGS-702` — Bilingual certificate PDF templates

**Owner:** @docs-writer + @i18n-engineer
**Blueprint:** §21.6
**Files:** `packages/pdf/src/certificates/*.tsx`

Render two-column EN/AR layout. QR token at the bottom. Co-branded with TÜV + enterprise sponsor when applicable.

### `OGS-703` — Bilingual transactional emails

**Owner:** @notifications-engineer + @i18n-engineer
**Blueprint:** §21.6
**Files:** `packages/email/src/templates/*.tsx`

Every transactional email (OTP, certificate issued, course enrolled, order paid, application stage changed, certification expiring) renders correctly in both languages with `dir` flipped on the wrapper.

---

## Track 2 — Audit + soft-delete + tenant-scope integration drills

### `OGS-710` — AuditLog emission tests on every sensitive write

**Owner:** @qa-engineer
**Blueprint:** §16.4
**Files:** `tests/integration/audit/*.test.ts`

One test per sensitive model in `AUDITED_MODELS`. Each test exercises one Prisma write and asserts the corresponding `AuditLog` row exists with the correct `entityType`, `actorUserId`, `before`, `after`.

### `OGS-711` — Soft-delete filter tests on every soft-deletable model

**Owner:** @qa-engineer
**Blueprint:** §16.2
**Files:** `tests/integration/soft-delete/*.test.ts`

One test per model in `SOFT_DELETE_MODELS`. Each test creates → soft-deletes → asserts `findMany` excludes; → asserts `findMany({ includeDeleted: true })` includes; → asserts `delete` does not hard-delete.

### `OGS-712` — Tenant-scope tests (cross-tenant reads → 404)

**Owner:** @qa-engineer
**Blueprint:** §16.3
**Files:** `tests/integration/tenant-scope/*.test.ts`

Per tenant-scoped model: tenant A creates a row; the request executes under tenant B's context (`withTenant({ tenantId: B })`); reads return empty / NOT_FOUND. Writes under tenant B do not affect tenant A's rows.

---

## Track 3 — Webhooks discipline

### `OGS-720` — Canonical webhook receiver in `packages/webhooks`

**Owner:** @security-engineer
**Blueprint:** §20.2
**Files:** `packages/webhooks/src/receiver.ts`, `packages/webhooks/src/verifiers/{stream,mux,stripe,lemon,polar,paymob,inngest,bunny,docusign,ms-graph}.ts`

The five-step receiver helper: verify signature → parse → idempotency on `WebhookEvent` → process → mark processed. Every per-app webhook route in the codebase wraps this helper.

### `OGS-721` — Webhook replay tool in admin

**Owner:** @security-engineer + @frontend-feature-engineer
**Blueprint:** §20.6
**Files:** `apps/web-admin/src/modules/webhooks/`

OGS_OPS can search `WebhookEvent` rows, view the payload, click "Replay" to re-run the handler. Replay records an AuditLog entry with the actor.

---

## Track 4 — Documentation, ADRs, runbooks (continuous)

### `OGS-740` — Maintain blueprint markdown source

**Owner:** @task-curator
**Blueprint:** §1.5
**Files:** `docs/blueprint/blueprint.md`

The markdown mirror is the source-of-truth diff target; the docx is the published artifact. Any ADR-accepted change updates the markdown first, then regenerates the docx.

### `OGS-741` — Author ADRs as decisions arise

**Owner:** @docs-writer + @architecture-reviewer
**Blueprint:** §28.3
**Files:** `docs/adr/<NNNN>-<slug>.md`

Use the template at `docs/adr/0000-template.md`. Architecture Reviewer accepts; docs-writer drafts on request. Every accepted ADR shows up in `docs/adr/INDEX.md` and in the Decision Log in `TASKS.md`.

### `OGS-742` — Maintain `docs/runbooks/`

**Owner:** @docs-writer + @security-engineer
**Blueprint:** §26.8 (TR-10)
**Files:** `docs/runbooks/{local-dev,key-rotation,retention,incident-response,backup-verification,refund-flow,payment-provider-switch,arcjet}.md`

One runbook per recurring operation. Updated when the underlying procedure changes; reviewed quarterly.

---

## Track 5 — Mobile-readiness (prepares W3)

### `OGS-750` — Confirm `@ogs/db` and `@ogs/api` types are mobile-consumable

**Owner:** @ui-engineer + @api-engineer
**Blueprint:** §3
**Files:** `packages/api/src/root.ts` (verify exports include the `AppRouter` type), `packages/db/src/generated/client` (verify generated types are non-server-only where possible)

Mobile apps will import `AppRouter` from `@ogs/api` and consume tRPC. Confirm no server-only imports leak through the type surface.

### `OGS-751` — OIDC client config supports a public client (PKCE)

**Owner:** @auth-engineer
**Blueprint:** §6.4
**Files:** `packages/auth/src/client-config.ts`

Better-Auth's `genericOAuth` already issues PKCE. Confirm by reading the generated authorize URL and verifying the `code_challenge` + `code_challenge_method=S256` params. Document in `docs/runbooks/mobile-pkce.md`.

---

## Track 6 — Stack currency (continuous, owned by DevOps + Security)

### Already provisioned in Phase 00

These tasks live in Phase 00 (OGS-022, OGS-023, OGS-032, OGS-033). They run continuously after that phase closes. No further macro tasks here, but the dashboard column in `TASKS.md` `[ ]`/`[~]`/`[x]` reflects ongoing health.

---

## Phase XC exit verification

- [ ] All `OGS-700`..`OGS-751` are `[x]`.
- [ ] Audit, soft-delete, tenant-scope integration tests are in CI and green.
- [ ] Every webhook receiver in the codebase wraps `packages/webhooks/src/receiver.ts`.
- [ ] `docs/runbooks/` contains the eight canonical runbooks.
- [ ] Nightly `stack-currency.yml` has been green for 7 consecutive days at Wave 1 close.

---

## Done

(Move completed tasks here as they close.)

---

## Retro

(Filled at Wave 1 close by the Engineering Lead.)
