# OGS Platform — Code Standards

> Clean code, professional comments, real-world organization. Every line of code shipped to OGS conforms to this document. The Code Reviewer agent enforces it on every PR.

## 0. Standing rules

1. **Security first** (see `SECURITY.md`). Where this document conflicts with security, security wins.
2. **Clarity over cleverness.** If two engineers will disagree on what code does, rewrite it.
3. **One thing per file.** If a file does more than one thing, split it.
4. **No dead code.** Delete it; git keeps history.
5. **No TODO / FIXME without a task id.** `// TODO(OGS-1234): ...` is acceptable. Bare TODO is not.
6. **No magic numbers.** Constants in `packages/config/`, blueprint references in code comments.
7. **No commented-out code in `main`.** Delete it.
8. **No catch without action.** Either handle or rethrow.
9. **No console.log in production paths.** Use the structured logger.
10. **No `any`, no `as` casting, no `// @ts-ignore`** without a one-line justification on the same line.

## 0.1 Framework conventions for the locked majors

These conventions follow directly from the major versions locked in blueprint §3 and §3.1.1. Every contributor follows them without exception.

- **Next.js 16:** Use `proxy.ts` (not `middleware.ts`). The exported function is `proxy()`. The proxy runs on the Node runtime; do not configure `runtime: "edge"`. All `cookies()` / `headers()` / `params` / `searchParams` accesses are async — always `await`. Use `revalidateTag(tag, cacheLife)` with the two-argument form.
- **Prisma 7:** Workspaces importing the Prisma client are ESM (`"type": "module"`). Connection strings live in `prisma.config.ts`, not `schema.prisma`. The generator provider is `"prisma-client"`, not `"prisma-client-js"`. The driver adapter `@prisma/adapter-pg` is mandatory.
- **Vercel AI SDK v6:** Never call `generateObject` directly; use `generateText({ output: { type: "object", schema } })` via `@ogs/ai/runtime/run-ai-task`. `CoreMessage` is removed — use `ModelMessage`.
- **Inngest 4:** `createFunction` is two-arg: triggers live inside the first options object. Local dev requires `INNGEST_DEV=1`.
- **Better Auth 1.6:** Use `@better-auth/oauth-provider` (separate package), not the deprecated `oidcProvider`.
- **Stripe 22:** `new Stripe(...)` is mandatory; the apiVersion is `2026-03-25.dahlia`.
- **ESLint 10:** Flat config only. Legacy `.eslintrc` is removed.
- **pnpm 11:** `.npmrc` is auth/registry only; pnpm-specific settings live in `pnpm-workspace.yaml`.
- **next-intl 4:** Always `await requestLocale`. `<NextIntlClientProvider>` is mandatory at the root layout.
- **stream-chat-react 14:** Use `MessageComposer` (not `MessageInput`), `WithComponents` for Channel overrides, hooks (not HOCs).
- **react-resizable-panels 4:** `Group` / `Separator` (not `PanelGroup` / `PanelResizeHandle`). Sizes need explicit units (`"30%"`). `orientation` (not `direction`). Use `onResize` (not `onCollapse` / `onExpand`).
- **react-day-picker 10:** `startMonth` / `endMonth` (not `fromMonth` / `toMonth`). `PreviousMonthButton` / `NextMonthButton` (not `components.Button`).

## 1. File organization

### 1.1 Real-world layout

The blueprint Chapters 4 and 5 define the canonical layout. Two patterns dominate:

- **Per-app `modules/<domain>/` slice** with nine fixed pieces (`schema.ts`, `types.ts`, `params.ts`, `hooks/`, `server/`, `ui/{views,components}`). Blueprint §4.5.
- **Shared package `packages/<name>/src/`** with one public surface at `index.ts`. Blueprint §4.2.

### 1.2 File size

- Source files SHOULD be under 300 lines.
- Source files MUST be under 600 lines unless they are a generated file or a single coherent component family (e.g., `@ogs/ui/data-display/entity.tsx`).
- A file over 600 lines without a coherent reason is split in the same PR.

### 1.3 Naming

