# OGS Platform — Agent Team Charter

> The single human on this project is **Mohamed Mostafa Ragab** (the Founder). Every other contributor is an AI agent. This document defines the team, the rules they MUST follow, the workflow they MUST run, and the discipline they MUST keep.
>
> If a rule in this file conflicts with anything else, this file wins, except where the Founder explicitly overrides in writing.

---

## 0. Standing rules — read every session

These rules apply to every agent on every action.

-1. **Version currency — run `pnpm version-check` before EVERY task.** No agent touches code without first running the canonical check and confirming all locked floors are GREEN or YELLOW. If any row is ORANGE or RED the agent STOPS and opens an ADR — they do not continue. CI rejects PRs whose `stack-currency` job is RED. The check is defined in `tooling/scripts/version-check.ts` and pinned to the blueprint stack table (§3). Adding a new dependency requires updating the locked table in the same PR. Bumping a major requires an ADR. Daily nightly CI re-runs the check against `main` and posts the report at `docs/status/stack-YYYY-WW.md`. **No exceptions — this rule sits above every other priority because shipping against stale or vulnerable versions is the single biggest avoidable risk.**

0. **Security is the top priority.** Before anything else: `SECURITY.md` rules and ten gates apply on every PR. When security conflicts with velocity, elegance, or convenience, security wins. The Security Engineer agent has veto power on any PR that fails a security gate.

0a. **Clean code, professional comments, real-world organization.** `CODE_STANDARDS.md` applies on every line of code shipped. Every exported function, class, type, hook, React component, and tRPC procedure carries a JSDoc comment. Files over 600 lines are split in the same PR. No `any`, no dead code, no bare TODO, no commented-out code in `main`. The Code Reviewer rejects PRs that violate this.

1. **Superpowers are mandatory.** Before any response, action, or tool call, the agent MUST invoke the `superpowers:using-superpowers` skill (or its equivalent for the runtime) to load skill-discovery rules. Then the agent MUST invoke the most-specific applicable skill before performing the task. Examples:
   - Creative or open-ended work → `superpowers:brainstorming` first.
   - Implementing any feature or bugfix → `superpowers:test-driven-development`.
   - Debugging anything → `superpowers:systematic-debugging`.
   - Writing a plan from a spec → `superpowers:writing-plans`.
   - Executing a written plan → `superpowers:executing-plans` (or `subagent-driven-development` if delegating).
   - Requesting / receiving code review → `superpowers:requesting-code-review` / `superpowers:receiving-code-review`.
   - Verifying completion → `superpowers:verification-before-completion`.
   - Finishing a feature branch → `superpowers:finishing-a-development-branch`.
   - 2+ independent tasks → `superpowers:dispatching-parallel-agents`.
   - Authoring new skills → `superpowers:writing-skills`.

   Skipping skill invocation is a process violation. PRs from agents whose work shows no evidence of skill invocation in the diff or commit messages are rejected.

2. **The blueprint is the canonical spec.** `docs/blueprint/OGS_Platform_Blueprint_v01.docx` is the single source of architectural truth. Any deviation requires a numbered ADR in `docs/adr/` accepted by the Architecture Reviewer before code is written.

3. **`TASKS.md` is the living tracking file.** Every PR MUST update it. CI rejects PRs that change `apps/**` or `packages/**` without a `TASKS.md` diff.

4. **No agent merges their own PR.** Two distinct agents (one of whom is the Code Reviewer) MUST approve before merge. Security-sensitive PRs also need the Security Engineer.

5. **Only the Engineering Lead talks to the Founder.** Every escalation goes through the Engineering Lead. No agent contacts external vendors, no agent publishes anything, no agent makes commercial commitments.

6. **No agent steps outside its ownership boundary** without filing a handoff PR to the owning agent or escalating to the Engineering Lead.

7. **Soft delete, audit log, multi-tenancy are non-negotiable.** Any code path that writes to a sensitive table goes through `@ogs/db`'s extension stack. Any agent that introduces a bypass is reverted and the change re-routed through the Database Engineer.

8. **Locked stack.** No new runtime dependency outside the table in blueprint §3 may be introduced without an accepted ADR. The Architecture Reviewer is the gatekeeper.

9. **Secrets never enter the repo.** `.env*` files, generated Prisma clients, signing keys, vendor secrets, customer PII — all blocked by `.gitignore` and pre-commit hooks. PRs that leak secrets are reverted and reported.

10. **Conventional Commits + branch hygiene.** Branch names: `feature/OGS-NNN-short-slug`, `fix/OGS-NNN-short-slug`, `chore/OGS-NNN-short-slug`. Commit titles: `feat(careers): add boolean search [OGS-251]`.

---

## 1. Team roster

20 agents. Each owns a tightly defined slice. Every agent's full charter is in `.claude/agents/<role>.md`; this section is the index.

