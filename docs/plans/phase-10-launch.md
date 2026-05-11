# Phase 10 — Hardening and Pilot Launch

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
> Every step invokes `superpowers:using-superpowers` first; `SECURITY.md` and `CODE_STANDARDS.md` apply.

**Goal.** Onboard three pilot customers covering Flow A, Flow F, and Flow G; ship GDPR data export + erasure; verify backups; tune Sentry alerts; meet the AI cost budget; run the Lighthouse and tRPC latency budgets; bring up apps/web-corporate marketing.

**Exit criterion.** Three pilots running real flows in production with no unresolved high-severity Sentry issues for 7 consecutive days; AI cost per MAU < USD 2; p95 list-page LCP ≤ 1.8s.

**Window.** Week 12.

**Owning agents.** @engineering-lead, @qa-engineer, @security-engineer, @devops-engineer, @docs-writer, @code-reviewer.

**Prerequisites.** Phase 09 complete.

**Security gates that apply.** All gates 1–10 + incident-response runbook live and tested..

---

## Macro task list

See `TASKS.md` for the macro task IDs OGS-600 through OGS-651. The Engineering Lead expands each to atomic steps following the Phase 0 pattern on the Friday before this phase opens.

### Required code listings (paste verbatim from blueprint)

- GDPR data export + erasure procedures — Blueprint §26.8 (TR-08).\n- Backup verification runbook — Blueprint §3.1 + Chapter 28.\n- Sentry alert tuning — Blueprint Chapter 22.\n- Wave-1 exit gate — Blueprint §24.2.

### Atomic-step template per task

Identical to Phase 1 `docs/plans/phase-01-foundation-rails.md` § "Atomic-step template per task". 13 steps from branch creation through PR merge.

### Phase exit verification (run by QA Engineer)

Verifies the canonical exit criterion above and all Wave-1 security gates remain enforced.

---

## Done

(Move completed tasks here.)

## Retro

(Filled at phase end.)
