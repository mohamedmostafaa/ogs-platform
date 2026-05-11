# Phase 00 — Repository Bootstrap

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.
>
> **Reminder:** Every agent invokes `superpowers:using-superpowers` at session start and the most-specific applicable skill before each step. Security gates from `SECURITY.md` §1 apply on every PR. Coding standards from `CODE_STANDARDS.md` apply on every line. Update `TASKS.md` on every PR.

**Goal.** Stand up the OGS monorepo so `pnpm dev` brings up all eight Next.js apps + the Inngest worker + Inngest dev server + Prisma Studio in one terminal, with every app rendering an empty hello-world home page on its preview URL.

**Exit criterion.**
1. CI is green on `main`.
2. The eight web apps deploy via Vercel previews; each preview URL renders the OGS logo.
3. `pnpm db:generate && pnpm db:migrate` succeeds against a Neon dev branch with `pgvector` enabled.
4. Sentry receives a test error from every app.
5. `gitleaks` and the `pr-discipline.yml` workflow both fail an intentionally-bad test PR.

**Window.** Week 0 (pre-Week 1).

**Owning agents.** @devops-engineer (primary), @engineering-lead, @database-engineer, @code-reviewer.

**Prerequisites.** None.

**Security gates that apply (SECURITY.md §1).** Gate 8 (secrets), Gate 10 (dependency hygiene). All other gates begin to bind from Phase 1 onwards as production code lands.

---

## Tasks

### OGS-001 — Create the GitHub repository

**Owner:** @engineering-lead
**Blueprint:** §29.2
**Files:** none on disk yet.

- [ ] **OGS-001.01** On github.com, create a new private repository named `ogs-platform` under the OGS GitHub organisation. Initialise without README, without `.gitignore`, without licence.
- [ ] **OGS-001.02** Locally, create the directory and initialise git:

```bash
mkdir -p ~/code/ogs-platform && cd ~/code/ogs-platform
git init -b main
git remote add origin git@github.com:ogs/ogs-platform.git
```