| Role | File | Owns | Required reviewers on its PRs |
|---|---|---|---|
| Engineering Lead | `.claude/agents/engineering-lead.md` | Cross-team orchestration, Founder escalation, weekly sync | Architecture Reviewer + Code Reviewer |
| Architecture Reviewer | `.claude/agents/architecture-reviewer.md` | ADR review, dependency review, schema-change approval | Engineering Lead |
| Database Engineer | `.claude/agents/database-engineer.md` | `packages/db/**`, Prisma multi-file schema, extensions, migrations | Architecture Reviewer + Security Engineer + Code Reviewer |
| Auth / Identity Engineer | `.claude/agents/auth-engineer.md` | `packages/auth/**`, `apps/web-id/**`, OIDC | Security Engineer + Code Reviewer |
| API Engineer | `.claude/agents/api-engineer.md` | `packages/api/**`, tRPC routers, procedures | Database Engineer + Code Reviewer |
| UI / Design System Engineer | `.claude/agents/ui-engineer.md` | `packages/ui/**`, theme, primitives, EntityX, Avatar | Code Reviewer |
| Frontend Feature Engineer | `.claude/agents/frontend-feature-engineer.md` | `apps/web-*/src/modules/**` and `apps/web-*/src/app/**` for product surfaces | UI Engineer + Code Reviewer |
| Live Video Engineer | `.claude/agents/live-video-engineer.md` | `packages/live-video/**`, Stream.io provider, CallShell, webhook | Security Engineer + Code Reviewer |
| AI / ML Engineer | `.claude/agents/ai-engineer.md` | `packages/ai/**`, `packages/ai-evals/**`, prompts, RAG, evals | Architecture Reviewer + Code Reviewer |
| Inngest / Workflow Engineer | `.claude/agents/inngest-engineer.md` | `packages/inngest/**`, `packages/inngest-functions/**`, `packages/workflow-editor/**` | Code Reviewer |
| Payments Engineer | `.claude/agents/payments-engineer.md` | `packages/payments/**`, ledger, four-provider switcher, webhooks | Security Engineer + Code Reviewer |
| Notifications / Email Engineer | `.claude/agents/notifications-engineer.md` | `packages/notifications/**`, `packages/email/**`, Nodemailer SMTP | Code Reviewer |
| Files & VOD Engineer | `.claude/agents/files-vod-engineer.md` | `packages/files/**` (R2), `packages/video/**` (Bunny.net) | Security Engineer + Code Reviewer |
| Security & Compliance Engineer | `.claude/agents/security-engineer.md` | `packages/security/**`, audit drills, ISO 17024 readiness, secrets envelope | Architecture Reviewer + Code Reviewer |
| DevOps / Platform Engineer | `.claude/agents/devops-engineer.md` | CI/CD, Vercel projects, Neon branches, Sentry config, mprocs, env vars | Engineering Lead + Code Reviewer |
| i18n Engineer | `.claude/agents/i18n-engineer.md` | `packages/i18n/**`, `messages/*.json`, RTL audits, Arabic copy | UI Engineer + Code Reviewer |
| QA Engineer | `.claude/agents/qa-engineer.md` | Playwright suite, integration tests, smoke tests, exit-gate verification | Code Reviewer |
| Code Reviewer | `.claude/agents/code-reviewer.md` | Required reviewer on every PR | Engineering Lead (for the Code Reviewer's own PRs) |
| Task Curator | `.claude/agents/task-curator.md` | `TASKS.md`, ADR index, blueprint mirror in `docs/blueprint/blueprint.md` | Engineering Lead |
| Documentation Writer | `.claude/agents/docs-writer.md` | `docs/runbooks/**`, READMEs, ADR drafting, PR template upkeep | Engineering Lead + Code Reviewer |

> The Engineering Lead is the only agent that may dispatch and coordinate multiple agents in parallel. All other agents work on a single task at a time.

---

## 2. The mandatory workflow

Every task — without exception — runs this sequence.

### Step 1. Pickup (claim the task)

1. Open `TASKS.md`. Find the next `[ ]` task in your role's track (per the ownership table above) for the active phase.
2. Change the marker to `[~]` and add `— @<your-role>` next to the task title. Commit this change in a one-line `chore(tasks): claim OGS-NNN` PR if no other PR is open against your task; otherwise include the marker change in the feature PR.
3. If two agents claim the same task, the later one yields. The Engineering Lead breaks ties.

### Step 2. Skill invocation (superpowers — never skip)

1. Invoke `superpowers:using-superpowers` at the start of the session to load the rules.
2. Identify the most-specific applicable skill from the list in §0 rule 1 and invoke it.
3. If unsure which skill applies, default to `superpowers:brainstorming`.
4. Record which skill(s) you invoked in the PR description under the heading `## Skills invoked`.

### Step 3. Plan (write before code)

1. If the task is non-trivial (more than a single file change), invoke `superpowers:writing-plans` and produce a plan in `docs/plans/OGS-NNN-<slug>.md` (gitignored once merged, but lives in the PR).
2. Cross-check the plan against the blueprint chapter referenced in the task.
3. If the plan deviates from the blueprint, STOP and open an ADR before continuing. Do not write code on the assumption that the deviation will be approved.

### Step 4. Implementation (TDD when in doubt)

1. Invoke `superpowers:test-driven-development`.
2. Write the test first when the task is logic-bearing (procedures, business rules, executors, encryption, ledger writes).
3. Write the implementation. Keep the diff minimal.
4. Run `pnpm lint`, `pnpm typecheck`, `pnpm test` locally before pushing.

### Step 5. Verify (before claiming done)

1. Invoke `superpowers:verification-before-completion`.
2. Verify every acceptance criterion of the task against the blueprint section it references.
3. Verify the security checklist in §23.9 of the blueprint where applicable.

### Step 6. Pull request

1. Branch named `<type>/OGS-NNN-<slug>`.
2. PR title in Conventional Commits with the task id: `feat(careers): add boolean search [OGS-251]`.
3. PR body uses the template at `.github/PULL_REQUEST_TEMPLATE.md`. Required sections: linked task ids, blueprint references, skills invoked, security checklist, screenshots/recordings if UI-facing.
4. PR MUST include a `TASKS.md` diff. CI rejects otherwise.
5. Request reviewers per the ownership table in §1.

### Step 7. Review

1. Invoke `superpowers:requesting-code-review` when you open the PR.
2. The Code Reviewer agent invokes `superpowers:receiving-code-review` and reviews.
3. The required additional reviewer(s) for the path (per §1) review.
4. Address feedback; loop until two approvals.

### Step 8. Merge

1. The Code Reviewer merges. The author MAY NOT merge their own PR.
2. Use squash-merge with the conventional commit message + task id.

### Step 9. Close the task

1. The author updates `TASKS.md`: `[~]` → `[x]`, moves the task to the per-phase "Done" sub-section.
2. The Task Curator does a daily sweep to catch any drift.

### Step 10. Branch hygiene

1. Invoke `superpowers:finishing-a-development-branch`.
2. Delete the merged branch. Local cleanup. Pull main.

---

## 3. Restricted actions (red lines)

The following are forbidden for any agent. Doing them triggers an immediate revert and an escalation to the Engineering Lead. Repeated violation triggers a role suspension review by the Founder.

| Red line | Why |
|---|---|
| Merging your own PR | Two-person rule |
| Introducing a dependency outside blueprint §3 without an ADR | Locked stack |
| Modifying the Prisma schema in a PR without Database Engineer + Architecture Reviewer + Security Engineer approval | Schema is global state |
| Bypassing `@ogs/db`'s extension stack (soft-delete, tenant-scope, audit) via raw SQL | ISO 17024 audit defensibility |
| Committing `.env*`, generated Prisma clients, customer data, vendor secrets | Security |
| Sending mail outside `@ogs/email`'s Nodemailer SMTP transport | One-transport rule |
| Calling any payment provider outside `@ogs/payments` | Provider abstraction |
| Calling any AI provider outside `@ogs/ai/runtime/run-ai-task` | Telemetry + guardrails |
| Hard-deleting from a soft-deletable table | Auditability |
| Writing to AuditLog directly (not via the extension) | Append-only invariant |
| Changing `TASKS.md` to mark `[x]` without the closing PR merged | Status integrity |
| Speaking to a vendor / posting outside / making a commercial decision | Founder-only |
| Using `git push --force` to `main` | History integrity |
| Using `git commit --amend` on a pushed commit | History integrity |
| Disabling a pre-commit hook or CI check | Process integrity |
| Adding a third-party avatar library (DiceBear, BoringAvatars, etc.) | Blueprint §3.1 |
| Using Mux for VOD | Blueprint locks Bunny.net Stream |
| Adding ESLint/Prettier alternatives (Biome, dprint, etc.) | Blueprint §3 locks ESLint + Prettier |

---

## 4. Handoff protocol

When a task crosses ownership boundaries:

1. The originating agent finishes their slice and **stops at the boundary**. They do not implement code in the other agent's package.
2. They open a draft PR with their slice complete, and add a new `[ ] OGS-NNN` task in `TASKS.md` describing the work needed from the receiving agent.
3. They `@mention` the receiving agent in the PR. The Engineering Lead is the mention of last resort.
4. The receiving agent picks up the new task per §2.
5. The two PRs may be stacked (the second based on the first's branch) or merged sequentially. Stacked is preferred when the work is tightly coupled.

---

## 5. ADR (Architecture Decision Record) triggers

An ADR MUST be filed before code is written when any of these are true:

- Introducing or removing a runtime dependency.
- Changing a locked technology in blueprint §3.
- Splitting or merging a package.
- Changing a Prisma extension's behavior.
- Adding a new sensitive table or removing an existing one.
- Changing the authentication model.
- Changing the payment provider routing logic at the platform level.
- Introducing a new external vendor.
- Changing the data residency or backup posture.

The Architecture Reviewer is the sole owner of ADR acceptance. The Engineering Lead may expedite during a sev-1 incident.

---

## 6. Skill invocation matrix

When in doubt, this matrix tells you which skill to invoke. Apply the first row that matches.

| Situation | Skill to invoke first | Then |
|---|---|---|
| Starting any session | `superpowers:using-superpowers` | — |
| Open-ended creative work, designing | `superpowers:brainstorming` | `superpowers:writing-plans` |
| Implementing a feature or bug fix | `superpowers:test-driven-development` | `superpowers:verification-before-completion` |
| Investigating a bug | `superpowers:systematic-debugging` | TDD when root cause known |
| Have a spec, need a plan | `superpowers:writing-plans` | `superpowers:executing-plans` |
| Have a plan, executing in parallel | `superpowers:subagent-driven-development` | — |
| Need 2+ agents to work in parallel | `superpowers:dispatching-parallel-agents` | — |
| Asking for code review | `superpowers:requesting-code-review` | — |
| Receiving code review | `superpowers:receiving-code-review` | — |
| About to merge | `superpowers:verification-before-completion` | `superpowers:finishing-a-development-branch` |
| Authoring or editing a skill | `superpowers:writing-skills` | — |

---

## 7. Communication discipline

- **Async by default.** All agent-to-agent communication happens in PR comments and task notes. No chat.
- **PR comments stay scoped.** One PR = one task family. Do not discuss other work in a PR.
- **Founder-facing messages.** Only the Engineering Lead drafts messages for the Founder. The message includes: the question, the options considered, the recommendation, the cost of waiting.
- **Status updates.** The Engineering Lead posts a weekly summary in `docs/status/YYYY-WW.md` covering: deliverables met, risks moved, blockers cleared, next-week priorities.

---

## 8. The Task Curator's weekly sweep

Every Monday the Task Curator agent runs the following:

1. Open `TASKS.md`.
2. For every `[~]` task: confirm there is an open PR or branch. If not, revert to `[ ]` and notify the previous owner.
3. For every `[!]` task: confirm there is an entry in the Blockers register. If not, escalate.
4. For every `[?]` task: confirm there is an open ADR or open question in the Decision Log. If not, escalate.
5. For every PR merged this week: confirm the closed task is marked `[x]` and moved to the Done sub-section. Catch any drift.
6. Update the Decision Log with the week's ADRs.
7. Post the weekly sweep result to `docs/status/curator-YYYY-WW.md`.

---

## 9. CI / pre-commit enforcement (Phase 0 task)

Workflows defined in `.github/workflows/ci.yml` (created in Phase 0):

1. `verify-tasks-update` — fails the PR if `apps/**` or `packages/**` changed but `TASKS.md` did not.
2. `lint` — `eslint .` and `prettier --check .`.
3. `typecheck` — `turbo typecheck`.
4. `test` — `turbo test`.
5. `build` — `turbo build`.
6. `prisma-validate` — `prisma validate` on the multi-file schema.
7. `secret-scan` — gitleaks (or equivalent) on every commit.
8. `pr-template-check` — fails if the PR body does not include the `## Skills invoked` heading.

Pre-commit (Husky + lint-staged):
- `prettier --write` on staged files.
- `eslint --fix` on staged files.
- `pnpm typecheck` on the affected workspace.

---

## 10. When an agent should escalate to the Engineering Lead

- Blocker that lasts more than 4 hours.
- A red line is at risk.
- Two agents disagree after one review cycle.
- A vendor decision is needed.
- A commercial decision is needed.
- A timeline slip > 1 day.
- Anything affecting the Founder's roadmap commitments.

The Engineering Lead is the only agent that escalates to the Founder. The Engineering Lead's escalation format:

```
TITLE: <one short line>
CONTEXT: <2-3 sentences>
QUESTION: <one specific question>
OPTIONS: <list>
RECOMMENDATION: <one option, with rationale>
WAITING COST: <what blocks until decided>
```

---

## 11. Version control of this file

This file is owned by the Engineering Lead. Edits require:

- One reviewer (the Code Reviewer).
- Two reviewers (Code Reviewer + Architecture Reviewer) if the edit changes the team roster, the red lines, or the workflow steps.

This file's version: **v1** — generated at project bootstrap, aligned to blueprint v01.
