# ADR-0005: Phase-A audit resolution log

## Status

Accepted (2026-05-12)

## Context

The Phase-A audit (5 parallel `superpowers:code-reviewer` agents
against commits `9308c51..3e79360`) returned 18 BLOCKERS labelled
B1..B18 plus ~80 SHOULD-FIX / NIT findings. This ADR closes that
audit by recording the disposition of every blocker after the
Phase-A remediation commits (`c0c031f..57578c2`) and a second
4-agent verification pass.

## Disposition

| ID      | Topic                                                           | ADR                                            | Disposition                                                                                                                                                                                                                                                                                       |
| ------- | --------------------------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B1**  | `requireRole` cross-tenant IDOR                                 | [0004](./0004-auth-guard-hardening.md)         | **CLOSED** — `tenantSlug` now mandatory; composes `requireTenant` then asserts role. Compile-time enforcement.                                                                                                                                                                                    |
| **B2**  | `getAuthBaseUrl` localhost fallback in prod                     | [0004](./0004-auth-guard-hardening.md)         | **CLOSED** — throws in production unless `NEXT_PHASE=phase-production-build`.                                                                                                                                                                                                                     |
| **B3**  | `requireFeature` `null as never` cast                           | [0004](./0004-auth-guard-hardening.md)         | **CLOSED** — both branches use `findFirst`; cast removed.                                                                                                                                                                                                                                         |
| **B4**  | `provisionUser` not wired                                       | [0004](./0004-auth-guard-hardening.md)         | **CLOSED** — `databaseHooks.user.create.after` fires `provisionUser` on every User creation path.                                                                                                                                                                                                 |
| **B5**  | Feature-flag DSL doc drift                                      | [0004](./0004-auth-guard-hardening.md)         | **CLOSED** — JSDoc, schema doc-comment, and code all agree on the Phase-1 boolean.                                                                                                                                                                                                                |
| **B6**  | Tenant-scope schema desync (7 models)                           | [0003](./0003-prisma-client-and-audit-gate.md) | **CLOSED** — `tenantId String` added to Worker, Experience, Education, Credential, Lesson, LessonProgress + indexes; `EmbeddingChunk` + `NotificationPreference` added to `NO_TENANT_MODELS`. Document already had `tenantId`. Endorsement: was already correct (has `tenantId`, not in opt-out). |
| **B7**  | Proxy `basePrisma` breaks `$extends`                            | [0003](./0003-prisma-client-and-audit-gate.md) | **CLOSED** — `getBasePrisma()` returns a real `PrismaClient`. Composition cached on `globalThis.__ogsPrismaExtended`.                                                                                                                                                                             |
| **B8**  | Audit failures swallowed                                        | [0003](./0003-prisma-client-and-audit-gate.md) | **CLOSED** — fail-loud by default; `OGS_AUDIT_BEST_EFFORT=true` escape hatch for triage only.                                                                                                                                                                                                     |
| **B9**  | Platform writes skipped audit                                   | [0003](./0003-prisma-client-and-audit-gate.md) | **CLOSED** — `AuditLog.tenantId` is nullable; platform mutations now leave a `tenantId: null` row. Migration `20260512200539_phase_a_tenant_id_audit_null` applied.                                                                                                                               |
| **B10** | `protectSignup.email.deny` vs `block`                           | —                                              | **FALSE POSITIVE** — verified against `node_modules/.pnpm/arcjet@1.4.0/node_modules/arcjet/index.d.ts:264-294`: `EmailOptionsDeny.deny: ArcjetEmailType[]` is the canonical field; `block` is not in the type. Phase-A verification reviewer confirmed.                                           |
| **B11** | `protectInProxy` accepts userId-prop clients                    | [0002](./0002-arcjet-rule-set-naming.md)       | **CLOSED** — `NoPropsArcjet = ArcjetNext<{}>` makes mounting `apiProtect` / `mediaUpload` / `aiEndpoint` / `authProtect` a compile error.                                                                                                                                                         |
| **B12** | Identity proxy uses `publicShield` for `/api/auth/**`           | [0002](./0002-arcjet-rule-set-naming.md)       | **CLOSED** — `apps/id/src/proxy.ts` path-dispatches: `/api/auth/**` → `authEndpoint`; `get-session` exempted (high-frequency session read); everything else → `publicShield`.                                                                                                                     |
| **B13** | Tailwind v4 dark mode wiring                                    | —                                              | **CLOSED** — `packages/ui/styles/globals.css` rewritten with the canonical `:root` + `.dark` raw-HSL channels + `@theme inline { --color-*: hsl(var(--*)) }` pattern. `<html class="dark">` now actually flips utilities at runtime.                                                              |
| **B14** | `lucide-react@^1.14.0` doesn't exist                            | —                                              | **FALSE POSITIVE** — `npm view lucide-react version` returns `1.14.0`; lockfile resolves it. Phase-A verification reviewer confirmed.                                                                                                                                                             |
| **B15** | react/react-dom floor vs installed                              | —                                              | **CLOSED** — All 8 apps bumped to `19.2.6` matching the floor. `pnpm version-check` → 66 green / 0 yellow. Scaffold template updated.                                                                                                                                                             |
| **B16** | `proxy.ts` location                                             | [0001](./0001-proxy-ts-location.md)            | **CLOSED** — All 8 moved to `apps/<name>/src/proxy.ts`. Scaffold writes there. tsconfig includes covered by `src/**/*.ts` glob.                                                                                                                                                                   |
| **B17** | `verify-no-dead-names.yml` non-deterministic + missing patterns | —                                              | **CLOSED** — Parallel `PATTERNS[]` / `MESSAGES[]` arrays; new patterns added (`NextMiddleware`, `experimental.middleware`, `runtime: "edge"`, `datasource db { url`). Triggers on both `pull_request` and `push: main`.                                                                           |
| **B18** | CODEOWNERS path drift                                           | —                                              | **CLOSED** — `.github/CODEOWNERS` now uses `apps/<name>/**` (no `apps/web-<name>` left).                                                                                                                                                                                                          |

