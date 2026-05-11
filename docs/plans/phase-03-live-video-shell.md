# Phase 03 — Live-Video Shell

> **For agentic workers:** REQUIRED SUB-SKILL: `superpowers:subagent-driven-development` or `superpowers:executing-plans`.
> Every step invokes `superpowers:using-superpowers` first; `SECURITY.md` and `CODE_STANDARDS.md` apply.

**Goal.** Bring up @ogs/live-video with Stream.io provider, token mutations, CallShell, webhook receiver with signature verification, and per-app webhook routes. A hardcoded LiveSession id opens a Stream room with lobby → active → ended.

**Exit criterion.** Stream webhook receives call.session_started and stores the entity status; the call lobby and active view render on web-academy / web-skillpass / web-careers.

**Window.** Week 3.

**Owning agents.** @live-video-engineer, @security-engineer, @api-engineer, @code-reviewer.

**Prerequisites.** Phase 02 complete.

**Security gates that apply.** Gate 1, Gate 3, Gate 7 (webhooks), Gate 9 (logging — recording URLs are sensitive).

---

## Macro task list

See `TASKS.md` for the macro task IDs OGS-170 through OGS-191. The Engineering Lead expands each to atomic steps following the Phase 0 pattern on the Friday before this phase opens.

### Required code listings (paste verbatim from blueprint)

- Stream provider init — Blueprint §12.1.\n- Token tRPC router — Blueprint §12.2.\n- CallShell + Lobby/Active/Ended — Blueprint §12.4 and §12.5.\n- Webhook receiver with signature verification + idempotency — Blueprint §12.6.\n- Canonical webhook receiver helper — Blueprint §20.2.

### Atomic-step template per task

Identical to Phase 1 `docs/plans/phase-01-foundation-rails.md` § "Atomic-step template per task". 13 steps from branch creation through PR merge.

### Phase exit verification (run by QA Engineer)

Verifies the canonical exit criterion above and all Wave-1 security gates remain enforced.

---

## Done

(Move completed tasks here.)

## Retro

(Filled at phase end.)