| Thing           | Convention                       | Example                                 |
| --------------- | -------------------------------- | --------------------------------------- |
| Files           | kebab-case                       | `use-jobs.ts`, `job-form.tsx`           |
| Folders         | kebab-case                       | `worker-profile/`, `cv-upload-parsing/` |
| Components      | PascalCase                       | `JobsList`, `EntityHeader`              |
| Hooks           | camelCase, `use*`                | `useSuspenseJobs`, `useErrorModal`      |
| Types           | PascalCase                       | `JobGetOne`, `WorkerAvailability`       |
| Constants       | UPPER_SNAKE_CASE                 | `DEFAULT_PAGE`, `MAX_PAGE_SIZE`         |
| Enums           | UPPER_SNAKE_CASE for members     | `ApplicationStage.APPLIED`              |
| Booleans        | `is*`, `has*`, `can*`, `should*` | `isLoading`, `hasActiveSubscription`    |
| Async functions | verb phrase                      | `loadWorkerProfile`, `sendOTPEmail`     |

## 2. Commenting standard

Code says what; comments say why. Professional comments are the default.

### 2.1 Mandatory JSDoc

Every exported function, class, type, hook, and React component in `packages/**` and every tRPC procedure in `packages/api/src/routers/**` carries a JSDoc block.

```ts
/**
 * Issues a presigned R2 upload URL valid for 10 minutes.
 *
 * The caller stores the returned key on the corresponding domain row (e.g.,
 * `Worker.profilePhotoR2Key`) only after the client confirms the upload via
 * `trpc.upload.confirm`.
 *
 * @param args.key            Object key the upload targets. Caller-supplied; must include the tenant prefix.
 * @param args.contentType    MIME type. Must be on the per-category allow-list (§11.2).
 * @param args.contentLength  Declared size in bytes. R2 enforces the limit.
 * @returns                   The signed PUT URL and the same key, echoed for convenience.
 *
 * @see Blueprint §11.1
 */
export async function presignUpload(args: {
  key: string;
  contentType: string;
  contentLength: number;
}) {
  // ...
}
```

### 2.2 Inline comments

- Use `//` only.
- Explain **why**, never **what**.
- Reference blueprint sections, ADRs, or tickets when the reasoning lives elsewhere.

```ts
// Two-step delete-then-recreate kept simple for W1 (workflows < 100 nodes).
// Diff-based update is filed as OGS-fxxxx for W2 evaluation. See blueprint §17.6.
await tx.workflowNode.deleteMany({ where: { workflowId: id } });
```

### 2.3 Section banners

For files over 200 lines, divide concerns with banner comments:

```ts
// =====================================================================
// 1. Provider initialisation
// =====================================================================

export const r2 = new S3Client({ ... });

// =====================================================================
// 2. Presigned upload
// =====================================================================
```

### 2.4 Forbidden

- No "obvious" comments (`// increment i by 1`).
- No commented-out code.
- No author or date stamps. Git is the source.
- No JIRA stub language (`// will be implemented later`). Use a real `TODO(OGS-NNN)`.

## 3. TypeScript

### 3.1 Strictness

- `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`.
- No `any` without a one-line justification on the same line.
- No `as` unless narrowing a union the type system cannot prove.
- Prefer `unknown` at trust boundaries.

### 3.2 Imports

- Order: Node builtins, third-party, `@ogs/*`, local `@/*`. ESLint enforces.
- Type-only: `import type { X } from "y"`.
- Side-effect imports last and explicit: `import "server-only";`.

### 3.3 Discriminated unions for state

```ts
type Attempt =
  | { status: "IN_PROGRESS"; startedAt: Date }
  | { status: "PASSED"; passedAt: Date; score: number }
  | { status: "FAILED"; endedAt: Date; score: number };
```

### 3.4 No exceptions for control flow

Throw on truly exceptional. Return a tagged result for expected failure paths.

```ts
// Bad
try {
  return await load();
} catch {
  return null;
}

// Good
const result = await loadOr(null);
```

## 4. React

### 4.1 Server Components by default

Client Components only when an event handler, hook, or browser API is needed. The first line is `"use client"`.

### 4.2 Suspense + Hydrate

The canonical data-fetching pattern is the only allowed one. Blueprint Chapter 8.

### 4.3 No prop drilling beyond two levels

