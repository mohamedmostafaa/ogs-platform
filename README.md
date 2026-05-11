# OGS Platform

Monorepo for the OGS workforce-trust platform (Careers, SkillPass, Academy, ECO, Enterprise, Corporate, Admin, Identity).

## Canonical references

- [`docs/blueprint/OGS_Platform_Blueprint_v01.docx`](docs/blueprint/OGS_Platform_Blueprint_v01.docx) — the single source of architectural truth. Read this first.
- [`SECURITY.md`](SECURITY.md) — **top-priority** security charter. Ten gates run on every PR.
- [`CODE_STANDARDS.md`](CODE_STANDARDS.md) — clean code, professional comments, real-world organization rules.
- [`AGENTS.md`](AGENTS.md) — the team charter. Roster, rules, workflow, red lines. Every agent reads this every session.
- [`.claude/agents/*.md`](.claude/agents) — per-role agent definitions (charter, owns, rules, restricted actions).
- [`TASKS.md`](TASKS.md) — the **index** of all tasks. Detailed atomic steps live in [`docs/plans/phase-NN-*.md`](docs/plans).
- [`docs/plans/`](docs/plans) — one bite-sized plan file per phase. Phase 00 is the canonical example, fully expanded.
- [`docs/adr/`](docs/adr) — Architecture Decision Records. Open a numbered ADR before deviating from the blueprint.
- [`docs/runbooks/`](docs/runbooks) — operational runbooks (on-call, key rotation, incident response, backup verification).
- [`.github/CODEOWNERS`](.github/CODEOWNERS) — automatic reviewer assignment per path. Enforced by GitHub.
- [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) — mandatory PR body shape (linked tasks, skills invoked, blueprint references, security checklist).

## Getting started

Follow Chapter 29 of the blueprint (Scaffolding). The summary is:

```bash
fnm use 22
corepack enable && corepack prepare pnpm@9 --activate
pnpm install
pnpm db:generate
pnpm db:migrate
pnpm dev
```

The full bootstrap script lives at `tooling/scripts/bootstrap.sh` once Phase 0 is complete.

## Wave 1 deliverable

Three pilot customers running end-to-end Flow A, Flow F, and Flow G in production by end of Week 12. See `TASKS.md` for week-by-week breakdown and the canonical exit gate.

## Repository conventions

- Branch names: `feature/<short>`, `fix/<short>`, `chore/<short>`.
- Conventional Commit titles: `feat(careers): add boolean search`.
- Two reviewers minimum on changes touching `packages/auth`, `packages/payments`, `packages/security`, `packages/ai`, or the Prisma schema.
- Every PR updates `TASKS.md`.