- [ ] **OGS-001.03** Create the initial `.gitignore` and the initial `README.md` (copy from this repository's existing files).
- [ ] **OGS-001.04** First commit and push:

```bash
git add .gitignore README.md
git commit -m "chore: initialise repo [OGS-001.04]"
git push -u origin main
```

- [ ] **OGS-001.05** Update `TASKS.md`: mark `OGS-001` `[x]` and move to Phase 0 Done.
- [ ] **OGS-001.06** Open a chore PR: `chore(tasks): close OGS-001`.

### OGS-002 — Branch protection on main

**Owner:** @engineering-lead
**Blueprint:** §23.10
**Files:** GitHub web only.

- [ ] **OGS-002.01** On GitHub, Settings → Branches → Add rule for `main`.
- [ ] **OGS-002.02** Tick: "Require a pull request before merging" with "Require approvals: 2".
- [ ] **OGS-002.03** Tick: "Dismiss stale pull request approvals when new commits are pushed".
- [ ] **OGS-002.04** Tick: "Require review from Code Owners".
- [ ] **OGS-002.05** Tick: "Require status checks to pass before merging" — add: `verify-tasks-update`, `verify-pr-body`, `lint`, `typecheck`, `test`, `build`.
- [ ] **OGS-002.06** Tick: "Require conversation resolution before merging".
- [ ] **OGS-002.07** Tick: "Do not allow bypassing the above settings".
- [ ] **OGS-002.08** Save.
- [ ] **OGS-002.09** Update `TASKS.md` `[x]`. Commit + PR: `chore: protect main branch [OGS-002.09]`.

### OGS-003 — CODEOWNERS in repo

**Owner:** @engineering-lead
**Blueprint:** §23.10
**Files:** Create `.github/CODEOWNERS` (already drafted in this repo).

- [ ] **OGS-003.01** Copy the canonical `.github/CODEOWNERS` from the existing draft into the new repo.
- [ ] **OGS-003.02** Commit: `chore: add CODEOWNERS [OGS-003.02]`.
- [ ] **OGS-003.03** Push and merge via the standard PR flow.
- [ ] **OGS-003.04** Update `TASKS.md` `[x]`.

### OGS-004 — Node version pin

**Owner:** @devops-engineer
**Blueprint:** §29.1
**Files:** `.nvmrc`.

- [ ] **OGS-004.01** Create `.nvmrc`:

```
22
```

- [ ] **OGS-004.02** Locally:

```bash
fnm install 22 && fnm use
corepack enable && corepack prepare pnpm@9 --activate
node --version    # expect v22.x
pnpm --version    # expect 9.x
```

- [ ] **OGS-004.03** Commit: `chore: pin Node 22 [OGS-004.03]`. PR. Merge.
- [ ] **OGS-004.04** Update `TASKS.md` `[x]`.

### OGS-005 — Root package.json

**Owner:** @devops-engineer
**Blueprint:** §4.8
**Files:** `package.json`.

- [ ] **OGS-005.01** Create `package.json` with the canonical content from blueprint §4.8 (root-only scripts, engines pinned).
- [ ] **OGS-005.02** `pnpm install` (creates `pnpm-lock.yaml`).
- [ ] **OGS-005.03** Verify scripts list:

```bash
pnpm run
# expect: build, dev, lint, lint:fix, format, typecheck, test, db:generate, db:migrate, db:studio, inngest:dev
```

- [ ] **OGS-005.04** Commit `chore: root package.json [OGS-005.04]`. PR. Merge.

### OGS-006 — pnpm workspaces

**Owner:** @devops-engineer
**Blueprint:** §4.7
**Files:** `pnpm-workspace.yaml`.

- [ ] **OGS-006.01** Create `pnpm-workspace.yaml`:

```yaml
packages:
  - "apps/*"
  - "packages/*"
  - "tooling/*"
```

- [ ] **OGS-006.02** Create the empty `apps/`, `packages/`, `tooling/` folders with `.gitkeep` files.
- [ ] **OGS-006.03** `pnpm install` (no workspaces yet but verifies syntax).
- [ ] **OGS-006.04** Commit `chore: declare pnpm workspaces [OGS-006.04]`. PR. Merge.

### OGS-007 — Turborepo pipeline

**Owner:** @devops-engineer
**Blueprint:** §4.6
**Files:** `turbo.json`.

- [ ] **OGS-007.01** `pnpm add -D -w turbo@^2`.
- [ ] **OGS-007.02** Create `turbo.json` with the canonical content from blueprint §4.6 (build / lint / typecheck / test / dev tasks, `globalEnv` list of every env var the build needs).
- [ ] **OGS-007.03** Verify:

```bash
pnpm turbo run lint --dry-run
# expect: "0 packages to process" without error
```

- [ ] **OGS-007.04** Commit `chore: turbo pipeline [OGS-007.04]`. PR. Merge.

### OGS-008 — TypeScript base config

**Owner:** @devops-engineer
**Blueprint:** §4.12
**Files:** `tsconfig.base.json`.

- [ ] **OGS-008.01** Create `tsconfig.base.json` per blueprint §4.12 (strict, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`).
- [ ] **OGS-008.02** Commit `chore: tsconfig base [OGS-008.02]`. PR. Merge.

### OGS-009 — ESLint + Prettier flat config

**Owner:** @devops-engineer
**Blueprint:** §4.10, §4.11
**Files:** `eslint.config.mjs`, `.prettierrc`, `tooling/eslint-config/{library,next}.js`, `tooling/eslint-config/package.json`.

- [ ] **OGS-009.01** Install root devDeps:

```bash
pnpm add -D -w eslint@^9 prettier@^3.4 eslint-config-prettier \
  eslint-plugin-import @typescript-eslint/parser @typescript-eslint/eslint-plugin \
  prettier-plugin-tailwindcss
```

- [ ] **OGS-009.02** Create `tooling/eslint-config/package.json`:

```json
{
  "name": "@ogs/eslint-config",
  "version": "0.0.1",
  "private": true,
  "main": "library.js",
  "exports": { ".": "./library.js", "./library.js": "./library.js", "./next.js": "./next.js" }
}
```

- [ ] **OGS-009.03** Create `tooling/eslint-config/library.js`:

```js
/**
 * Shared ESLint flat config for non-Next.js workspaces.
 * Extends recommended TS rules, enforces import ordering and no-floating-promises.
 *
 * @see CODE_STANDARDS.md §1.3 (naming), §3 (TypeScript), §1.2 (file size).
 */
import tseslint from "@typescript-eslint/eslint-plugin";
import tsparser from "@typescript-eslint/parser";
import importPlugin from "eslint-plugin-import";

export default [
  {
    files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" },
    },
    plugins: { "@typescript-eslint": tseslint, import: importPlugin },
    rules: {
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/no-explicit-any": "warn",
      "import/order": ["warn", {
        "newlines-between": "always",
        groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
        pathGroups: [{ pattern: "@ogs/**", group: "internal", position: "before" }],
        alphabetize: { order: "asc", caseInsensitive: true },
      }],
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
];
```

- [ ] **OGS-009.04** Create `tooling/eslint-config/next.js`:

```js
/**
 * Shared ESLint flat config for Next.js apps (extends library + next/core-web-vitals).
 */
import library from "./library.js";

export default [
  ...library,
  // Next.js's rules are added when next is installed in the app.
];
```

- [ ] **OGS-009.05** Create root `eslint.config.mjs` from blueprint §4.10.
- [ ] **OGS-009.06** Create root `.prettierrc` from blueprint §4.11.
- [ ] **OGS-009.07** Verify:

```bash
pnpm lint        # passes (no source yet)
pnpm format      # idempotent
```

- [ ] **OGS-009.08** Commit `chore: eslint + prettier config [OGS-009.08]`. PR. Merge.

### OGS-010 — mprocs dev runner

**Owner:** @devops-engineer
**Blueprint:** §4.9
**Files:** `mprocs.yaml`.

- [ ] **OGS-010.01** `pnpm add -D -w mprocs@^0.7`.
- [ ] **OGS-010.02** Create `mprocs.yaml` from blueprint §4.9.
- [ ] **OGS-010.03** Verify `pnpm dev` opens the mprocs UI listing all rows (process commands will fail until apps exist; the UI itself opening is success).
- [ ] **OGS-010.04** Commit `chore: mprocs runner [OGS-010.04]`. PR. Merge.

### OGS-011 — Shared tooling workspaces

**Owner:** @devops-engineer
**Blueprint:** §29.4
**Files:** `tooling/tsconfig/{package.json,base.json,nextjs.json,library.json}`, `tooling/tailwind-config/{package.json,preset.ts,globals.css}`.

- [ ] **OGS-011.01** Create `tooling/tsconfig/package.json`:

```json
{ "name": "@ogs/tsconfig", "version": "0.0.1", "private": true, "files": ["*.json"] }
```

- [ ] **OGS-011.02** Create `tooling/tsconfig/base.json`:

```json
{ "extends": "../../tsconfig.base.json" }
```

- [ ] **OGS-011.03** Create `tooling/tsconfig/nextjs.json`:

```json
{
  "extends": "./base.json",
  "compilerOptions": {
    "plugins": [{ "name": "next" }],
    "noEmit": true,
    "module": "ESNext",
    "jsx": "preserve"
  },
  "include": ["src", "next-env.d.ts", "next.config.mjs"]
}
```

- [ ] **OGS-011.04** Create `tooling/tsconfig/library.json`:

```json
{
  "extends": "./base.json",
  "compilerOptions": { "declaration": true, "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

- [ ] **OGS-011.05** Create `tooling/tailwind-config/package.json`:

```json
{ "name": "@ogs/tailwind-config", "version": "0.0.1", "private": true, "main": "preset.ts" }
```

- [ ] **OGS-011.06** Create `tooling/tailwind-config/preset.ts` (shadcn-aligned Tailwind v4 preset; copy from blueprint §3.5.1 token scaffolding).
- [ ] **OGS-011.07** `pnpm install` (workspaces pick up).
- [ ] **OGS-011.08** Commit `chore: tooling workspaces [OGS-011.08]`. PR. Merge.

### OGS-012 — Idempotent bootstrap script

**Owner:** @devops-engineer
**Blueprint:** §29.15
**Files:** `tooling/scripts/bootstrap.sh`.

- [ ] **OGS-012.01** Create `tooling/scripts/bootstrap.sh` that runs: `fnm use`, `corepack enable`, `pnpm install`, `pnpm db:generate`, `pnpm db:migrate`, and prints next steps.
- [ ] **OGS-012.02** `chmod +x tooling/scripts/bootstrap.sh`.
- [ ] **OGS-012.03** Verify a second run is a no-op (idempotent).
- [ ] **OGS-012.04** Commit `chore: bootstrap script [OGS-012.04]`. PR. Merge.

### OGS-013 — Neon project + dev branch

**Owner:** @devops-engineer
**Blueprint:** §3.3, §5.4
**Files:** `.env.example` updated with `DATABASE_URL`, `DIRECT_URL` placeholders.

- [ ] **OGS-013.01** Sign in to Neon; create project `ogs-platform`.
- [ ] **OGS-013.02** Create a `dev` branch on Neon. Capture the `DATABASE_URL` (pooled) and `DIRECT_URL` (direct).
- [ ] **OGS-013.03** Store both in 1Password under "OGS / Neon dev".
- [ ] **OGS-013.04** Update `.env.example`:

```
# Neon Postgres (pooled + direct)
DATABASE_URL=
DIRECT_URL=
```

- [ ] **OGS-013.05** Commit `chore: document Neon env vars [OGS-013.05]`. PR. Merge.

### OGS-014 — Enable pgvector on Neon

**Owner:** @database-engineer
**Blueprint:** §5.4
**Files:** none (DB only).

- [ ] **OGS-014.01** Via Neon SQL Editor against the dev branch:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
SELECT extname, extversion FROM pg_extension WHERE extname = 'vector';
```

- [ ] **OGS-014.02** Capture the screenshot in `docs/runbooks/db-setup.md`.
- [ ] **OGS-014.03** Add a note to `docs/runbooks/db-setup.md` that staging and prod branches also run this statement at creation.
- [ ] **OGS-014.04** Commit `docs: pgvector setup runbook [OGS-014.04]`. PR. Merge.

### OGS-015 — Vercel team + 8 projects

**Owner:** @devops-engineer
**Blueprint:** §3.3
**Files:** none on disk; Vercel only.

- [ ] **OGS-015.01** Create the OGS Vercel team.
- [ ] **OGS-015.02** For each of the eight apps (`web-id`, `web-corporate`, `web-careers`, `web-skillpass`, `web-academy`, `web-eco`, `web-enterprise`, `web-admin`) plus the `workers` app: create a Vercel project pointing at the same Git repo with the corresponding root directory (`apps/<name>`).
- [ ] **OGS-015.03** For each project set the production domain (`web-id` → `id.ogs-tc.com`, `web-careers` → `ogscareers.com`, etc.) per blueprint §1.2 (corrected for `ogscademy.com` vs `ogsacademy.com` — verify with the registrar).
- [ ] **OGS-015.04** Disable Vercel Authentication on the production projects; keep it ON for preview deploys.
- [ ] **OGS-015.05** Capture project IDs in `docs/runbooks/vercel.md`.

### OGS-016 — Vercel env vars

**Owner:** @devops-engineer + @security-engineer
**Blueprint:** §28.1
**Files:** `.env.example` (canonical list).

- [ ] **OGS-016.01** For every variable in blueprint §28.1, decide its environment tier (local/preview/staging/production).
- [ ] **OGS-016.02** Add each to the corresponding Vercel project as encrypted env var. Preview tier uses sandbox credentials; production tier uses live credentials.
- [ ] **OGS-016.03** Ensure no value is logged. Save a single screenshot of one project's env list to the runbook for evidence.
- [ ] **OGS-016.04** Commit `docs: vercel env runbook [OGS-016.04]`. PR. Merge.

### OGS-017 — Sentry org + 8 projects

**Owner:** @devops-engineer
**Blueprint:** §22.7
**Files:** `.env.example` updated with `SENTRY_*`.

- [ ] **OGS-017.01** Create the Sentry org `ogs-platform`.
- [ ] **OGS-017.02** Create one Sentry project per app (8). Naming: `web-id`, `web-careers`, etc.
- [ ] **OGS-017.03** For each project capture the DSN.
- [ ] **OGS-017.04** Store DSNs in Vercel per-project env (`SENTRY_DSN` + `NEXT_PUBLIC_SENTRY_DSN`).
- [ ] **OGS-017.05** Create a `SENTRY_AUTH_TOKEN` org-level for source-map upload.

### OGS-018 — DNS

**Owner:** @devops-engineer + @engineering-lead
**Blueprint:** §1.2

- [ ] **OGS-018.01** Verify ownership of every domain in blueprint §2.1 in Cloudflare DNS.
- [ ] **OGS-018.02** Create CNAMEs to Vercel per the Vercel project configuration.
- [ ] **OGS-018.03** Confirm each domain resolves with `dig +short <domain>` and reaches a placeholder Vercel page.

### OGS-019 — Hello-world apps/web-id

**Owner:** @auth-engineer
**Blueprint:** §29.10
**Files:** `apps/web-id/**`.

- [ ] **OGS-019.01** Bootstrap with `pnpm dlx create-next-app@latest apps/web-id --typescript --tailwind --app --src-dir --import-alias '@/*' --eslint=false --no-git --skip-install`.
- [ ] **OGS-019.02** Edit `apps/web-id/package.json` to include only required deps (next, react, react-dom, tailwindcss); add `"name": "web-id"`.
- [ ] **OGS-019.03** Replace `apps/web-id/src/app/page.tsx` with a hello-world that renders the OGS logo and the literal string "OGS Identity":

```tsx
/**
 * Identity Hub home page placeholder.
 *
 * Replaced in Phase 2 by the sign-in/sign-up surface. Kept minimal in Phase 0
 * to verify the deploy pipeline.
 *
 * @see Blueprint §6
 */
export default function HomePage() {
  return (
    <main className="flex min-h-svh items-center justify-center">
      <h1 className="text-3xl font-semibold">OGS Identity</h1>
    </main>
  );
}
```

- [ ] **OGS-019.04** `pnpm --filter web-id dev` locally; open `http://localhost:3000` and verify.
- [ ] **OGS-019.05** Push; Vercel preview builds; verify the preview URL renders.
- [ ] **OGS-019.06** Commit `feat(web-id): hello-world home [OGS-019.06]`. PR. Merge.

### OGS-020 — Hello-world remaining apps

**Owner:** @devops-engineer
**Blueprint:** §29.10
**Files:** seven app bootstrap commits.

- [ ] **OGS-020.01..07** Repeat OGS-019 for `web-corporate`, `web-careers`, `web-skillpass`, `web-academy`, `web-eco`, `web-enterprise`, `web-admin`. One PR per app, in sequence.
- [ ] **OGS-020.08** Bootstrap `apps/workers` with a minimal Next.js app exposing `apps/workers/src/app/api/inngest/route.ts` returning 200 OK with body `"workers"` (full Inngest wiring is in Phase 1).

### OGS-021 — CI workflow ci.yml

**Owner:** @devops-engineer
**Blueprint:** §23.10
**Files:** `.github/workflows/ci.yml`.

- [ ] **OGS-021.01** Create `.github/workflows/ci.yml`:

```yaml
name: ci
on:
  pull_request:
  push:
    branches: [main]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format --check .
  typecheck:
    runs-on: ubuntu-latest
    needs: [lint]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
  test:
    runs-on: ubuntu-latest
    needs: [lint]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm test
  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 9 }
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm build
```

- [ ] **OGS-021.02** Push; verify CI runs and is green on `main`.
- [ ] **OGS-021.03** Commit `ci: initial workflow [OGS-021.03]`. PR. Merge.

### OGS-022 — PR-discipline workflow

**Owner:** @devops-engineer
**Blueprint:** AGENTS.md §9
**Files:** `.github/workflows/pr-discipline.yml` (already drafted).

- [ ] **OGS-022.01** Copy the canonical `pr-discipline.yml` into the new repo.
- [ ] **OGS-022.02** Open an intentionally-bad PR (no `TASKS.md` change, no skills section). Verify it fails. Close it.
- [ ] **OGS-022.03** Commit `ci: pr discipline gate [OGS-022.03]`. PR. Merge.

### OGS-023 — gitleaks pre-commit + CI

**Owner:** @security-engineer
**Blueprint:** SECURITY.md §0 rule 5
**Files:** `.github/workflows/secret-scan.yml`, `.husky/pre-commit`.

- [ ] **OGS-023.01** `pnpm add -D -w husky lint-staged`.
- [ ] **OGS-023.02** `pnpm exec husky init`.
- [ ] **OGS-023.03** Create `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# Run prettier + eslint on staged files
pnpm exec lint-staged

# Local gitleaks (if installed); CI runs the authoritative pass.
if command -v gitleaks >/dev/null 2>&1; then
  gitleaks protect --staged --no-banner
fi
```

- [ ] **OGS-023.04** Configure `lint-staged` in root `package.json`:

```json
"lint-staged": {
  "*.{ts,tsx,js,jsx}": ["eslint --fix", "prettier --write"],
  "*.{json,md,yml,yaml}": ["prettier --write"]
}
```

- [ ] **OGS-023.05** Create `.github/workflows/secret-scan.yml`:

```yaml
name: secret-scan
on:
  pull_request:
  push:
    branches: [main]
jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

- [ ] **OGS-023.06** Open an intentionally-bad PR that contains `STRIPE_SECRET_KEY=sk_test_dummy_dummy`. Verify gitleaks fails. Close it.
- [ ] **OGS-023.07** Commit `ci: secret scan + husky [OGS-023.07]`. PR. Merge.

### OGS-024 — ADR scaffolding

**Owner:** @docs-writer
**Blueprint:** §28.3
**Files:** `docs/adr/0000-template.md` (already), `docs/adr/INDEX.md`.

- [ ] **OGS-024.01** Confirm `docs/adr/0000-template.md` matches the template in blueprint §28.3.
- [ ] **OGS-024.02** Create `docs/adr/INDEX.md` with an empty table:

```md
# ADR Index

| # | Title | Status | Date | PR |
|---|---|---|---|---|

(no ADRs yet)
```

- [ ] **OGS-024.03** Commit `docs: adr scaffolding [OGS-024.03]`. PR. Merge.

### OGS-025 — Local dev runbook

**Owner:** @docs-writer
**Blueprint:** §29
**Files:** `docs/runbooks/local-dev.md`.

- [ ] **OGS-025.01** Create `docs/runbooks/local-dev.md` documenting: clone, `fnm use`, `corepack enable`, `pnpm install`, copy `.env.example` to `.env.local`, fill values from 1Password, `pnpm db:generate`, `pnpm db:migrate`, `pnpm dev`, common failures.
- [ ] **OGS-025.02** Commit `docs: local dev runbook [OGS-025.02]`. PR. Merge.

### OGS-026 — Arcjet provisioning

**Owner:** @security-engineer + @devops-engineer
**SECURITY.md:** §6
**Files:** `.env.example`, `turbo.json`.

- [ ] **OGS-026.01** Sign in to Arcjet; create the site `ogs-platform` with one environment per Vercel environment (dev / preview / staging / production).
- [ ] **OGS-026.02** Capture the four keys; store in 1Password under "OGS / Arcjet".
- [ ] **OGS-026.03** Add `ARCJET_KEY=` to `.env.example` (placeholder, no value committed).
- [ ] **OGS-026.04** Add `ARCJET_KEY` to the `env` list inside `turbo.json#tasks.build.env`.
- [ ] **OGS-026.05** Set `ARCJET_KEY` in each Vercel project's encrypted env (preview-tier key on preview, prod-tier key on production).
- [ ] **OGS-026.06** Commit `chore: arcjet env vars [OGS-026.06]`. PR. Merge.

### OGS-027 — Canonical Arcjet rule sets in @ogs/security

**Owner:** @security-engineer
**SECURITY.md:** §6.2
**Files:** `packages/security/package.json`, `packages/security/src/arcjet/index.ts`, `packages/security/src/arcjet/index.test.ts`.

- [ ] **OGS-027.01** Install: `pnpm --filter @ogs/security add @arcjet/next @arcjet/inspect`.
- [ ] **OGS-027.02** Create `packages/security/src/arcjet/index.ts` containing the five canonical rule sets (publicShield, publicForm, authEndpoint, mutation, aiEndpoint) — paste verbatim from `SECURITY.md` §6.2.
- [ ] **OGS-027.03** Add a JSDoc block on every exported rule set per `CODE_STANDARDS.md` §2.1.
- [ ] **OGS-027.04** Write `index.test.ts` constructing each rule set; assert each returns a valid Arcjet client (presence of `.protect`).
- [ ] **OGS-027.05** Run `pnpm --filter @ogs/security test` — expect PASS.
- [ ] **OGS-027.06** Commit `feat(security): canonical arcjet rule sets [OGS-027.06]`. PR. Required reviewers: @architecture-reviewer + @security-engineer + @code-reviewer.

### OGS-028 — Per-app proxy.ts mounts Arcjet

**Owner:** @security-engineer + @devops-engineer
**SECURITY.md:** §6.3
**Files:** `apps/web-id/src/proxy.ts` + seven siblings.

- [ ] **OGS-028.01** Create `apps/web-id/src/proxy.ts` per the canonical example in `SECURITY.md` §6.3, defaulting to `publicShield`. Auth-endpoint composition lands in Phase 2.
- [ ] **OGS-028.02** Repeat for `web-corporate`, `web-careers`, `web-skillpass`, `web-academy`, `web-eco`, `web-enterprise`, `web-admin`. One PR per app.
- [ ] **OGS-028.03** Confirm `pnpm dev` brings every app up and that synthetic requests appear in the Arcjet console.

### OGS-029 — Verify denial paths on preview

**Owner:** @qa-engineer
**SECURITY.md:** §6.3
**Files:** `docs/runbooks/arcjet.md`.

- [ ] **OGS-029.01** Curl a preview URL with a bot User-Agent. Expect HTTP 403 and a Sentry breadcrumb `arcjet.denied` reason `BOT_BLOCKED`.
- [ ] **OGS-029.02** POST `/api/auth/sign-in/email` 11 times in a minute from one IP. Expect HTTP 429 on the 11th call.
- [ ] **OGS-029.03** Submit a signup form with a `disposable.com` email (smoke against `publicShield` for now; full validation lands when Flow K wires `publicForm`).
- [ ] **OGS-029.04** Capture the three runs in `docs/runbooks/arcjet.md` as the regression matrix.
- [ ] **OGS-029.05** Commit `docs: arcjet verification runbook [OGS-029.05]`. PR. Merge.

### OGS-030 — `tooling/scripts/version-check.ts` + `pnpm version-check`

**Owner:** @devops-engineer + @security-engineer
**Blueprint:** §3.2.1
**Files:** `tooling/scripts/version-check.ts`, root `package.json` (script entry).

- [ ] **OGS-030.01** Create `tooling/scripts/version-check.ts` with the canonical body from the existing draft at `ogs-platform/tooling/scripts/version-check.ts`. The script reads the locked floor for every package, queries the npm registry, classifies each as GREEN/YELLOW/ORANGE/RED/UNKNOWN, and exits non-zero on RED.
- [ ] **OGS-030.02** Add `"version-check": "tsx tooling/scripts/version-check.ts"` to the root `package.json` `scripts` block.
- [ ] **OGS-030.03** Run `pnpm version-check` locally. Expect a table; expect exit 0.
- [ ] **OGS-030.04** Run `pnpm version-check --json` and confirm valid JSON output.
- [ ] **OGS-030.05** Commit `chore: stack-currency version-check script [OGS-030.05]`. PR. Reviewers: @architecture-reviewer + @security-engineer + @code-reviewer.

### OGS-031 — `renovate.json`

**Owner:** @devops-engineer
**Blueprint:** §3.2.3
**Files:** `renovate.json`.

- [ ] **OGS-031.01** Create `renovate.json`:

```json
{
  "$schema": "https://docs.renovatebot.com/renovate-schema.json",
  "extends": ["config:recommended", ":dependencyDashboard", ":semanticCommits"],
  "schedule": ["before 4am on Monday"],
  "labels": ["deps"],
  "rangeStrategy": "bump",
  "packageRules": [
    { "matchUpdateTypes": ["major"], "enabled": false },
    { "matchUpdateTypes": ["minor", "patch"], "groupName": "minor + patch", "groupSlug": "minor-patch" }
  ],
  "minimumReleaseAge": "1 day",
  "vulnerabilityAlerts": { "enabled": true, "labels": ["security"] }
}
```

- [ ] **OGS-031.02** Enable Renovate on the repo via the GitHub App.
- [ ] **OGS-031.03** Verify the first Dependency Dashboard issue appears within 1 hour.
- [ ] **OGS-031.04** Commit `chore: renovate for weekly minor + patch upgrades [OGS-031.04]`. PR. Merge.

### OGS-032 — CI workflow `stack-currency.yml`

**Owner:** @devops-engineer + @security-engineer
**Blueprint:** §3.2.1
**Files:** `.github/workflows/stack-currency.yml`.

- [ ] **OGS-032.01** Confirm `.github/workflows/stack-currency.yml` exists (already drafted). Verify it runs `pnpm version-check` and `pnpm version-check --json > stack-currency.json`, uploads the JSON as an artifact, runs on PR + nightly cron at 06:00 UTC.
- [ ] **OGS-032.02** Push an intentional version-floor bump that creates an ORANGE row. Verify the job is yellow (warn) but does not block.
- [ ] **OGS-032.03** Push an intentional version-floor bump that creates a RED row. Verify the job fails the PR.
- [ ] **OGS-032.04** Revert the test bumps. Commit `ci: stack currency workflow [OGS-032.04]`. PR. Merge.

### OGS-033 — CI workflow `verify-no-dead-names.yml`

**Owner:** @devops-engineer + @architecture-reviewer
**Blueprint:** §3.1.1
**Files:** `.github/workflows/verify-no-dead-names.yml`.

- [ ] **OGS-033.01** Confirm `.github/workflows/verify-no-dead-names.yml` exists (already drafted). Verify it greps the PR diff against the canonical list of forbidden patterns (Next.js 15 `middleware.ts`, Prisma `prisma-client-js`, AI SDK `generateObject`, Better Auth `oidcProvider`, Stripe `acacia`, three-arg `createFunction`, `PanelGroup`, `fromMonth`, `MessageInput`, `.eslintrc`, etc.).
- [ ] **OGS-033.02** Open a synthetic PR that adds a single line containing `export function middleware(req)`. Verify the workflow fails with the message naming the migration target.
- [ ] **OGS-033.03** Close the synthetic PR. Commit `ci: verify-no-dead-names workflow [OGS-033.03]`. PR. Merge.

---

## Phase exit verification

Run by the QA Engineer agent. All must be green.

- [ ] CI is green on `main`.
- [ ] Every Vercel project preview renders the placeholder home page.
- [ ] `pnpm install && pnpm dev` on a clean clone brings up mprocs.
- [ ] `pnpm db:generate && pnpm db:migrate` succeeds with `pgvector` extension present.
- [ ] An intentionally-bad PR fails `pr-discipline.yml`.
- [ ] An intentionally-bad PR with a fake API key fails `secret-scan.yml`.
- [ ] Sentry receives a test error from each of the eight apps.
- [ ] `.env.example` contains every variable listed in blueprint §28.1.
- [ ] `TASKS.md` shows OGS-001..033 all `[x]` and moved to Phase 0 Done.
- [ ] `pnpm version-check` exits 0 on a clean clone.
- [ ] `verify-no-dead-names.yml` rejects a synthetic PR containing `export function middleware(req)`.
- [ ] Arcjet console shows decisions flowing from every app's proxy.ts on the preview environment.
- [ ] OGS-029.01..04 regression matrix is captured in `docs/runbooks/arcjet.md`.

---

## Done

(Tasks move here as completed; Engineering Lead writes a one-paragraph retro at phase end.)

---

## Retro

(Filled at phase end.)
