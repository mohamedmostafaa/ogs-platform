# OGS Platform — Phase Plans

> Atomic, bite-sized implementation plans. One file per phase. Engineers execute these step-by-step. The single tracking index is `/TASKS.md` at the repo root.

## What lives here

- `_template.md` — the canonical plan shape. Copy when authoring a new phase.
- `phase-00-bootstrap.md` — Phase 0 (repo bootstrap). Fully expanded.
- `phase-01-foundation-rails.md` — Phase 1 (Week 1). Fully expanded.
- `phase-02-identity-hub.md` … `phase-10-launch.md` — placeholder macro lists until the phase opens, then expanded to atomic steps by the Engineering Lead the Friday before the phase starts.

## Granularity rule

Every step is one action, 2–5 minutes. Patterns:

- Write the failing test (with the test code shown).
- Run the test (with the command and expected output).
- Implement the minimal code (with the implementation shown).
- Run the test (with the command and expected output).
- Commit (with the exact commit message).

## How to read a step

```
- [ ] OGS-097.05  Implement EntityHeader props and render
      Owner: @ui-engineer
      Blueprint: §9.2
      File: packages/ui/src/data-display/entity.tsx
      Action: paste the EntityHeader function from the code block below.
      Verify: pnpm --filter @ogs/ui test passes.
      Commit: feat(ui): add EntityHeader [OGS-097.05]
```

## How to update

- When you start a step, change `[ ]` to `[~]` and add `Owner: @<role>` if missing.
- When you finish, change to `[x]` after CI is green on the PR. The Task Curator's weekly sweep catches drift.
- When the phase is complete, the Engineering Lead writes a one-paragraph retro at the bottom and links the related PRs.

## Naming

`phase-NN-<slug>.md` where `NN` is two-digit zero-padded. New sub-plans (spawned mid-phase) follow `phase-NN.x-<slug>.md`.

## Skill invocation discipline

Every step that involves writing or reading code starts with the agent invoking `superpowers:using-superpowers` then the most-specific applicable skill (per `AGENTS.md` §6 matrix). Plans assume this happens; they do not repeat it in every step.
