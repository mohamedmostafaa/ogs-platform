# Local development runbook

> Audience: contributors bringing a fresh clone up to a working
> `pnpm dev`. Read this before opening your first PR.
>
> Owners: @devops-engineer, @engineering-lead.
> Related: `tooling/scripts/bootstrap.sh`, Blueprint §29 (scaffolding).

---

## 0. Prerequisites — install once

| Tool    | Required version | Verify command                     |
| ------- | ---------------- | ---------------------------------- |
| Node.js | 24 LTS (Krypton) | `node --version`                   |
| pnpm    | 11.x             | `pnpm --version`                   |
| Git     | 2.40+            | `git --version`                    |
| gh CLI  | latest           | `gh --version` (optional, for PRs) |

**Node 24 via fnm** (recommended):

```bash
fnm install 24
fnm use 24
```

**pnpm 11 via corepack** (ships with Node 24):

```bash
corepack enable
corepack prepare pnpm@11 --activate
```

---

## 1. Clone and bootstrap

```bash
git clone https://github.com/mohamedmostafaa/ogs-platform
cd ogs-platform
cp .env.example .env.local        # then edit — see §2 below
./tooling/scripts/bootstrap.sh    # idempotent; installs deps + checks stack
```

The bootstrap script:

1. Verifies Node ≥ 24 and pnpm ≥ 11.
2. Warns if `.env.local` is missing.
3. Runs `pnpm install --frozen-lockfile`.
4. Runs `pnpm version-check` — exits non-zero if any pinned dep is more
   than one major release behind upstream (Blueprint §3.2.1).
5. Runs `pnpm db:generate` once `packages/db` exists.

---

## 2. `.env.local` — what you need to fill

Copy `.env.example` and fill **at minimum** the keys below. Everything
else can stay blank until you touch the feature that needs it.

### Required for `pnpm dev` to even start

| Key                  | Where to get it                                                                    |
| -------------------- | ---------------------------------------------------------------------------------- |
| `DATABASE_URL`       | Neon → project `ogs-platform-dev` → connection string (pooled, `?sslmode=require`) |
| `DIRECT_URL`         | Same Neon project → **non-pooled** connection string (needed for `prisma migrate`) |
| `BETTER_AUTH_SECRET` | Generate: `openssl rand -hex 32`                                                   |
| `ARCJET_KEY`         | https://app.arcjet.com/ → site `ogs-platform` → site key (`ajkey_*`)               |

### Encryption (Phase 1+ — needed before any field-level crypto)

| Key                      | Notes                                                 |
| ------------------------ | ----------------------------------------------------- |
| `ENCRYPTION_KEY_PRIMARY` | `openssl rand -hex 32` — 256-bit hex string           |
| `ENCRYPTION_KEY_VERSION` | Start at `1`. Bump on rotation, never reuse a number. |

### Per-subsystem (fill when you touch that feature)

| Subsystem      | Keys                                                                     |
| -------------- | ------------------------------------------------------------------------ |
| OAuth          | `BETTER_AUTH_GOOGLE_CLIENT_ID/SECRET`, `..._GITHUB_*`, `..._LINKEDIN_*`  |
| SMTP email     | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`          |
| SMS / WhatsApp | `TWILIO_ACCOUNT_SID/AUTH_TOKEN`, `WHATSAPP_API_*`                        |
| Inngest        | `INNGEST_EVENT_KEY`, `INNGEST_SIGNING_KEY` (only for `inngest dev`)      |
| Stream.io      | `STREAM_API_KEY`, `STREAM_API_SECRET`                                    |
| Bunny.net      | `BUNNY_STREAM_LIBRARY_ID`, `BUNNY_STREAM_API_KEY`                        |
| Cloudflare R2  | `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`, `R2_ACCOUNT_ID` |
| Payments       | `STRIPE_*`, `LEMON_*`, `POLAR_*`, `PAYMOB_*` — at least one              |
| AI providers   | `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `GOOGLE_GENERATIVE_AI_API_KEY`    |
| Sentry         | `SENTRY_DSN_<APP>` (one per app)                                         |

> **Never commit `.env.local`.** It's in `.gitignore`. The pre-commit
> hook runs gitleaks; CI runs it again on every PR.

---

## 3. Daily development loop