Lift state or use the canonical hook for it (e.g., `useErrorModal` for error state, Jotai for the editor instance).

### 4.4 No effects for derived state

`useMemo` for derivation. Effects are reserved for syncing with external systems.

### 4.5 Forms

react-hook-form + Zod via `@hookform/resolvers`. Schemas in `modules/<x>/schema.ts`. Blueprint Chapter 10.

## 5. tRPC

### 5.1 Canonical procedure names

`getMany`, `getOne`, `create`, `update`, `remove`. Domain-specific verbs (publish, void, refund) only when no canonical name fits. Blueprint §7.7.

### 5.2 Error envelope

`TRPCError` with codes from blueprint §7.8. Never throw plain `Error` from a procedure.

### 5.3 Input validation

Zod schemas imported from `modules/<x>/schema.ts`. Never inline.

## 6. Prisma

### 6.1 Multi-file schema

15-file split per blueprint §5.1. Never collapse to a single file.

### 6.2 No raw SQL unless necessary

`prisma.$queryRaw` is reserved for queries the builder cannot express (pgvector). Always use parameter binding.

### 6.3 Indexes

Add an index when a column is in a WHERE clause used by a list query and the table is expected to exceed 100k rows.

### 6.4 No N+1

Use `include` / `select` to fetch related data in one round trip. Code Reviewer rejects obvious N+1 in PRs.

## 7. Testing

### 7.1 TDD

For logic-bearing code (procedures, business rules, executors, encryption, ledger writes): test first, then implementation. Blueprint §23.7.

### 7.2 Coverage targets

- `packages/core` and `packages/security`: 90 % line coverage.
- tRPC procedures: every procedure has at least one happy-path integration test.
- UI: smoke + interaction tests on EntityX and forms; no HTML snapshot tests.

### 7.3 Playwright

Four canonical end-to-end journeys. Blueprint §23.7.

## 8. Performance

### 8.1 Budget

- List page LCP ≤ 1.8s on a fast-3G profile.
- p50 tRPC procedure latency ≤ 250ms; p95 ≤ 1s.
- Inngest function p95 (excluding wait steps) ≤ 30s.

### 8.2 No unnecessary client-side data

If a piece of data does not need to be on the client, leave it on the server. RSC by default.

### 8.3 Image sizes

Profile photos and thumbnails served via Cloudflare Image Resizing. Originals are private.

## 9. Accessibility

- All interactive elements keyboard-reachable.
- All form fields have associated labels.
- Color contrast ≥ WCAG AA on text.
- Icons that convey meaning have `aria-label`.
- RTL layouts get the same a11y testing pass.

## 10. Internationalization

- No literal user-facing string in JSX. Always `useTranslations`.
- Bilingual user-supplied content uses two columns (`titleEn`, `titleAr`) and the `Bilingual` helper.
- Dates / numbers / currencies via `Intl.*` with the user's locale.

## 11. Logging

### 11.1 Structured

Every log line is a structured object with `reqId`, `tenantId` (if known), `event`, and `level`. Free-text logs are forbidden.

### 11.2 Levels

- `error` — actionable failure.
- `warn` — degraded but functional.
- `info` — significant event (sign-in, payment captured, course completed).
- `debug` — local dev only; stripped in production by the bundler.

### 11.3 No PII

Scrub before logging. Email, phone, national ID, payment details — all stripped.

## 12. Pull requests

### 12.1 Branch

`<type>/OGS-NNN-<slug>` per `AGENTS.md` §0 rule 10.

### 12.2 Commit messages

Conventional Commits, one logical change per commit. Mention the task id.

```
feat(careers): add boolean candidate search [OGS-251]
fix(payments): verify PayMob HMAC before processing webhook [OGS-523]
chore(deps): monthly upgrade 2026-05
```

### 12.3 PR body

The template at `.github/PULL_REQUEST_TEMPLATE.md` is mandatory. CI rejects PRs without `## Skills invoked` and a linked `OGS-NNN`.

### 12.4 Review

Two approvals minimum, one of whom is the Code Reviewer. Self-merge is forbidden.

## 13. Version control of this file

Owned by the Code Reviewer agent. Edits require Code Reviewer + Architecture Reviewer + Engineering Lead approval. Version: **v1**.
