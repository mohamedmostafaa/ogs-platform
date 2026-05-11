# Phase 08 — AI Eval Framework + Cost Dashboard

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
> Every step invokes `superpowers:using-superpowers` first; `SECURITY.md` and `CODE_STANDARDS.md` apply.

**Goal.** Ship the DAG runner, the executor registry, Inngest realtime channels, the use-task-status hook, seed eval datasets for the four W1 tasks, the runAIEval function with weekly cron, and the admin /ai-evals + /ai-cost pages.

**Exit criterion.** Weekly eval runs produce accuracy + latency + cost metrics surfaced in admin; the /ai-cost dashboard shows per-task / per-tenant / per-model rollups refreshed by a 6-hourly Inngest cron.

**Window.** Week 10.

**Owning agents.** @ai-engineer, @inngest-engineer, @frontend-feature-engineer, @database-engineer, @code-reviewer.

**Prerequisites.** Phase 07 complete.

**Security gates that apply.** Gate 4, Gate 9..

---

## Macro task list

See `TASKS.md` for the macro task IDs OGS-470 through OGS-492. The Engineering Lead expands each to atomic steps following the Phase 0 pattern on the Friday before this phase opens.

### Required code listings (paste verbatim from blueprint)

- DAG runner Inngest fn — Blueprint §13.6.\n- Topological sort — Blueprint §13.7.\n- Executor registry — Blueprint §13.8.\n- Realtime channels — Blueprint §13.3.\n- use-task-status hook — Blueprint §13.4.\n- AI cost rollup views — Blueprint §22.5.

### Atomic-step template per task

Identical to Phase 1 `docs/plans/phase-01-foundation-rails.md` § "Atomic-step template per task". 13 steps from branch creation through PR merge.

### Phase exit verification (run by QA Engineer)

Verifies the canonical exit criterion above and all Wave-1 security gates remain enforced.

---

## Done

(Move completed tasks here.)

## Retro

(Filled at phase end.)