| Command              | What it does                                                                                                     |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `pnpm dev`           | Boots `mprocs`: 8 Next.js apps (ports 3000–3007), Inngest dev, Prisma Studio (once Phase 1 lands the db package) |
| `pnpm build`         | Turbo-builds every workspace                                                                                     |
| `pnpm lint`          | ESLint 10 across every workspace                                                                                 |
| `pnpm typecheck`     | `tsc --noEmit` across every workspace                                                                            |
| `pnpm test`          | All workspace tests                                                                                              |
| `pnpm format`        | Prettier write                                                                                                   |
| `pnpm db:generate`   | Regenerate Prisma client                                                                                         |
| `pnpm db:migrate`    | Apply pending migrations to your Neon dev branch                                                                 |
| `pnpm db:studio`     | Open Prisma Studio                                                                                               |
| `pnpm version-check` | Compare every pinned dep against npm; fails on stale majors                                                      |
| `pnpm inngest:dev`   | Start the Inngest local devserver (auto-loaded by `pnpm dev`)                                                    |

### App URLs (local)

| App        | Port | URL                   |
| ---------- | ---- | --------------------- |
| Identity   | 3000 | http://localhost:3000 |
| Careers    | 3001 | http://localhost:3001 |
| SkillPass  | 3002 | http://localhost:3002 |
| Academy    | 3003 | http://localhost:3003 |
| ECO        | 3004 | http://localhost:3004 |
| Enterprise | 3005 | http://localhost:3005 |
| Admin      | 3006 | http://localhost:3006 |
| Corporate  | 3007 | http://localhost:3007 |

---

## 4. Common tasks

### Add a dependency

```bash
pnpm --filter @ogs/<workspace> add <pkg>
pnpm version-check                   # confirm pin is fresh
git add . && git commit -m "..."
```

### Create a new workspace

1. Create `apps/<name>/` or `packages/<name>/`.
2. Add a `package.json` with `"name": "@ogs/<name>"`.
3. Run `pnpm install` from the repo root.
4. New workspaces are picked up automatically (`pnpm-workspace.yaml`
   globs `apps/*` and `packages/*`).

### Run a single app

```bash
pnpm --filter @ogs/careers dev
```

### Run a Prisma migration

```bash
pnpm --filter @ogs/db prisma migrate dev --name <descriptive-name>
```

### Open a PR

The pre-commit hook will:

1. Run `eslint --fix` and `prettier --write` on staged files.
2. Run **gitleaks** if installed locally.

CI workflows enforce:

- `ci.yml` — lint, typecheck, test, build.
- `pr-discipline.yml` — your PR must update `TASKS.md` and link the OGS-id.
- `verify-no-dead-names.yml` — blocks `middleware.ts`, `prisma-client-js`, `generateObject`, etc.
- `stack-currency.yml` — version-check must pass.
- `secret-scan.yml` — gitleaks against your diff.

---

## 5. Troubleshooting

### `ERR_PNPM_IGNORED_BUILDS` on install

The repo's `pnpm-workspace.yaml` pre-approves build scripts for
`esbuild`, `inngest-cli`, `sharp`, `unrs-resolver`. If you see this
error after adding a new dep that runs install-time scripts, add it to
both `onlyBuiltDependencies` **and** `allowBuilds` in that file, then
re-run `pnpm install`.

### `Cannot find package '@ogs/<x>'`

Run `pnpm install` from the repo root. Workspace symlinks aren't created
until pnpm has registered the new package.

### Neon connection errors

- Use the **pooled** URL for runtime (`DATABASE_URL`).
- Use the **non-pooled** (`DIRECT_URL`) for `prisma migrate`. Pooled
  connections drop DDL.
- Both should include `?sslmode=require`.

### Arcjet says "denied" in development

Arcjet runs in `DRY_RUN` locally — decisions are logged, not enforced
(`packages/security/src/arcjet/env.ts`). If you're seeing real denials,
check that `NODE_ENV` is `development` and not accidentally set to
`production` in your shell.

### Port already in use

`pnpm dev` uses mprocs; the conflicting process is usually a previous
run that didn't clean up. `pkill -f "next dev"` resolves it.

---

## 6. Where to ask

- Slack: `#ogs-platform-dev`
- Runbook bugs: open a PR against this file or file an issue tagged
  `runbook`.