## Aggregate Result

- **16 BLOCKERS closed.**
- **2 BLOCKERS false positives** (B10, B14) — recorded honestly so the audit history is accurate.
- **0 BLOCKERS open.**
- 5 supporting ADRs (0001–0005) land in the same window.
- Phase-A verification (4 parallel reviewers) confirms each closure with file:line citations.

## Carry-overs flagged by the verification pass (NOT blockers)

These are quality-of-life follow-ups, not Phase-A blockers — tracked
under new TASKS.md items (Phase 02 prep):

1. **`provisionUser` startup self-test** — boot-time assert that
   `ogs-internal` tenant exists, so a misconfigured deploy fails
   loudly at startup rather than at first signup.
2. **Migration safety on non-empty DB** — the Phase-A migration adds
   `tenantId NOT NULL` columns with no default. Safe on the empty
   Neon dev branch; needs a split (add-nullable → backfill →
   set-not-null) before any non-empty environment. Tracked for Phase
   02 deploy runbook.
3. **Stale `lucide-react@1.14.0_react@19.2.0` pnpm store entry** —
   leftover from the pre-pin install. `pnpm install --frozen-lockfile`
   GCs it; CI is unaffected.
4. **Outbox-based audit** — replaces the current "fail-loud or
   best-effort" choice. Phase 02 work.
5. **Full feature-flag DSL** — `percentage:N`, `users:[...]`,
   `roles:[...]`. Phase 02 work.
6. **Wider `verify-no-dead-names` patterns** — `next/legacy/image`,
   `getServerSideProps`, Better Auth pre-1.6 `multiSession` plugin.
   One-line additions when needed.

## Process changes locked in

Going forward (this is the process violation that triggered the
audit):

1. **Before every chunk:** `pnpm version-check` GREEN.
2. **Atomic-step expansion** in `docs/plans/phase-NN-*.md` BEFORE code.
3. **After every chunk, BEFORE push:** dispatch
   `superpowers:code-reviewer` against the diff. Fix all BLOCKERS.
   Document any SHOULD-FIX deferrals.
4. **Deviations from blueprint:** ADR FIRST, then code.
5. **Every PR:** walk SECURITY.md's 10 gates explicitly in the
   commit body.
6. **No self-merge.** Respected in spirit even on the private repo
   tier (branch protection not enforceable until Org upgrade).

## Rollback

This is a tracking ADR, not a code change — no rollback applicable.
