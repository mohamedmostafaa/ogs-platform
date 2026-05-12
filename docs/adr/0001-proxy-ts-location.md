# ADR-0001: `proxy.ts` lives at `apps/<name>/src/proxy.ts`

## Status

Accepted (2026-05-12)

## Context

Next.js 16 renamed `middleware.ts` to `proxy.ts`. The file can sit at either the
project root (`apps/<name>/proxy.ts`) or under a `src/` directory
(`apps/<name>/src/proxy.ts`). Both resolve identically at runtime.

The OGS apps all use the `src/` layout (`apps/<name>/src/app/...`), and
`SECURITY.md §6.3` already mandates `apps/<name>/src/proxy.ts`. Earlier Phase 0
work shipped `proxy.ts` at the project root, creating a code-vs-spec drift that
the Phase-A audit caught (blocker B16).

## Decision

Every app places its proxy at **`apps/<name>/src/proxy.ts`**, matching:

- the existing `src/`-layout convention used everywhere else in the apps,
- `SECURITY.md §6.3`,
- the Next.js documented preference for src-layout projects.

`tooling/scripts/scaffold-proxy.sh` writes there. `tooling/scripts/scaffold-apps.sh`
no longer adds an explicit `proxy.ts` entry to `tsconfig.json` because
`src/**/*.ts` already includes it.

## Consequences

- ✅ Code now matches `SECURITY.md` — the Code Reviewer's checklist for §6.3
  works without an exception.
- ✅ One canonical answer for "where do I put new proxy logic" — no drift
  across apps.
- ⚠️ Every existing `apps/<name>/proxy.ts` was `git mv`'d; the rename preserves
  history but PRs touching old paths must rebase.

## Alternatives considered

1. **Keep `apps/<name>/proxy.ts` (project root)** — amend `SECURITY.md` to
   match. Rejected because the `src/`-layout convention dominates the codebase
   and the change touches 8 file paths vs. one doc paragraph + 8 file paths.
2. **Allow both locations and pick whichever per-app** — rejected; ambiguity
   breeds drift.

## Implementation plan

1. `git mv apps/<name>/proxy.ts apps/<name>/src/proxy.ts` (×8).
2. Update `tooling/scripts/scaffold-proxy.sh` and `scaffold-apps.sh`.
3. Strip `"proxy.ts"` from each `apps/<name>/tsconfig.json` `include`.
4. Run `turbo build typecheck lint` — all 34 tasks green.

## Rollback plan

`git mv` back to project root and re-add the explicit `tsconfig.json` include.
Single PR, isolated to apps/\* and the two scaffold scripts.
